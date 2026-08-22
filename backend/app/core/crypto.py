import os
import secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

class AES256CryptoService:
    """
    AES-256-GCM Server-Side Encryption and Key Management Engine.
    Provides authenticated encryption, per-file unique keys, and envelope key protection.
    """

    @staticmethod
    def generate_key() -> bytes:
        """Generates a random 256-bit (32 bytes) AES encryption key."""
        return AESGCM.generate_key(bit_length=256)

    @staticmethod
    def get_master_key() -> bytes:
        """Converts master key string setting to 32 bytes key."""
        key_hex = settings.MASTER_ENCRYPTION_KEY
        if len(key_hex) < 64:
            key_hex = key_hex.ljust(64, '0')
        return bytes.fromhex(key_hex[:64])

    @classmethod
    def wrap_file_key(cls, file_key: bytes) -> str:
        """
        Encrypts a file key using the server Master Key (Envelope Encryption).
        Returns hex string representation of nonce + encrypted_key.
        """
        master_key = cls.get_master_key()
        aesgcm = AESGCM(master_key)
        nonce = os.urandom(12)
        encrypted_key = aesgcm.encrypt(nonce, file_key, None)
        return (nonce + encrypted_key).hex()

    @classmethod
    def unwrap_file_key(cls, wrapped_key_hex: str) -> bytes:
        """
        Decrypts a wrapped file key using the server Master Key.
        """
        master_key = cls.get_master_key()
        aesgcm = AESGCM(master_key)
        data = bytes.fromhex(wrapped_key_hex)
        nonce = data[:12]
        encrypted_key = data[12:]
        return aesgcm.decrypt(nonce, encrypted_key, None)

    @staticmethod
    def encrypt_bytes(plaintext: bytes, file_key: bytes) -> bytes:
        """
        Encrypts raw file bytes with AES-256-GCM using the unique per-file key.
        Output format: 12-byte Nonce + Ciphertext (includes 16-byte Tag).
        """
        aesgcm = AESGCM(file_key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        return nonce + ciphertext

    @staticmethod
    def decrypt_bytes(ciphertext_with_nonce: bytes, file_key: bytes) -> bytes:
        """
        Decrypts AES-256-GCM encrypted file bytes using the unique per-file key.
        Extracts 12-byte Nonce and verifies GCM authentication tag.
        """
        aesgcm = AESGCM(file_key)
        nonce = ciphertext_with_nonce[:12]
        ciphertext = ciphertext_with_nonce[12:]
        return aesgcm.decrypt(nonce, ciphertext, None)

crypto_service = AES256CryptoService()
