import os
import io
import time
import pytest
import asyncio
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from main import app
from app.core.database import SessionLocal, get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.share import FileShare
from app.models.audit import AuditLog
from app.core.crypto import crypto_service
from app.core.security import create_access_token, create_refresh_token

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# SUITE A: Authentication & Identity
# -------------------------------------------------------------
def test_suite_a_auth_full_lifecycle(db_session):
    """Happy Path: User registration, OTP activation, JWT login, and refresh."""
    email = "qa_suite_a@trustshare.io"
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    # 1. Register
    reg = client.post("/api/auth/register", json={
        "username": "qa_suite_a_user",
        "email": email,
        "password": "StrongPassword2026!"
    })
    assert reg.status_code == 200
    user_data = reg.json()
    assert user_data["is_verified"] is False

    # 2. Extract OTP and Verify
    user_db = db_session.query(User).filter(User.email == email).first()
    assert user_db.verification_otp is not None
    otp = user_db.verification_otp

    verify = client.post("/api/auth/verify-otp", json={
        "email": email,
        "otp": otp
    })
    assert verify.status_code == 200
    assert "access_token" in verify.json()

    # 3. Login
    login = client.post("/api/auth/login", json={
        "email": email,
        "password": "StrongPassword2026!"
    })
    assert login.status_code == 200
    tokens = login.json()
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # 4. Refresh Token
    refresh_res = client.post("/api/auth/token/refresh", headers={
        "Authorization": f"Bearer {refresh_token}"
    })
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()

def test_suite_a_tampered_and_expired_jwt():
    """Negative: Verify expired and signature-tampered JWT rejection."""
    # 1. Tampered signature
    tampered_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdHRhY2tlckBldmlsLmNvbSIsInJvbGUiOiJhZG1pbiJ9.invalidsignature1234567890"
    res = client.get("/api/files", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res.status_code == 401

    # 2. Expired token
    expired_token = create_access_token({"sub": "qa_suite_a@trustshare.io", "role": "user"}, expires_delta=timedelta(seconds=-60))
    res_exp = client.get("/api/files", headers={"Authorization": f"Bearer {expired_token}"})
    assert res_exp.status_code == 401

def test_suite_a_sqli_resilience():
    """Security: Verify SQL injection payloads in auth inputs are safely parameterized."""
    sqli_payloads = [
        "' OR '1'='1",
        "admin'--",
        "'; DROP TABLE users; --",
        "' UNION SELECT null, null, null--"
    ]
    for p in sqli_payloads:
        res = client.post("/api/auth/login", json={
            "email": p,
            "password": "Password123!"
        })
        # Should cleanly return 401/422 without 500 database error
        assert res.status_code in [401, 422]

# -------------------------------------------------------------
# SUITE B: File Ingestion & Cryptographic Processing
# -------------------------------------------------------------
def test_suite_b_cryptographic_integrity_and_tampering(db_session):
    """Cryptographic Integrity: Verify tampering with 1 byte of stored ciphertext fails with authentication tag mismatch."""
    email = "crypto_qa@trustshare.io"
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    # Create & verify user
    user = User(username="crypto_user", email=email, hashed_password="pw", role="user", is_verified=True)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token({"sub": email, "role": "user"})
    headers = {"Authorization": f"Bearer {token}"}

    # Upload file
    plaintext = b"SECRET_FINANCIAL_RECORD_2026_DO_NOT_LEAK"
    upload_res = client.post("/api/files/upload", headers=headers, files={
        "file": ("financial.txt", plaintext, "text/plain")
    })
    assert upload_res.status_code == 200
    file_id = upload_res.json()["id"]

    db_file = db_session.query(FileModel).filter(FileModel.id == file_id).first()
    storage_path = db_file.encrypted_path

    # Verify normal download works
    down_res = client.get(f"/api/files/{file_id}/download", headers=headers)
    assert down_res.status_code == 200
    assert down_res.content == plaintext

    # Tamper with 1 byte of the ciphertext file
    with open(storage_path, "r+b") as f:
        data = bytearray(f.read())
        # Flip bit in ciphertext body (after 12-byte nonce)
        data[15] ^= 0xFF
        f.seek(0)
        f.write(data)

    # Attempt download after tampering
    tampered_res = client.get(f"/api/files/{file_id}/download", headers=headers)
    # Must fail securely because AES-256-GCM authentication tag verification fails
    assert tampered_res.status_code == 500
    assert "Decryption error" in tampered_res.json()["detail"]

def test_suite_b_crypto_shredding(db_session):
    """Crypto-Shredding: Deleting a file permanently removes ciphertext from disk and destroys its encrypted DEK."""
    email = "shred_qa@trustshare.io"
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    user = User(username="shred_user", email=email, hashed_password="pw", role="user", is_verified=True)
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": email, "role": "user"})
    headers = {"Authorization": f"Bearer {token}"}

    upload_res = client.post("/api/files/upload", headers=headers, files={
        "file": ("confidential.pdf", b"CONFIDENTIAL_PAYLOAD", "application/pdf")
    })
    assert upload_res.status_code == 200
    file_id = upload_res.json()["id"]

    db_file = db_session.query(FileModel).filter(FileModel.id == file_id).first()
    file_path = db_file.encrypted_path
    assert os.path.exists(file_path)

    # Delete file
    del_res = client.delete(f"/api/files/{file_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify physical file is shredded (deleted from disk)
    assert not os.path.exists(file_path)
    # Verify metadata & wrapped DEK is removed from DB
    assert db_session.query(FileModel).filter(FileModel.id == file_id).first() is None

# -------------------------------------------------------------
# SUITE C: Share Link Lifecycle & Granular Access Control
# -------------------------------------------------------------
def test_suite_c_share_link_expiration_and_passphrase(db_session):
    """Verify share link expiration enforcement and passphrase verification."""
    email = "shares_qa@trustshare.io"
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    user = User(username="shares_user", email=email, hashed_password="pw", role="user", is_verified=True)
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": email, "role": "user"})
    headers = {"Authorization": f"Bearer {token}"}

    upload_res = client.post("/api/files/upload", headers=headers, files={
        "file": ("document.docx", b"DOCX_PAYLOAD_TEST", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    })
    file_id = upload_res.json()["id"]

    # 1. Create passphrase-protected share link
    share_res = client.post("/api/shares", headers=headers, json={
        "file_id": file_id,
        "permission": "download",
        "passphrase": "ProtectedPassphrase123!",
        "expires_in_hours": 1,
        "max_downloads": 2
    })
    assert share_res.status_code == 200
    share_token = share_res.json()["share_token"]

    # 2. Access info without auth
    info_res = client.get(f"/api/shares/access/{share_token}/info")
    assert info_res.status_code == 200
    assert info_res.json()["requires_passphrase"] is True

    # 3. Download with wrong passphrase -> 401
    wrong_pw = client.post(f"/api/shares/access/{share_token}/download", json={"passphrase": "WrongPassword"})
    assert wrong_pw.status_code == 401

    # 4. Download with correct passphrase -> 200
    correct_pw = client.post(f"/api/shares/access/{share_token}/download", json={"passphrase": "ProtectedPassphrase123!"})
    assert correct_pw.status_code == 200
    assert correct_pw.content == b"DOCX_PAYLOAD_TEST"

    # 5. Simulate expired link
    db_share = db_session.query(FileShare).filter(FileShare.share_token == share_token).first()
    db_share.expires_at = datetime.utcnow() - timedelta(minutes=5)
    db_session.commit()

    expired_info = client.get(f"/api/shares/access/{share_token}/info")
    assert expired_info.status_code == 410

    expired_down = client.post(f"/api/shares/access/{share_token}/download", json={"passphrase": "ProtectedPassphrase123!"})
    assert expired_down.status_code == 410

def test_suite_c_idor_access_control(db_session):
    """IDOR Check: Ensure User A cannot download, view, or delete User B's files."""
    user_a_email = "user_a@trustshare.io"
    user_b_email = "user_b@trustshare.io"

    db_session.query(User).filter(User.email.in_([user_a_email, user_b_email])).delete()
    db_session.commit()

    user_a = User(username="user_a", email=user_a_email, hashed_password="pw", role="user", is_verified=True)
    user_b = User(username="user_b", email=user_b_email, hashed_password="pw", role="user", is_verified=True)
    db_session.add_all([user_a, user_b])
    db_session.commit()

    token_a = create_access_token({"sub": user_a_email, "role": "user"})
    token_b = create_access_token({"sub": user_b_email, "role": "user"})

    # User B uploads a private file
    upload_res = client.post("/api/files/upload", headers={"Authorization": f"Bearer {token_b}"}, files={
        "file": ("user_b_private.pdf", b"USER_B_SECRET_DATA", "application/pdf")
    })
    assert upload_res.status_code == 200
    user_b_file_id = upload_res.json()["id"]

    # User A attempts to download User B's file -> 403 Forbidden
    idor_down = client.get(f"/api/files/{user_b_file_id}/download", headers={"Authorization": f"Bearer {token_a}"})
    assert idor_down.status_code == 403

    # User A attempts to delete User B's file -> 403 Forbidden
    idor_del = client.delete(f"/api/files/{user_b_file_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert idor_del.status_code == 403

    # User A lists files -> User B's file should NOT appear
    list_res = client.get("/api/files", headers={"Authorization": f"Bearer {token_a}"})
    file_ids = [f["id"] for f in list_res.json()]
    assert user_b_file_id not in file_ids

# -------------------------------------------------------------
# SUITE D: Audit Logging & Distributed Consistency
# -------------------------------------------------------------
def test_suite_d_audit_logging_consistency(db_session):
    """Audit Logging: Verify all security-sensitive actions generate immutable audit log entries."""
    email = "audit_qa@trustshare.io"
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    user = User(username="audit_user", email=email, hashed_password="pw", role="user", is_verified=True)
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": email, "role": "user"})
    headers = {"Authorization": f"Bearer {token}"}

    # Upload
    client.post("/api/files/upload", headers=headers, files={
        "file": ("audit_test.txt", b"AUDIT_DATA", "text/plain")
    })
    
    # Check audit log in DB
    logs = db_session.query(AuditLog).filter(AuditLog.user_id == user.id).all()
    actions = [l.action for l in logs]
    assert "UPLOAD" in actions
