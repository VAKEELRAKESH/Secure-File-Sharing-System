import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TrustShare - Secure File Sharing"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-trustshare-jwt-key-2026-secure-aes256")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Master Key for AES-256 envelope key wrapping (32 bytes hex = 64 chars)
    MASTER_ENCRYPTION_KEY: str = os.getenv(
        "MASTER_ENCRYPTION_KEY",
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    )
    
    # Storage configuration
    STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage_encrypted")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustshare.db")

    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
