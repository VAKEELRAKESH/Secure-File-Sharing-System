import os
import json
import base64
import hashlib
from datetime import datetime
from typing import Tuple, Dict, Any, Optional

from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

def derive_passphrase_key(passphrase: str, salt: bytes) -> bytes:
    """Derive a 256-bit key from a user passphrase using PBKDF2-HMAC-SHA256."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(passphrase.encode('utf-8'))

def compute_master_key_fingerprint(master_key_hex: str) -> str:
    """Compute SHA-256 checksum fingerprint of the master encryption key."""
    return hashlib.sha256(master_key_hex.encode('utf-8')).hexdigest()

def create_key_backup(passphrase: str, output_path: str = "master_key.backup.json") -> Dict[str, Any]:
    """
    Encrypt and export the active MASTER_ENCRYPTION_KEY to a secure backup JSON payload.
    The backup is encrypted using AES-256-GCM derived from the provided passphrase.
    """
    master_key = settings.MASTER_ENCRYPTION_KEY
    if not master_key:
        raise ValueError("MASTER_ENCRYPTION_KEY is not configured in settings")

    fingerprint = compute_master_key_fingerprint(master_key)
    salt = os.urandom(16)
    iv = os.urandom(12)

    encryption_key = derive_passphrase_key(passphrase, salt)
    aesgcm = AESGCM(encryption_key)
    ciphertext = aesgcm.encrypt(iv, master_key.encode('utf-8'), None)

    backup_payload = {
        "version": "1.0.0",
        "system": settings.PROJECT_NAME,
        "created_at": datetime.utcnow().isoformat(),
        "sha256_fingerprint": fingerprint,
        "kdf_salt_hex": salt.hex(),
        "iv_hex": iv.hex(),
        "encrypted_key_hex": ciphertext.hex()
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(backup_payload, f, indent=2)

    return backup_payload

def restore_key_from_backup(passphrase: str, backup_path: str = "master_key.backup.json") -> str:
    """
    Decrypt and verify a master key backup file using the recovery passphrase.
    Verifies SHA-256 fingerprint to ensure master key integrity.
    """
    if not os.path.exists(backup_path):
        raise FileNotFoundError(f"Backup file not found at: {backup_path}")

    with open(backup_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    salt = bytes.fromhex(payload["kdf_salt_hex"])
    iv = bytes.fromhex(payload["iv_hex"])
    ciphertext = bytes.fromhex(payload["encrypted_key_hex"])
    expected_fingerprint = payload["sha256_fingerprint"]

    encryption_key = derive_passphrase_key(passphrase, salt)
    aesgcm = AESGCM(encryption_key)

    try:
        decrypted_bytes = aesgcm.decrypt(iv, ciphertext, None)
        master_key_hex = decrypted_bytes.decode('utf-8')
    except Exception as e:
        raise ValueError("Decryption failed. Incorrect passphrase or corrupted backup file.") from e

    actual_fingerprint = compute_master_key_fingerprint(master_key_hex)
    if actual_fingerprint != expected_fingerprint:
        raise ValueError("Integrity check failed: Master key fingerprint does not match backup record")

    return master_key_hex

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "backup":
        pwd = input("Enter backup recovery passphrase: ")
        path = sys.argv[2] if len(sys.argv) > 2 else "master_key.backup.json"
        res = create_key_backup(pwd, path)
        print(f"✅ Master key backup created successfully at: {path}")
        print(f"Fingerprint: {res['sha256_fingerprint']}")
    elif len(sys.argv) > 1 and sys.argv[1] == "verify":
        pwd = input("Enter backup recovery passphrase: ")
        path = sys.argv[2] if len(sys.argv) > 2 else "master_key.backup.json"
        key = restore_key_from_backup(pwd, path)
        print(f"✅ Backup verified successfully! Master Key: {key[:8]}...{key[-8:]}")
    else:
        print("Usage: python -m app.core.key_recovery [backup|verify] [optional_filepath]")
