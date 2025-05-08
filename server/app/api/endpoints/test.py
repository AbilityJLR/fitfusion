from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/users", response_model=List[UserSchema])
def read_users_for_test(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
) -> List[UserSchema]:
    """
    Retrieve users for testing database connection.
    This endpoint is for testing purposes only and should be secured in production.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users 