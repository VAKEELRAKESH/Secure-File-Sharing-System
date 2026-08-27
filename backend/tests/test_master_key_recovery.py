import os
import pytest
from app.core.key_recovery import (
    create_key_backup, restore_key_from_backup, compute_master_key_fingerprint
)
from app.core.config import settings

def test_master_key_backup_and_recovery(tmp_path):
    """Verify Master Key backup creation, passphrase encryption, wrong passphrase rejection, and restoration."""
    backup_file = str(tmp_path / "test_master_key.backup.json")
    passphrase = "UltraSecretEmergencyPassphrase2026!"

    # 1. Create Backup
    payload = create_key_backup(passphrase, backup_file)
    assert os.path.exists(backup_file)
    assert payload["version"] == "1.0.0"
    assert "sha256_fingerprint" in payload
    assert payload["sha256_fingerprint"] == compute_master_key_fingerprint(settings.MASTER_ENCRYPTION_KEY)

    # 2. Reject wrong passphrase
    with pytest.raises(ValueError, match="Decryption failed"):
        restore_key_from_backup("WrongPassphrase123!", backup_file)

    # 3. Restore key with correct passphrase
    restored_key = restore_key_from_backup(passphrase, backup_file)
    assert restored_key == settings.MASTER_ENCRYPTION_KEY
