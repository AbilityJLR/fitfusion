import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional, List

# Load environment variables based on environment
env = os.getenv("ENV", "development")
if env == "production":
    load_dotenv("production.env")
else:
    load_dotenv("development.env")

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FitFusion"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENV", "development")
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fitfusion")
    
    # Frontend URL for redirects
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_here_change_this_in_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Email Verification and Password Reset
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = int(os.getenv("VERIFICATION_TOKEN_EXPIRE_HOURS", "24"))
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "15"))
    
    # Email settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@fitfusion.com")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "FitFusion")
    
    # Rate limiting
    RATE_LIMIT_SIGNIN_MINUTE: int = int(os.getenv("RATE_LIMIT_SIGNIN_MINUTE", "5"))
    RATE_LIMIT_EMAIL_HOUR: int = int(os.getenv("RATE_LIMIT_EMAIL_HOUR", "3"))
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://fitfusion.fly.dev"
    ]
    if os.getenv("ENVIRONMENT") == "development":
        BACKEND_CORS_ORIGINS.append("*")
    
    # Security
    SECURITY_PASSWORD_SALT: str = os.getenv("SECURITY_PASSWORD_SALT", "your_salt_here_change_this_in_production")
    SESSION_COOKIE_SECURE: bool = os.getenv("ENVIRONMENT") == "production"
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SAMESITE: str = "Lax"
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings() 