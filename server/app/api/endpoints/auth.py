from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import uuid
import qrcode
import io
import base64
from urllib.parse import urlencode

from fastapi import APIRouter, Body, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from jose import jwt, JWTError
from pydantic import ValidationError

from app.db.database import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token, create_refresh_token, verify_password, get_password_hash,
    generate_password_reset_token, generate_verification_token, generate_totp_secret,
    verify_totp
)
from app.core.email import send_verification_email, send_password_reset_email
from app.core.rate_limiter import rate_limit
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.token import Token, TokenPayload
from app.schemas.user import (
    UserCreate, ForgotPassword, ResetPassword, TwoFactorSetup,
    TwoFactorVerify, ChangePassword
)
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/login")
@rate_limit(limit=5, period=60, key_prefix="login")
async def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Attempt to find user by email or username
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        user = db.query(User).filter(User.username == form_data.username).first()
    
    # Check credentials
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Check if two-factor authentication is enabled
    if user.two_factor_enabled:
        # Return a special response indicating 2FA is needed
        # Frontend should prompt for TOTP code and call /verify-2fa endpoint
        return {
            "detail": "two_factor_required",
            "user_id": user.id,
        }
    
    # Update last login time
    user.last_login = func.now()
    db.commit()
    
    # Get user roles
    roles = [role.name for role in user.roles] if user.roles else []
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(
        user.id, expires_delta=access_token_expires, roles=roles
    )
    refresh_token_value = create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Store refresh token in database
    refresh_token = RefreshToken(
        token=refresh_token_value,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + refresh_token_expires
    )
    db.add(refresh_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token_value,
        "expires_at": int((datetime.now(timezone.utc) + access_token_expires).timestamp())
    }

@router.post("/verify-2fa", response_model=Token)
@rate_limit(limit=5, period=60, key_prefix="verify_2fa")
async def verify_two_factor(
    *,
    db: Session = Depends(get_db),
    data: TwoFactorVerify,
    user_id: int = Body(...),
) -> Any:
    """
    Verify two-factor authentication code
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.two_factor_enabled or not user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user or 2FA not enabled"
        )
    
    if not verify_totp(user.two_factor_secret, data.token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication code"
        )
    
    # Update last login time
    user.last_login = func.now()
    db.commit()
    
    # Get user roles
    roles = [role.name for role in user.roles] if user.roles else []
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(
        user.id, expires_delta=access_token_expires, roles=roles
    )
    refresh_token_value = create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Store refresh token in database
    refresh_token = RefreshToken(
        token=refresh_token_value,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + refresh_token_expires
    )
    db.add(refresh_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token_value,
        "expires_at": int((datetime.now(timezone.utc) + access_token_expires).timestamp())
    }

@router.post("/refresh", response_model=Token)
@rate_limit(limit=10, period=60, key_prefix="refresh_token")
async def refresh_token(
    *,
    db: Session = Depends(get_db),
    refresh_token: str = Body(..., embed=True)
) -> Any:
    """
    Refresh access token
    """
    try:
        # Decode refresh token to get user ID
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        # Verify token type
        if token_data.type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
            
        user_id = token_data.sub
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check if refresh token exists in database
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or revoked"
        )
    
    # Check if refresh token has expired
    if db_token.expires_at < datetime.now(timezone.utc):
        db_token.revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Get user roles
    roles = [role.name for role in user.roles] if user.roles else []
    
    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(
        user.id, expires_delta=access_token_expires, roles=roles
    )
    new_refresh_token = create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Revoke old refresh token
    db_token.revoked = True
    
    # Store new refresh token
    new_db_token = RefreshToken(
        token=new_refresh_token,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + refresh_token_expires
    )
    
    db.add(new_db_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
        "expires_at": int((datetime.now(timezone.utc) + access_token_expires).timestamp())
    }

@router.post("/logout")
async def logout(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Logout user by revoking the refresh token
    """
    # Find and revoke the refresh token
    token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.user_id == current_user.id
    ).first()
    
    if token:
        token.revoked = True
        db.commit()
    
    return {"detail": "Successfully logged out"}

@router.post("/request-password-reset")
@rate_limit(limit=3, period=3600, key_prefix="password_reset")
async def request_password_reset(
    email_in: ForgotPassword,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    request: Request = None
) -> Any:
    """
    Request a password reset link
    """
    user = db.query(User).filter(User.email == email_in.email).first()
    
    # Always return a successful response to prevent user enumeration
    if not user or not user.is_active:
        return {"detail": "If a registered account with this email exists, a password reset link has been sent."}
    
    # Generate password reset token
    reset_token = generate_password_reset_token()
    
    # Set expiration time
    expiration = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    
    # Update user record
    user.password_reset_token = reset_token
    user.password_reset_token_expires_at = expiration
    db.commit()
    
    # Generate reset URL
    # This would be frontend URL that handles password reset
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    # Send email in background
    background_tasks.add_task(
        send_password_reset_email,
        user_email=user.email,
        reset_url=reset_url
    )
    
    return {"detail": "If a registered account with this email exists, a password reset link has been sent."}

@router.post("/reset-password")
@rate_limit(limit=5, period=60, key_prefix="reset_password")
async def reset_password(
    reset_data: ResetPassword,
    db: Session = Depends(get_db)
) -> Any:
    """
    Reset password with token
    """
    user = db.query(User).filter(
        User.password_reset_token == reset_data.token,
        User.is_active == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    # Check if token has expired
    if not user.password_reset_token_expires_at or user.password_reset_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    
    # Clear reset token
    user.password_reset_token = None
    user.password_reset_token_expires_at = None
    
    # Revoke all refresh tokens for security
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({"revoked": True})
    
    db.commit()
    
    return {"detail": "Password has been reset successfully"}

@router.post("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Verify email address with token
    """
    user = db.query(User).filter(
        User.verification_token == token,
        User.is_active == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    # Check if token has expired
    if (
        not user.verification_token_expires_at or 
        user.verification_token_expires_at < datetime.now(timezone.utc)
    ):
        # Generate a new token if expired
        new_token = generate_verification_token()
        expiration = datetime.now(timezone.utc) + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
        
        user.verification_token = new_token
        user.verification_token_expires_at = expiration
        db.commit()
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={new_token}"
        
        return {
            "detail": "Verification token expired. A new verification link has been generated.",
            "verification_url": verification_url
        }
    
    # Mark user as verified
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()
    
    return {"detail": "Email verified successfully"}

@router.post("/setup-2fa")
async def setup_two_factor(
    setup: TwoFactorSetup,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Setup or disable two-factor authentication
    """
    if setup.enable:
        # Generate new TOTP secret
        secret = generate_totp_secret()
        
        # Save to user
        current_user.two_factor_secret = secret
        db.commit()
        
        # Generate QR code
        totp_uri = f"otpauth://totp/{settings.PROJECT_NAME}:{current_user.email}?secret={secret}&issuer={settings.PROJECT_NAME}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered)
        img_str = base64.b64encode(buffered.getvalue()).decode('ascii')
        
        return {
            "secret": secret,
            "qr_code": f"data:image/png;base64,{img_str}",
            "is_enabled": False
        }
    else:
        # Disable 2FA
        current_user.two_factor_enabled = False
        current_user.two_factor_secret = None
        db.commit()
        
        # Revoke all refresh tokens for security
        db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).update({"revoked": True})
        
        return {"detail": "Two-factor authentication disabled successfully"}

@router.post("/verify-2fa-setup")
async def verify_two_factor_setup(
    *,
    db: Session = Depends(get_db),
    data: TwoFactorVerify,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Verify and enable two-factor authentication setup
    """
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication not set up"
        )
    
    if verify_totp(current_user.two_factor_secret, data.token):
        # Enable 2FA
        current_user.two_factor_enabled = True
        db.commit()
        
        # Revoke all refresh tokens for security
        db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).update({"revoked": True})
        
        return {"detail": "Two-factor authentication enabled successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )

@router.post("/change-password")
async def change_password(
    *,
    db: Session = Depends(get_db),
    data: ChangePassword,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Change user password
    """
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    
    # Revoke all refresh tokens for security
    db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).update({"revoked": True})
    
    return {"detail": "Password changed successfully"} 