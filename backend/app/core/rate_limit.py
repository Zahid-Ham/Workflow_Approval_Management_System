import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    In-memory rate limiter template/implementation.
    Tracks client IP addresses and enforces rate limits.
    """
    def __init__(self, requests_limit: int = 100, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # Stores IP -> (list of request timestamps)
        self.clients: Dict[str, list] = {}

    def is_rate_limited(self, ip_address: str) -> bool:
        """
        Check if the incoming request from ip_address exceeds limits.
        """
        now = time.time()
        
        # Initialize client if not present
        if ip_address not in self.clients:
            self.clients[ip_address] = []
            
        # Clean timestamps older than the window
        self.clients[ip_address] = [
            t for t in self.clients[ip_address] 
            if now - t < self.window_seconds
        ]
        
        # Enforce limit
        if len(self.clients[ip_address]) >= self.requests_limit:
            return True
            
        self.clients[ip_address].append(now)
        return False

# Global instance prepared for 100 requests per minute
limiter = InMemoryRateLimiter(requests_limit=100, window_seconds=60)

async def rate_limit_dependency(request: Request):
    """
    FastAPI Dependency that checks rate limiting.
    Add Depends(rate_limit_dependency) to routes or globally to apply.
    """
    client_ip = request.client.host if request.client else "unknown"
    if limiter.is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
