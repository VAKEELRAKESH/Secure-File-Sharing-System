import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.crypto import crypto_service
from app.services.storage_service import storage_service

client = TestClient(app)

def test_crypto_engine_aes256():
    """Verify AES-256-GCM encryption & decryption accuracy with per-file key & envelope key."""
    raw_data = b"CONFIDENTIAL_ENTERPRISE_DOCUMENT_CONTENT_2026_TRUSTSHARE"
    
    # 1. Generate unique 256-bit key
    file_key = crypto_service.generate_key()
    assert len(file_key) == 32
    
    # 2. Encrypt bytes
    ciphertext = crypto_service.encrypt_bytes(raw_data, file_key)
    assert ciphertext != raw_data
    
    # 3. Decrypt bytes
    decrypted = crypto_service.decrypt_bytes(ciphertext, file_key)
    assert decrypted == raw_data
    
    # 4. Master key envelope wrapping
    wrapped_key_hex = crypto_service.wrap_file_key(file_key)
    unwrapped_key = crypto_service.unwrap_file_key(wrapped_key_hex)
    assert unwrapped_key == file_key

def test_full_system_flow():
    """End-to-End API Integration test."""
    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == "secuser@trustshare.com").first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    # 1. Register User
    reg_res = client.post("/api/auth/register", json={
        "username": "testsecuser",
        "email": "secuser@trustshare.com",
        "password": "SecurePassword123!"
    })
    assert reg_res.status_code == 200

    # Retrieve OTP and verify user
    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    user = db.query(User).filter(User.email == "secuser@trustshare.com").first()
    if user and not user.is_verified:
        verify_res = client.post("/api/auth/verify-otp", json={
            "email": "secuser@trustshare.com",
            "otp": user.verification_otp
        })
        assert verify_res.status_code == 200
    db.close()

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": "secuser@trustshare.com",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Upload File (AES-256 SSE)
    file_content = b"Top secret corporate budget breakdown 2026."
    files = {"file": ("budget_2026.pdf", file_content, "application/pdf")}
    upload_res = client.post("/api/files/upload", headers=headers, files=files)
    assert upload_res.status_code == 200
    file_id = upload_res.json()["id"]

    # 4. Download & Decrypt File
    down_res = client.get(f"/api/files/{file_id}/download", headers=headers)
    assert down_res.status_code == 200
    assert down_res.content == file_content

    # 5. Create Secure Share Link
    share_res = client.post("/api/shares", headers=headers, json={
        "file_id": file_id,
        "permission": "download",
        "passphrase": "SharePass123!",
        "expires_in_hours": 24,
        "max_downloads": 5
    })
    assert share_res.status_code == 200
    share_token = share_res.json()["share_token"]

    # 6. Public Share Info
    info_res = client.get(f"/api/shares/access/{share_token}/info")
    assert info_res.status_code == 200
    assert info_res.json()["requires_passphrase"] is True

    # 7. Download Shared File with Passphrase
    shared_down_res = client.post(f"/api/shares/access/{share_token}/download", json={
        "passphrase": "SharePass123!"
    })
    assert shared_down_res.status_code == 200
    assert shared_down_res.content == file_content

    # 8. Check Analytics Dashboard
    analytics_res = client.get("/api/analytics", headers=headers)
    assert analytics_res.status_code == 200
    assert analytics_res.json()["total_files"] >= 1
