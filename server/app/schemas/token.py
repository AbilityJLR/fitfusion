from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    expires_at: Optional[int] = None


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[datetime] = None
    jti: Optional[str] = None  # JWT ID for unique token identification
    type: Optional[str] = None  # Token type (access or refresh)
    roles: Optional[List[str]] = None  # User roles for authorization


class RefreshTokenCreate(BaseModel):
    user_id: int
    token: str
    expires_at: datetime
    revoked: bool = False


class RefreshToken(RefreshTokenCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 