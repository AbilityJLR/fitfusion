from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp
import time
import logging
from typing import Callable

from app.core.config import settings

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        if settings.ENVIRONMENT == "production":
            # Add strict security headers in production
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "connect-src 'self';"
            )
            
        return response

class RateLimitHeadersMiddleware(BaseHTTPMiddleware):
    """Add rate limit headers to responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add rate limit headers if they exist
        if hasattr(request.state, "rate_limit_headers"):
            for header_name, header_value in request.state.rate_limit_headers.items():
                response.headers[header_name] = header_value
                
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log information about requests"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(",")[0].strip()
        
        # Process the request
        try:
            response = await call_next(request)
            
            # Log successful request
            process_time = time.time() - start_time
            status_code = response.status_code
            logger.info(
                f"{request.method} {request.url.path} {status_code} "
                f"[{process_time:.3f}s] - {client_ip}"
            )
            
            return response
        except Exception as e:
            # Log exception
            process_time = time.time() - start_time
            logger.error(
                f"{request.method} {request.url.path} 500 "
                f"[{process_time:.3f}s] - {client_ip} - {str(e)}"
            )
            raise
            
def setup_middleware(app: FastAPI) -> None:
    """Configure middleware for the application"""
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add security headers middleware
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Add rate limit headers middleware
    app.add_middleware(RateLimitHeadersMiddleware)
    
    # Add request logging middleware
    app.add_middleware(RequestLoggingMiddleware) 