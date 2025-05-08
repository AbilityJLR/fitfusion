from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any, List
import uuid
import secrets
import string
import pyotp

from passlib.context import CryptContext
from jose import jwt

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_jwt_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access",
    extra_claims: dict = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Base claims
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "jti": str(uuid.uuid4()),  # Unique token ID
        "type": token_type,
        "iat": datetime.now(timezone.utc),  # Issued at
    }
    
    # Add any extra claims
    if extra_claims:
        to_encode.update(extra_claims)
        
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None,
    roles: List[str] = None
) -> str:
    extra_claims = {}
    if roles:
        extra_claims["roles"] = roles
        
    return generate_jwt_token(
        subject=subject,
        expires_delta=expires_delta,
        token_type="access",
        extra_claims=extra_claims
    )

def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    if not expires_delta:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    return generate_jwt_token(
        subject=subject,
        expires_delta=expires_delta,
        token_type="refresh"
    )

def generate_verification_token() -> str:
    """Generate a random token for email verification"""
    return secrets.token_urlsafe(32)

def generate_password_reset_token() -> str:
    """Generate a random token for password reset"""
    return secrets.token_urlsafe(32)

def generate_random_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_totp_secret() -> str:
    """Generate a secret key for TOTP-based 2FA"""
    return pyotp.random_base32()

def verify_totp(secret: str, token: str) -> bool:
    """Verify a TOTP token against the secret"""
    totp = pyotp.TOTP(secret)
    return totp.verify(token) 