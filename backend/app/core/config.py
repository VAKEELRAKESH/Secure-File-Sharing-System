import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "TrustShare - Secure File Sharing"
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # JWT Configuration
    SECRET_KEY: str = "super-secret-trustshare-jwt-key-2026-secure-aes256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Master Key for AES-256 envelope key wrapping (32 bytes hex = 64 chars)
    MASTER_ENCRYPTION_KEY: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    
    # Key Management Service (KMS) Provider (local, aws_kms, azure_keyvault, hashicorp_vault)
    KMS_PROVIDER: str = "local"
    AWS_KMS_KEY_ID: Optional[str] = None
    AZURE_KEYVAULT_URL: Optional[str] = None

    # Storage configuration
    STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage_encrypted")
    STORAGE_BACKEND: str = "local"  # local, s3, azure

    # Cloud Storage (AWS S3)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    AWS_S3_REGION: str = "us-east-1"

    # Cloud Storage (Azure Blob)
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = None
    AZURE_CONTAINER_NAME: Optional[str] = None

    # Database
    DATABASE_URL: str = "sqlite:///./trustshare.db"
    
    # Redis (session management, token blacklist, rate limiting)
    REDIS_URL: Optional[str] = None
    
    # Email / Notification Settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@trustshare.io"
    SENDGRID_API_KEY: Optional[str] = None

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
