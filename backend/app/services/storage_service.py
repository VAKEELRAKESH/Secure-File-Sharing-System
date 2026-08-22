import os
import uuid
from typing import Tuple
from app.core.config import settings
from app.core.crypto import crypto_service

class EncryptedStorageService:
    """
    AES-256 Encrypted File Storage Engine.
    Ensures files are encrypted on the server before storage.
    Plaintext is NEVER stored on disk.
    """

    @staticmethod
    def store_encrypted_file(file_bytes: bytes, original_filename: str) -> Tuple[str, str, int]:
        """
        Encrypts raw file bytes using a new unique 256-bit AES key.
        Saves ciphertext to storage and returns (relative_path, wrapped_key_hex, size).
        """
        # 1. Generate unique AES-256 per-file key
        file_key = crypto_service.generate_key()

        # 2. Encrypt file content with AES-256-GCM
        encrypted_bytes = crypto_service.encrypt_bytes(file_bytes, file_key)

        # 3. Store encrypted ciphertext to storage directory
        unique_file_id = f"{uuid.uuid4().hex}.enc"
        full_path = os.path.join(settings.STORAGE_DIR, unique_file_id)
        
        with open(full_path, "wb") as f:
            f.write(encrypted_bytes)

        # 4. Wrap file key with master envelope key
        wrapped_key_hex = crypto_service.wrap_file_key(file_key)

        return full_path, wrapped_key_hex, len(file_bytes)

    @staticmethod
    def read_decrypted_file(encrypted_filepath: str, wrapped_key_hex: str) -> bytes:
        """
        Decrypts an encrypted file temporarily in memory for authorized access.
        """
        if not os.path.exists(encrypted_filepath):
            raise FileNotFoundError("Encrypted file binary not found on storage")

        # 1. Unwrap key
        file_key = crypto_service.unwrap_file_key(wrapped_key_hex)

        # 2. Read encrypted ciphertext
        with open(encrypted_filepath, "rb") as f:
            encrypted_bytes = f.read()

        # 3. Decrypt bytes in memory
        decrypted_bytes = crypto_service.decrypt_bytes(encrypted_bytes, file_key)
        return decrypted_bytes

    @staticmethod
    def delete_encrypted_file(encrypted_filepath: str):
        """Removes ciphertext file from disk."""
        if os.path.exists(encrypted_filepath):
            try:
                os.remove(encrypted_filepath)
            except Exception:
                pass

storage_service = EncryptedStorageService()
