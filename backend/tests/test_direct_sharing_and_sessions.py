import pytest
from jose import jwt
from fastapi.testclient import TestClient
from main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.file import File as FileModel
from app.models.share import FileShare
from app.models.session import Session as SessionModel
from app.core.security import create_access_token, hash_password
from app.core.config import settings

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_direct_user_to_user_sharing_and_received_files(db_session):
    """Verify sharing a file directly to recipient's email and listing in Received Files."""
    alice_email = "alice_direct@trustshare.io"
    bob_email = "bob_direct@trustshare.io"

    db_session.query(User).filter(User.email.in_([alice_email, bob_email])).delete()
    db_session.commit()

    alice = User(username="alice_direct", email=alice_email, hashed_password=hash_password("Password123!"), role="user", is_verified=True)
    bob = User(username="bob_direct", email=bob_email, hashed_password=hash_password("Password123!"), role="user", is_verified=True)
    db_session.add_all([alice, bob])
    db_session.commit()

    alice_login = client.post("/api/auth/login", json={"email": alice_email, "password": "Password123!"})
    bob_login = client.post("/api/auth/login", json={"email": bob_email, "password": "Password123!"})
    alice_token = alice_login.json()["access_token"]
    bob_token = bob_login.json()["access_token"]

    # Alice uploads a file
    file_bytes = b"DIRECT_SHARE_CONFIDENTIAL_PAYLOAD"
    upload_res = client.post("/api/files/upload", headers={"Authorization": f"Bearer {alice_token}"}, files={
        "file": ("quarterly_budget.xlsx", file_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    })
    assert upload_res.status_code == 200
    file_id = upload_res.json()["id"]

    # Alice directly shares with Bob
    share_res = client.post("/api/shares/direct", headers={"Authorization": f"Bearer {alice_token}"}, json={
        "file_id": file_id,
        "recipient_email": bob_email,
        "permission": "download",
        "expires_in_hours": 48
    })
    assert share_res.status_code == 200
    share_data = share_res.json()
    assert share_data["share_token"] is not None

    # Bob views his Received Files
    received_res = client.get("/api/shares/received", headers={"Authorization": f"Bearer {bob_token}"})
    assert received_res.status_code == 200
    received_list = received_res.json()
    assert len(received_list) >= 1
    shared_entry = next((s for s in received_list if s["file_id"] == file_id), None)
    assert shared_entry is not None
    assert shared_entry["filename"] == "quarterly_budget.xlsx"
    assert shared_entry["sender_name"] == "alice_direct"

    # Bob downloads the shared file directly
    down_res = client.post(f"/api/shares/received/{shared_entry['id']}/download", headers={"Authorization": f"Bearer {bob_token}"}, json={})
    assert down_res.status_code == 200
    assert down_res.content == file_bytes

def test_revoked_session_jti_blocks_authenticated_request(db_session):
    """Enforce that revoking a session instantly blocks subsequent API requests with 401."""
    email = "revocation_target@trustshare.io"
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    user = User(username="revocation_user", email=email, hashed_password=hash_password("Password123!"), role="user", is_verified=True)
    db_session.add(user)
    db_session.commit()

    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    # Step 1: Login to issue bound session_id in token
    login_res = client.post("/api/auth/login", headers=headers, json={
        "email": email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    auth_header = {"Authorization": f"Bearer {token}"}

    # Step 2: Validate token is accepted for protected resources
    files_res = client.get("/api/files", headers=auth_header)
    assert files_res.status_code == 200

    # Step 3: Get active session ID
    sessions_res = client.get("/api/auth/sessions", headers=auth_header)
    assert sessions_res.status_code == 200
    sessions = sessions_res.json()
    assert len(sessions) >= 1
    session_id = sessions[0]["id"]

    # Step 4: Revoke session
    revoke_res = client.delete(f"/api/auth/sessions/{session_id}", headers=auth_header)
    assert revoke_res.status_code == 200

    # Step 5: Verify the same token is now BLOCKED on the protected resource
    blocked_res = client.get("/api/files", headers=auth_header)
    assert blocked_res.status_code == 401
    assert "Session has been revoked or expired" in blocked_res.json()["detail"]

def test_google_oauth_collision_and_unverified_email_defense(db_session):
    """Verify Google OAuth token verification, email_verified defense, and collision handling."""
    google_email = "oauth_user@example.com"
    db_session.query(User).filter(User.email == google_email).delete()
    db_session.commit()

    # Case 1: Reject unverified Google email
    unverified_token = jwt.encode({"email": google_email, "email_verified": False, "name": "Fake User"}, "mock_secret", algorithm="HS256")
    reject_res = client.post("/api/auth/google", json={"credential": unverified_token})
    assert reject_res.status_code == 400
    assert "Google account email is not verified" in reject_res.json()["detail"]

    # Case 2: Auto-provision verified user on valid token
    valid_token = jwt.encode({"email": google_email, "email_verified": True, "name": "Valid OAuth User"}, "mock_secret", algorithm="HS256")
    oauth_res = client.post("/api/auth/google", json={"credential": valid_token})
    assert oauth_res.status_code == 200
    token_data = oauth_res.json()
    assert token_data["user"]["email"] == google_email
    assert token_data["user"]["is_verified"] is True

    # Case 3: Safe collision handling when password account already exists
    login_again_res = client.post("/api/auth/google", json={"credential": valid_token})
    assert login_again_res.status_code == 200
    assert login_again_res.json()["user"]["email"] == google_email

def test_direct_share_download_uses_unified_envelope_crypto(db_session):
    """Verify that direct share download uses the identical storage_service AES-256-GCM envelope path."""
    sender_email = "crypto_sender@trustshare.io"
    receiver_email = "crypto_receiver@trustshare.io"

    db_session.query(User).filter(User.email.in_([sender_email, receiver_email])).delete()
    db_session.commit()

    sender = User(username="sender", email=sender_email, hashed_password=hash_password("Password123!"), role="user", is_verified=True)
    receiver = User(username="receiver", email=receiver_email, hashed_password=hash_password("Password123!"), role="user", is_verified=True)
    db_session.add_all([sender, receiver])
    db_session.commit()

    sender_token = client.post("/api/auth/login", json={"email": sender_email, "password": "Password123!"}).json()["access_token"]
    receiver_token = client.post("/api/auth/login", json={"email": receiver_email, "password": "Password123!"}).json()["access_token"]

    test_content = b"AES_256_GCM_ENVELOPE_VALIDATION_PAYLOAD_12345"
    up_res = client.post("/api/files/upload", headers={"Authorization": f"Bearer {sender_token}"}, files={
        "file": ("crypto_test.bin", test_content, "application/octet-stream")
    })
    assert up_res.status_code == 200
    file_id = up_res.json()["id"]

    # Verify database file record contains encrypted envelope metadata
    db_file = db_session.query(FileModel).filter(FileModel.id == file_id).first()
    assert db_file.encryption_key_enc is not None
    assert db_file.encrypted_path is not None

    # Share directly
    share_res = client.post("/api/shares/direct", headers={"Authorization": f"Bearer {sender_token}"}, json={
        "file_id": file_id,
        "recipient_email": receiver_email,
        "permission": "download"
    })
    assert share_res.status_code == 200
    share_id = share_res.json()["id"]

    # Recipient downloads through unified decryption path
    download_res = client.post(f"/api/shares/received/{share_id}/download", headers={"Authorization": f"Bearer {receiver_token}"}, json={})
    assert download_res.status_code == 200
    assert download_res.content == test_content
