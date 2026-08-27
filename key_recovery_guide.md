# TrustShare — Master Encryption Key Disaster Recovery & Backup Guide

## Executive Overview

Every document stored in **TrustShare** is encrypted using server-side **AES-256-GCM envelope encryption**. Each file possesses a unique 256-bit symmetric key that is wrapped (encrypted) by the system **Server Master Key** (`MASTER_ENCRYPTION_KEY`).

If the `MASTER_ENCRYPTION_KEY` environment variable is lost (e.g. server rebuild, disk failure, accidental `.env` overwrite), **all encrypted files become permanently unrecoverable**. 

To prevent catastrophic data loss, TrustShare provides a zero-plaintext **Key Escrow Backup & Disaster Recovery System**.

---

## 🔐 1. Creating a Master Key Escrow Backup

Administrators should create and securely export an encrypted key escrow backup after initial deployment or master key rotation:

```bash
cd backend
python -m app.core.key_recovery backup master_key.backup.json
```

1. You will be prompted to enter a **strong recovery passphrase**.
2. The key recovery module derives a 256-bit key using **PBKDF2-HMAC-SHA256** (100,000 iterations + 16-byte random salt).
3. The Master Key is encrypted with **AES-256-GCM** and saved with a **SHA-256 integrity checksum fingerprint**.

### Backup File Structure (`master_key.backup.json`):
```json
{
  "version": "1.0.0",
  "system": "TrustShare - Secure File Sharing System",
  "created_at": "2026-08-27T13:08:40.123456",
  "sha256_fingerprint": "a1b2c3d4e5f6...",
  "kdf_salt_hex": "8f3b...",
  "iv_hex": "1a2b...",
  "encrypted_key_hex": "4c5d..."
}
```

> **Security Requirement**: Store `master_key.backup.json` in an offline, air-gapped secure vault or hardware key store separate from the application server.

---

## 🔄 2. Verifying & Restoring Master Key During Disaster Recovery

If the application server is rebuilt or `.env` configuration is lost:

### Step 1: Verify & Decrypt Master Key
Run the recovery command using your backup file:

```bash
cd backend
python -m app.core.key_recovery verify master_key.backup.json
```

- Enter the recovery passphrase used during backup creation.
- The utility verifies the **SHA-256 fingerprint checksum** to ensure zero corruption or tampering.

### Step 2: Reinstate Environment Configuration
Copy the verified master key hex string into `.env`:

```env
MASTER_ENCRYPTION_KEY="<restored_64_character_hex_string>"
```

### Step 3: Restart Application Services
```bash
docker-compose restart backend
# Or locally:
python -m uvicorn main:app --reload --port 8000
```

---

## 🧪 3. Automated Verification
The master key backup and recovery engine is tested automatically as part of the backend test suite:

```bash
cd backend
python -m pytest tests/test_master_key_recovery.py -v
```
