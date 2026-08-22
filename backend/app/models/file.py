from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from app.core.database import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False, index=True)
    original_filename = Column(String, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String, default="application/octet-stream")
    category = Column(String, default="General") # Document, Image, Video, Archive, Code, General
    tags = Column(String, default="") # Comma-separated tags
    
    # Server-Side Encryption Metadata
    encrypted_path = Column(String, nullable=False)
    encryption_key_enc = Column(String, nullable=False) # Envelope wrapped AES-256 key
    version = Column(Integer, default=1)
    
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")
    shares = relationship("FileShare", back_populates="file", cascade="all, delete-orphan")
    versions = relationship("FileVersion", back_populates="file", cascade="all, delete-orphan")


class FileVersion(Base):
    __tablename__ = "file_versions"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    encrypted_path = Column(String, nullable=False)
    encryption_key_enc = Column(String, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("File", back_populates="versions")
