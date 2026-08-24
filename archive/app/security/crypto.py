import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config.settings import settings

class AES256CryptoService:
    @staticmethod
    def generate_key() -> bytes:
        return AESGCM.generate_key(bit_length=256)

    @staticmethod
    def get_master_key() -> bytes:
        key_hex = settings.MASTER_ENCRYPTION_KEY
        if len(key_hex) < 64:
            key_hex = key_hex.ljust(64, '0')
        return bytes.fromhex(key_hex[:64])

    @classmethod
    def wrap_file_key(cls, file_key: bytes) -> str:
        master_key = cls.get_master_key()
        aesgcm = AESGCM(master_key)
        nonce = os.urandom(12)
        encrypted_key = aesgcm.encrypt(nonce, file_key, None)
        return (nonce + encrypted_key).hex()

    @classmethod
    def unwrap_file_key(cls, wrapped_key_hex: str) -> bytes:
        master_key = cls.get_master_key()
        aesgcm = AESGCM(master_key)
        data = bytes.fromhex(wrapped_key_hex)
        nonce = data[:12]
        encrypted_key = data[12:]
        return aesgcm.decrypt(nonce, encrypted_key, None)

    @staticmethod
    def encrypt_bytes(plaintext: bytes, file_key: bytes) -> bytes:
        aesgcm = AESGCM(file_key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        return nonce + ciphertext

    @staticmethod
    def decrypt_bytes(ciphertext_with_nonce: bytes, file_key: bytes) -> bytes:
        aesgcm = AESGCM(file_key)
        nonce = ciphertext_with_nonce[:12]
        ciphertext = ciphertext_with_nonce[12:]
        return aesgcm.decrypt(nonce, ciphertext, None)

crypto_service = AES256CryptoService()
