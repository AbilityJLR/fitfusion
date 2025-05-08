from typing import Any, List
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Request, BackgroundTasks, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, UserSelf
from app.core.security import get_password_hash, verify_password, generate_verification_token
from app.api.deps import get_current_active_user, get_current_active_superuser, check_user_roles
from app.core.email import send_verification_email
from app.core.rate_limiter import rate_limit
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Retrieve users.
    Requires admin privileges.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("/", response_model=UserSchema)
@rate_limit(limit=5, period=300, key_prefix="user_create")
async def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    request: Request,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Create new user.
    """
    try:
        logger.info(f"Attempting to create user with username: {user_in.username}")
        
        # Check if email already exists
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            logger.warning(f"Registration failed: Email already exists: {user_in.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists in the system.",
            )
            
        # Check if username already exists
        user = db.query(User).filter(User.username == user_in.username).first()
        if user:
            logger.warning(f"Registration failed: Username already exists: {user_in.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this username already exists in the system.",
            )
        
        # Create the user
        user_data = user_in.dict(exclude_unset=True)
        hashed_password = get_password_hash(user_data.pop("password"))
        
        # Generate verification token
        verification_token = generate_verification_token()
        verification_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
        
        # Get default role
        default_role = db.query(Role).filter(Role.is_default == True).first()
        
        # Create the user with verification token
        db_user = User(
            **user_data,
            hashed_password=hashed_password,
            is_verified=False,
            verification_token=verification_token,
            verification_token_expires_at=verification_token_expires_at
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Assign default role if it exists
        if default_role:
            db_user.roles.append(default_role)
            db.commit()
        
        # Send verification email
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        background_tasks.add_task(
            send_verification_email,
            user_email=db_user.email,
            verification_url=verification_url
        )
        
        logger.info(f"User created successfully: {db_user.username}")
        return db_user
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@router.get("/me", response_model=UserSelf)
async def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=UserSelf)
async def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_data = user_in.dict(exclude_unset=True)
    
    if "password" in user_data and user_data["password"]:
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    
    # Check if email is being changed
    if "email" in user_data and user_data["email"] != current_user.email:
        # Check if the new email already exists
        existing_email = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        # Generate new verification token
        verification_token = generate_verification_token()
        verification_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
        
        user_data["is_verified"] = False
        user_data["verification_token"] = verification_token
        user_data["verification_token_expires_at"] = verification_token_expires_at
        
        # TODO: Send verification email to new address
    
    # Check if username is being changed
    if "username" in user_data and user_data["username"] != current_user.username:
        # Check if the new username already exists
        existing_username = db.query(User).filter(User.username == user_data["username"]).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    for field in current_user_data:
        if field in user_data:
            setattr(current_user, field, user_data[field])
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: int,
    current_user: User = Depends(check_user_roles(["admin"])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get user by ID.
    Requires admin privileges.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Update a user.
    Requires admin privileges.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_in.dict(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field in update_data:
        setattr(user, field, update_data[field])
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=UserSchema)
async def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Delete a user.
    Requires admin privileges.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Don't allow deleting self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete own user account"
        )
    
    # Soft delete by deactivating the user
    user.is_active = False
    db.commit()
    return user


@router.post("/{user_id}/roles", response_model=UserSchema)
async def update_user_roles(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    role_ids: List[int] = Body(...),
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Update a user's roles.
    Requires admin privileges.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Clear existing roles
    user.roles = []
    
    # Add new roles
    for role_id in role_ids:
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
            user.roles.append(role)
    
    db.commit()
    db.refresh(user)
    return user 