from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class FileShare(Base):
    __tablename__ = "file_shares"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    share_token = Column(String, unique=True, index=True, nullable=False)
    permission = Column(String, default="download") # view, download, edit
    passphrase_hash = Column(String, nullable=True) # Optional password protection
    expires_at = Column(DateTime, nullable=True)
    max_downloads = Column(Integer, nullable=True)
    download_count = Column(Integer, default=0)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_email = Column(String, nullable=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("File", back_populates="shares")
    creator = relationship("User", foreign_keys=[created_by_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
