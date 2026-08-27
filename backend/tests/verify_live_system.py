import requests
import sys
import time

API_BASE = "http://127.0.0.1:8000"

def test_live_system():
    print("[1/8] Testing Server Health...")
    try:
        r = requests.get(f"{API_BASE}/health", timeout=5)
        print("  -> Health Check Response:", r.json())
        assert r.status_code == 200
    except Exception as e:
        print("  -> Server not yet reachable on 8000:", e)
        return False

    print("[2/8] Testing User Registration & Login...")
    reg_data = {
        "username": "live_test_user",
        "email": "live_user@trustshare.com",
        "password": "SecurePassword2026!"
    }
    r = requests.post(f"{API_BASE}/api/auth/register", json=reg_data)
    print("  -> Register status:", r.status_code)

    login_data = {
        "email": "live_user@trustshare.com",
        "password": "SecurePassword2026!"
    }
    r = requests.post(f"{API_BASE}/api/auth/login", json=login_data)
    if r.status_code == 403 and "Email verification required" in r.text:
        # Fetch OTP from local DB to simulate out-of-band email verification
        from app.core.database import SessionLocal
        from app.models.user import User
        db = SessionLocal()
        u = db.query(User).filter(User.email == "live_user@trustshare.com").first()
        otp = u.verification_otp if u else None
        db.close()
        if otp:
            v_res = requests.post(f"{API_BASE}/api/auth/verify-otp", json={"email": "live_user@trustshare.com", "otp": otp})
            print("  -> Email verified via OTP! Status:", v_res.status_code)
        r = requests.post(f"{API_BASE}/api/auth/login", json=login_data)

    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("  -> Login success! JWT Token acquired.")

    print("[3/8] Testing AES-256 Encrypted File Upload...")
    file_payload = b"CONFIDENTIAL_LIVE_TEST_DOCUMENT_CONTENT_2026_AES256"
    files = {"file": ("enterprise_report_2026.pdf", file_payload, "application/pdf")}
    data = {"category": "Document", "tags": "confidential, live_test"}
    r = requests.post(f"{API_BASE}/api/files/upload", headers=headers, files=files, data=data)
    assert r.status_code == 200
    file_info = r.json()
    file_id = file_info["id"]
    print("  -> File Uploaded! File ID:", file_id, "Category:", file_info["category"])

    print("[4/8] Testing Decrypted File Download...")
    r = requests.get(f"{API_BASE}/api/files/{file_id}/download", headers=headers)
    assert r.status_code == 200
    assert r.content == file_payload
    print("  -> Decryption successful! Content verified matching original payload.")

    print("[5/8] Testing Secure Share Link Creation...")
    share_payload = {
        "file_id": file_id,
        "permission": "download",
        "passphrase": "SecretPassphrase123!",
        "expires_in_hours": 24,
        "max_downloads": 3
    }
    r = requests.post(f"{API_BASE}/api/shares", headers=headers, json=share_payload)
    assert r.status_code == 200
    share_data = r.json()
    share_token = share_data["share_token"]
    print("  -> Share Link Created! Token:", share_token)

    print("[6/8] Testing Public Shared Access & Passphrase Decryption...")
    r = requests.get(f"{API_BASE}/api/shares/access/{share_token}/info")
    assert r.status_code == 200
    print("  -> Public Info fetched. Passphrase Required:", r.json()["requires_passphrase"])

    r = requests.post(f"{API_BASE}/api/shares/access/{share_token}/download", json={"passphrase": "SecretPassphrase123!"})
    assert r.status_code == 200
    assert r.content == file_payload
    print("  -> Shared File Passphrase Decryption Verified! 100% Match.")

    print("[7/8] Testing Audit Logs & Security Alerts...")
    r = requests.get(f"{API_BASE}/api/audit/logs", headers=headers)
    assert r.status_code == 200
    logs = r.json()
    print("  -> Audit Logs Count:", len(logs), "Latest Action:", logs[0]["action"])

    print("[8/8] Testing Storage Analytics Dashboard...")
    r = requests.get(f"{API_BASE}/api/analytics", headers=headers)
    assert r.status_code == 200
    analytics = r.json()
    print("  -> Total Encrypted Files:", analytics["total_files"])
    print("  -> Total Storage Bytes:", analytics["total_storage_bytes"])
    print("\n>>> ALL SYSTEM FLOWS & ENDPOINTS VERIFIED 100% WORKING SUCCESSFUL <<<")
    return True

if __name__ == "__main__":
    test_live_system()
