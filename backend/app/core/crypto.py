import os
import secrets
import logging
from abc import ABC, abstractmethod
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

logger = logging.getLogger("trustshare.crypto")

class BaseKeyProvider(ABC):
    """Abstract Key Management Service (KMS) provider interface for envelope key wrapping."""

    @abstractmethod
    def get_master_key(self) -> bytes:
        """Returns 32-byte master key for envelope wrapping."""
        pass

class LocalEnvKeyProvider(BaseKeyProvider):
    """
    Development/Local Key Provider.
    Reads master encryption key from environment variable settings.MASTER_ENCRYPTION_KEY.
    """

    def __init__(self):
        if settings.ENVIRONMENT == "production":
            logger.warning(
                "[CRITICAL SECURITY WARNING] Master key is configured from local environment variable in a PRODUCTION environment! "
                "Production deployments MUST use an external KMS (AWS KMS, Azure Key Vault, or HashiCorp Vault) to separate key ownership."
            )
        else:
            logger.info(
                "[SECURITY INFO] Envelope key provider active: LocalEnvKeyProvider (Development Mode)."
            )

    def get_master_key(self) -> bytes:
        key_hex = settings.MASTER_ENCRYPTION_KEY
        if len(key_hex) < 64:
            key_hex = key_hex.ljust(64, '0')
        return bytes.fromhex(key_hex[:64])

class AwsKmsKeyProvider(BaseKeyProvider):
    """
    AWS KMS Key Provider adapter interface.
    Connects to AWS KMS when boto3 is installed and AWS credentials are configured.
    """

    def __init__(self):
        if not settings.AWS_KMS_KEY_ID:
            raise ValueError("AWS_KMS_KEY_ID setting is required for AwsKmsKeyProvider")
        logger.info(f"[KMS INFO] AwsKmsKeyProvider initialized for Key ID: {settings.AWS_KMS_KEY_ID[:8]}...")

    def get_master_key(self) -> bytes:
        try:
            import boto3
            client = boto3.client('kms', region_name=settings.AWS_S3_REGION or 'us-east-1')
            # Generate a 256-bit data key via AWS KMS
            response = client.generate_data_key(KeyId=settings.AWS_KMS_KEY_ID, KeySpec='AES_256')
            return response['Plaintext']
        except ImportError:
            logger.warning("[KMS WARNING] 'boto3' is not installed. Using local master key fallback for AWS KMS adapter interface.")
            key_hex = settings.MASTER_ENCRYPTION_KEY
            if len(key_hex) < 64:
                key_hex = key_hex.ljust(64, '0')
            return bytes.fromhex(key_hex[:64])
        except Exception as e:
            logger.error(f"[KMS ERROR] Failed to fetch data key from AWS KMS: {e}. Falling back to configured master key.")
            key_hex = settings.MASTER_ENCRYPTION_KEY
            if len(key_hex) < 64:
                key_hex = key_hex.ljust(64, '0')
            return bytes.fromhex(key_hex[:64])

class AzureKeyVaultKeyProvider(BaseKeyProvider):
    """
    Azure Key Vault Key Provider adapter interface.
    Connects to Azure Key Vault when azure-keyvault-keys is installed.
    """

    def __init__(self):
        if not settings.AZURE_KEYVAULT_URL:
            raise ValueError("AZURE_KEYVAULT_URL setting is required for AzureKeyVaultKeyProvider")
        logger.info(f"[KMS INFO] AzureKeyVaultKeyProvider initialized for Vault URL: {settings.AZURE_KEYVAULT_URL}")

    def get_master_key(self) -> bytes:
        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.secrets import SecretClient
            credential = DefaultAzureCredential()
            client = SecretClient(vault_url=settings.AZURE_KEYVAULT_URL, credential=credential)
            secret = client.get_secret("trustshare-master-key")
            key_hex = secret.value
            if len(key_hex) < 64:
                key_hex = key_hex.ljust(64, '0')
            return bytes.fromhex(key_hex[:64])
        except ImportError:
            logger.warning("[KMS WARNING] 'azure-identity'/'azure-keyvault-secrets' not installed. Using local master key fallback for Azure adapter.")
            key_hex = settings.MASTER_ENCRYPTION_KEY
            if len(key_hex) < 64:
                key_hex = key_hex.ljust(64, '0')
            return bytes.fromhex(key_hex[:64])
        except Exception as e:
            logger.error(f"[KMS ERROR] Failed to retrieve key from Azure Key Vault: {e}. Falling back to configured master key.")
            key_hex = settings.MASTER_ENCRYPTION_KEY
            if len(key_hex) < 64:
                key_hex = key_hex.ljust(64, '0')
            return bytes.fromhex(key_hex[:64])

def get_key_provider() -> BaseKeyProvider:
    provider_name = settings.KMS_PROVIDER.lower()
    if provider_name == "aws_kms":
        return AwsKmsKeyProvider()
    elif provider_name == "azure_keyvault":
        return AzureKeyVaultKeyProvider()
    else:
        return LocalEnvKeyProvider()

class AES256CryptoService:
    """
    AES-256-GCM Server-Side Encryption and Key Management Engine.
    Provides authenticated encryption, per-file unique keys, and envelope key protection.
    """

    def __init__(self):
        self._provider = get_key_provider()

    @staticmethod
    def generate_key() -> bytes:
        """Generates a random 256-bit (32 bytes) AES encryption key."""
        return AESGCM.generate_key(bit_length=256)

    def get_master_key(self) -> bytes:
        """Retrieves 32-byte master envelope key from active KMS provider."""
        return self._provider.get_master_key()

    def wrap_file_key(self, file_key: bytes) -> str:
        """
        Encrypts a file key using the server Master Key (Envelope Encryption).
        Returns hex string representation of nonce + encrypted_key.
        """
        master_key = self.get_master_key()
        aesgcm = AESGCM(master_key)
        nonce = os.urandom(12)
        encrypted_key = aesgcm.encrypt(nonce, file_key, None)
        return (nonce + encrypted_key).hex()

    def unwrap_file_key(self, wrapped_key_hex: str) -> bytes:
        """
        Decrypts a wrapped file key using the server Master Key.
        """
        master_key = self.get_master_key()
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

