import time
from typing import Dict, List, Tuple, Optional, Callable, Any
import asyncio
from fastapi import Request, HTTPException, status
from pydantic import BaseModel
import logging
import functools

logger = logging.getLogger(__name__)

class RateLimitRecord(BaseModel):
    """Record for rate limiting"""
    count: int = 0
    reset_at: float = 0

# In-memory store for rate limits
# Format: {key: RateLimitRecord}
rate_limit_store: Dict[str, RateLimitRecord] = {}

async def cleanup_expired_records() -> None:
    """Cleanup expired rate limit records periodically"""
    while True:
        try:
            current_time = time.time()
            keys_to_remove = []
            
            for key, record in rate_limit_store.items():
                if record.reset_at <= current_time:
                    keys_to_remove.append(key)
                    
            for key in keys_to_remove:
                del rate_limit_store[key]
                
            logger.debug(f"Rate limiter cleanup: removed {len(keys_to_remove)} expired records")
        except Exception as e:
            logger.error(f"Error in rate limiter cleanup: {e}")
        
        # Run every 5 minutes
        await asyncio.sleep(300)

def get_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        # Get the client's IP from the X-Forwarded-For header
        return x_forwarded_for.split(",")[0].strip()
    
    # Fallback to the client's direct IP
    client_host = request.client.host if request.client else "unknown"
    return client_host

def generate_rate_limit_key(request: Request, key_prefix: str) -> str:
    """Generate a unique key for rate limiting"""
    client_ip = get_client_ip(request)
    return f"{key_prefix}:{client_ip}"

def rate_limit(
    limit: int,
    period: int,
    key_prefix: str = "default",
    get_custom_key: Optional[Callable[[Request], str]] = None,
    error_message: str = "Too many requests. Please try again later.",
):
    """
    Rate limiting decorator for FastAPI routes
    
    Parameters:
    - limit: Maximum number of requests allowed in the period
    - period: Time period in seconds
    - key_prefix: Prefix for the rate limit key (for different limit types)
    - get_custom_key: Optional function to generate a custom key from the request
    - error_message: Custom error message for rate limit exceeded
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Find the request object in the arguments
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
                    
            if not request:
                for _, arg in kwargs.items():
                    if isinstance(arg, Request):
                        request = arg
                        break
                        
            if not request:
                logger.warning("Rate limit decorator used but no Request object found")
                return await func(*args, **kwargs)
                
            # Generate rate limit key
            if get_custom_key:
                rate_limit_key = get_custom_key(request)
            else:
                rate_limit_key = generate_rate_limit_key(request, key_prefix)
                
            # Check rate limit
            current_time = time.time()
            record = rate_limit_store.get(rate_limit_key)
            
            if record is None:
                # First request, create new record
                record = RateLimitRecord(count=1, reset_at=current_time + period)
                rate_limit_store[rate_limit_key] = record
            elif record.reset_at <= current_time:
                # Period expired, reset counter
                record.count = 1
                record.reset_at = current_time + period
            elif record.count >= limit:
                # Rate limit exceeded
                retry_after = int(record.reset_at - current_time)
                logger.warning(f"Rate limit exceeded for {rate_limit_key}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_message,
                    headers={"Retry-After": str(retry_after)}
                )
            else:
                # Increment counter
                record.count += 1
                
            # Set rate limit headers
            # These will be added to the response in middleware
            request.state.rate_limit_headers = {
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": str(max(0, limit - record.count)),
                "X-RateLimit-Reset": str(int(record.reset_at))
            }
            
            # Call the original function
            return await func(*args, **kwargs)
            
        return wrapper
    return decorator 