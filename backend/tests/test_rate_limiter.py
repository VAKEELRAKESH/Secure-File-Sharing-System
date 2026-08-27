import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.rate_limiter import limiter

client = TestClient(app)

def test_login_rate_limiting():
    """Verify that hitting the login endpoint repeatedly triggers a 429 Too Many Requests response."""
    # Temporarily enable rate limiter for this specific test
    limiter.enabled = True
    try:
        responses = []
        for i in range(12):
            res = client.post("/api/auth/login", json={
                "email": f"ratetest_{i}@trustshare.com",
                "password": "WrongPassword123!"
            })
            responses.append(res.status_code)
        
        assert 429 in responses or responses[-1] == 429, f"Expected 429 status code in responses, got {responses}"
    finally:
        limiter.enabled = False
