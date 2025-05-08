from typing import Any, List
import logging

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.user import Role as RoleSchema
from app.api.deps import check_user_roles

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[RoleSchema])
async def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Get all roles.
    Requires admin privileges.
    """
    return db.query(Role).all()

@router.post("/", response_model=RoleSchema)
async def create_role(
    *,
    db: Session = Depends(get_db),
    name: str = Body(...),
    description: str = Body(None),
    is_default: bool = Body(False),
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Create a new role.
    Requires admin privileges.
    """
    # Check if role already exists
    role = db.query(Role).filter(Role.name == name).first()
    if role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with name '{name}' already exists"
        )
    
    # If this is a default role, unset any existing default role
    if is_default:
        db.query(Role).filter(Role.is_default == True).update({"is_default": False})
    
    # Create role
    role = Role(name=name, description=description, is_default=is_default)
    db.add(role)
    db.commit()
    db.refresh(role)
    
    return role

@router.get("/{role_id}", response_model=RoleSchema)
async def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Get a role by ID.
    Requires admin privileges.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role

@router.put("/{role_id}", response_model=RoleSchema)
async def update_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    name: str = Body(None),
    description: str = Body(None),
    is_default: bool = Body(None),
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Update a role.
    Requires admin privileges.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Update fields if provided
    if name is not None:
        # Check if another role with this name exists
        existing = db.query(Role).filter(Role.name == name, Role.id != role_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role with name '{name}' already exists"
            )
        role.name = name
    
    if description is not None:
        role.description = description
    
    if is_default is not None:
        if is_default:
            # Unset any existing default role
            db.query(Role).filter(Role.is_default == True).update({"is_default": False})
        role.is_default = is_default
    
    db.commit()
    db.refresh(role)
    
    return role

@router.delete("/{role_id}", response_model=RoleSchema)
async def delete_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    current_user: User = Depends(check_user_roles(["admin"]))
) -> Any:
    """
    Delete a role.
    Requires admin privileges.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Check if role is in use
    if role.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete role that is assigned to users"
        )
    
    db.delete(role)
    db.commit()
    
    return role 