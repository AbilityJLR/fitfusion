from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import asyncio

from app.core.config import settings
from app.api.api import api_router
from app.db.database import get_db
from app.db.init_db import init_db
from app.core.middleware import setup_middleware
from app.core.rate_limiter import cleanup_expired_records

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up middleware including CORS, security headers, and rate limiting
setup_middleware(app)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to FitFusion API. Navigate to /docs for API documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    """Tasks to run on application startup."""
    # Initialize database
    db = next(get_db())
    init_db(db)
    
    # Start rate limiting cleanup task
    asyncio.create_task(cleanup_expired_records())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True) 