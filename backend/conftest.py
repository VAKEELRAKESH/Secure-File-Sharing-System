import pytest
from app.core.rate_limiter import limiter

@pytest.fixture(autouse=True)
def disable_limiter_during_tests():
    """Automatically disable slowapi rate limiter during pytest executions."""
    limiter.enabled = False
    yield
    limiter.enabled = True
