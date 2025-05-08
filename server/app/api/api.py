from fastapi import APIRouter

from app.api.endpoints import auth, users, test, roles

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(test.router, prefix="/test", tags=["test"]) 