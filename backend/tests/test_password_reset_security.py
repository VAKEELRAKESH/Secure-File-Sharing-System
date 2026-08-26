import pytest
from fastapi.testclient import TestClient
from main import app
from app.security.reset_token import create_reset_token

client = TestClient(app)

def test_forgot_password_does_not_leak_reset_token():
    """Verify /forgot-password response NEVER contains reset_token to prevent account takeover."""
    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == "victim@trustshare.com").first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # Register test user
    reg_res = client.post("/api/auth/register", json={
        "username": "pwdreset_victim",
        "email": "victim@trustshare.com",
        "password": "OriginalPassword123!"
    })
    assert reg_res.status_code == 200

    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    user = db.query(User).filter(User.email == "victim@trustshare.com").first()
    if user and not user.is_verified:
        user.is_verified = True
        db.commit()
    db.close()

    # Call forgot-password
    forgot_res = client.post("/api/auth/forgot-password", json={
        "email": "victim@trustshare.com"
    })
    assert forgot_res.status_code == 200
    res_data = forgot_res.json()

    # CRITICAL SECURITY CHECK: reset_token MUST NOT be present in response
    assert "reset_token" not in res_data
    assert "token" not in res_data
    assert "message" in res_data
    assert "If an account with that email exists" in res_data["message"]

def test_password_reset_requires_valid_out_of_band_token():
    """Verify password cannot be reset with bogus token, but succeeds with valid out-of-band token."""
    email = "victim2@trustshare.com"
    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    client.post("/api/auth/register", json={
        "username": "pwdreset_victim2",
        "email": email,
        "password": "OriginalPassword123!"
    })

    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user and not user.is_verified:
        user.is_verified = True
        db.commit()
    db.close()

    # Attempt reset with fake token
    fake_reset_res = client.post("/api/auth/reset-password", json={
        "email": email,
        "token": "bogus.invalid.jwt.token",
        "new_password": "HackedPassword123!"
    })

    assert fake_reset_res.status_code == 400
    assert "Invalid or expired reset token" in fake_reset_res.json()["detail"]

    # Verify user can still login with original password
    login_orig = client.post("/api/auth/login", json={
        "email": email,
        "password": "OriginalPassword123!"
    })
    assert login_orig.status_code == 200

    # Simulate legitimate out-of-band token receipt and valid reset
    valid_token = create_reset_token(email)
    valid_reset_res = client.post("/api/auth/reset-password", json={
        "email": email,
        "token": valid_token,
        "new_password": "NewSecurePassword456!"
    })
    assert valid_reset_res.status_code == 200

    # Verify user can login with new password
    login_new = client.post("/api/auth/login", json={
        "email": email,
        "password": "NewSecurePassword456!"
    })
    assert login_new.status_code == 200
