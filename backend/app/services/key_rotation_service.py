"""
AES-256 Encryption Key Rotation Service.
Re-encrypts all files with new per-file keys wrapped under a (potentially new) master key.
Ensures zero-downtime key rotation with full audit trail.
"""
import os
from typing import Optional
from sqlalchemy.orm import Session
from app.core.crypto import crypto_service
from app.core.config import settings
from app.models.file import File as FileModel, FileVersion
from app.services.audit_service import log_activity


def rotate_file_key(db: Session, file_record: FileModel, user_id: Optional[int] = None) -> bool:
    """
    Rotate the encryption key for a single file:
    1. Read and decrypt with old key
    2. Generate new per-file key
    3. Re-encrypt with new key
    4. Wrap new key with master key
    5. Update DB record
    """
    try:
        # Decrypt with current key
        old_key = crypto_service.unwrap_file_key(file_record.encryption_key_enc)

        with open(file_record.encrypted_path, "rb") as f:
            encrypted_bytes = f.read()

        plaintext = crypto_service.decrypt_bytes(encrypted_bytes, old_key)

        # Generate new key and re-encrypt
        new_key = crypto_service.generate_key()
        new_ciphertext = crypto_service.encrypt_bytes(plaintext, new_key)
        new_wrapped_key_hex = crypto_service.wrap_file_key(new_key)

        # Overwrite ciphertext on disk
        with open(file_record.encrypted_path, "wb") as f:
            f.write(new_ciphertext)

        # Update DB
        file_record.encryption_key_enc = new_wrapped_key_hex
        db.commit()

        log_activity(
            db, action="KEY_ROTATION", user_id=user_id,
            target_type="FILE", target_id=str(file_record.id),
            details=f"Successfully rotated encryption key for file {file_record.filename}"
        )
        return True

    except Exception as e:
        log_activity(
            db, action="KEY_ROTATION_FAILED", user_id=user_id,
            target_type="FILE", target_id=str(file_record.id),
            status="WARNING", details=f"Key rotation failed: {str(e)}"
        )
        return False


def rotate_all_keys(db: Session, user_id: Optional[int] = None) -> dict:
    """
    Rotate encryption keys for all files in the system.
    Returns a summary of results.
    """
    files = db.query(FileModel).all()
    total = len(files)
    success_count = 0
    failed_count = 0

    for file_record in files:
        if rotate_file_key(db, file_record, user_id):
            success_count += 1
        else:
            failed_count += 1

    # Also rotate keys for archived versions
    versions = db.query(FileVersion).all()
    version_success = 0
    for version in versions:
        try:
            old_key = crypto_service.unwrap_file_key(version.encryption_key_enc)
            with open(version.encrypted_path, "rb") as f:
                encrypted_bytes = f.read()
            plaintext = crypto_service.decrypt_bytes(encrypted_bytes, old_key)
            new_key = crypto_service.generate_key()
            new_ciphertext = crypto_service.encrypt_bytes(plaintext, new_key)
            new_wrapped_key_hex = crypto_service.wrap_file_key(new_key)
            with open(version.encrypted_path, "wb") as f:
                f.write(new_ciphertext)
            version.encryption_key_enc = new_wrapped_key_hex
            db.commit()
            version_success += 1
        except Exception:
            failed_count += 1

    log_activity(
        db, action="KEY_ROTATION_COMPLETE", user_id=user_id,
        target_type="SYSTEM",
        details=f"Rotated {success_count}/{total} file keys, {version_success} version keys. {failed_count} failures."
    )

    return {
        "total_files": total,
        "rotated_files": success_count,
        "rotated_versions": version_success,
        "failed": failed_count
    }
