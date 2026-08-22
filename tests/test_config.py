import os
import pytest
from pydantic import ValidationError
from app.config.settings import Settings

def test_valid_config_loads():
    """Verify valid settings configuration initializes correctly."""
    s = Settings(
        SECRET_KEY="valid-secret-key-production-2026",
        MASTER_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        DATABASE_URL="sqlite:///./test.db"
    )
    assert s.SECRET_KEY == "valid-secret-key-production-2026"
    assert len(s.MASTER_ENCRYPTION_KEY) >= 32

def test_missing_secret_key_detected():
    """Verify missing SECRET_KEY is detected and rejected."""
    with pytest.raises(ValidationError):
        Settings(
            SECRET_KEY="",
            MASTER_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        )

def test_invalid_short_master_key_rejected():
    """Verify short or invalid MASTER_ENCRYPTION_KEY is rejected."""
    with pytest.raises(ValidationError):
        Settings(
            SECRET_KEY="valid-secret",
            MASTER_ENCRYPTION_KEY="too_short"
        )
