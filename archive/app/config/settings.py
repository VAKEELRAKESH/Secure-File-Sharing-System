import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "TrustShare - Secure File Sharing System"
    SECRET_KEY: str = Field(..., description="Master JWT secret key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    MASTER_ENCRYPTION_KEY: str = Field(..., description="32-byte hex string for AES-256 master key")
    DATABASE_URL: str = "sqlite:///./trustshare.db"
    STORAGE_DIR: str = "./storage_encrypted"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("MASTER_ENCRYPTION_KEY")
    @classmethod
    def validate_master_key(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError("MASTER_ENCRYPTION_KEY must be at least 32 characters long for AES-256 security")
        return v

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or v == "default-unsafe-key":
            raise ValueError("SECRET_KEY must be set to a strong non-default secret")
        return v

def get_settings() -> Settings:
    return Settings()

settings = get_settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
