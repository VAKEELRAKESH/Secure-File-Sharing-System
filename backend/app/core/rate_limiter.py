import os
import json
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

def get_ip_and_account_key(request: Request) -> str:
    """
    Generate rate-limit key combining client IP and target account email/username
    to prevent distributed brute-force attacks across rotating IPs.
    """
    ip = get_remote_address(request)
    
    # Check if target email was passed via query params or request headers
    email = request.query_params.get("email") or request.headers.get("X-Target-Account")
    if email:
        return f"{ip}:{email.lower().strip()}"
    return ip

def is_limiter_enabled():
    if os.getenv("TESTING") == "1" or "PYTEST_CURRENT_TEST" in os.environ:
        return False
    return True

# Global rate limiter instance
limiter = Limiter(key_func=get_ip_and_account_key, default_limits=["100/minute"], enabled=is_limiter_enabled())
