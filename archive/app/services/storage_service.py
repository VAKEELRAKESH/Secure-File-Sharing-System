import os
import uuid
from typing import Tuple
from app.config.settings import settings
from app.security.crypto import crypto_service

class EncryptedStorageService:
    @staticmethod
    def store_encrypted_file(file_bytes: bytes, original_filename: str) -> Tuple[str, str, int]:
        file_key = crypto_service.generate_key()
        encrypted_bytes = crypto_service.encrypt_bytes(file_bytes, file_key)

        unique_file_id = f"{uuid.uuid4().hex}.enc"
        full_path = os.path.join(settings.STORAGE_DIR, unique_file_id)
        
        with open(full_path, "wb") as f:
            f.write(encrypted_bytes)

        wrapped_key_hex = crypto_service.wrap_file_key(file_key)
        return full_path, wrapped_key_hex, len(file_bytes)

    @staticmethod
    def read_decrypted_file(encrypted_filepath: str, wrapped_key_hex: str) -> bytes:
        if not os.path.exists(encrypted_filepath):
            raise FileNotFoundError("Encrypted file binary not found on storage")

        file_key = crypto_service.unwrap_file_key(wrapped_key_hex)
        with open(encrypted_filepath, "rb") as f:
            encrypted_bytes = f.read()

        return crypto_service.decrypt_bytes(encrypted_bytes, file_key)

    @staticmethod
    def delete_encrypted_file(encrypted_filepath: str):
        if os.path.exists(encrypted_filepath):
            try:
                os.remove(encrypted_filepath)
            except Exception:
                pass

storage_service = EncryptedStorageService()
