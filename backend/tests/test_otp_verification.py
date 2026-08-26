import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.core.database import SessionLocal
from app.models.user import User

client = TestClient(app)

def test_unverified_login_blocked():
    """Verify that a user who has registered but not verified their email is blocked from logging in."""
    email = "unverified@trustshare.com"
    
    # Clean up user if they exist
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # 1. Register User
    reg_res = client.post("/api/auth/register", json={
        "username": "unverified_user",
        "email": email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200
    assert reg_res.json()["is_verified"] is False

    # 2. Try to log in immediately
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_res.status_code == 403
    assert "Email verification required" in login_res.json()["detail"]


def test_invalid_otp_rejection():
    """Verify that verify-otp rejects incorrect verification codes."""
    email = "invalidotp@trustshare.com"
    
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # Register User
    reg_res = client.post("/api/auth/register", json={
        "username": "invalidotp_user",
        "email": email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200

    # Try verifying with an invalid OTP code
    verify_res = client.post("/api/auth/verify-otp", json={
        "email": email,
        "otp": "999999"
    })
    assert verify_res.status_code == 400
    assert "Invalid verification code" in verify_res.json()["detail"]

    # Verify database state remains unverified
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    assert user.is_verified is False
    db.close()


def test_expired_otp_rejection():
    """Verify that verify-otp rejects expired verification codes."""
    email = "expiredotp@trustshare.com"
    
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # Register User
    reg_res = client.post("/api/auth/register", json={
        "username": "expiredotp_user",
        "email": email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200

    # Manually expire the OTP in the database
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    otp_code = user.verification_otp
    user.otp_expires_at = datetime.utcnow() - timedelta(minutes=5)
    db.commit()
    db.close()

    # Attempt to verify with the correct but expired OTP
    verify_res = client.post("/api/auth/verify-otp", json={
        "email": email,
        "otp": otp_code
    })
    assert verify_res.status_code == 400
    assert "expired" in verify_res.json()["detail"].lower()


def test_resend_otp_flow():
    """Verify that requesting a new verification code creates a fresh OTP with a reset expiry."""
    email = "resendotp@trustshare.com"
    
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # Register User
    reg_res = client.post("/api/auth/register", json={
        "username": "resendotp_user",
        "email": email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200

    # Get the original OTP and expiry
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    original_otp = user.verification_otp
    original_expiry = user.otp_expires_at
    db.close()

    # Call resend-otp
    resend_res = client.post("/api/auth/resend-otp", json={
        "email": email
    })
    assert resend_res.status_code == 200

    # Verify a new OTP was generated and the expiry was refreshed
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    assert user.verification_otp != original_otp
    assert user.otp_expires_at > original_expiry
    db.close()


def test_successful_otp_verification():
    """Verify that entering the correct OTP successfully unlocks the account and logs in."""
    email = "successotp@trustshare.com"
    
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # Register User
    reg_res = client.post("/api/auth/register", json={
        "username": "successotp_user",
        "email": email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200

    # Retrieve the OTP code from database
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    otp_code = user.verification_otp
    db.close()

    # Call verify-otp
    verify_res = client.post("/api/auth/verify-otp", json={
        "email": email,
        "otp": otp_code
    })
    assert verify_res.status_code == 200
    res_data = verify_res.json()
    assert "access_token" in res_data
    assert "refresh_token" in res_data
    assert res_data["user"]["is_verified"] is True

    # Verify database fields are cleared/updated
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    assert user.is_verified is True
    assert user.verification_otp is None
    assert user.otp_expires_at is None
    db.close()

    # Verify user can login now
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
