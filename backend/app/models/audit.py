from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False, index=True) # LOGIN, UPLOAD, DOWNLOAD, SHARE, DELETE, AUTH_FAILURE, REKEY
    target_type = Column(String, nullable=True) # FILE, SHARE, USER, SYSTEM
    target_id = Column(String, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    user_agent = Column(String, default="TrustShare Web Client")
    status = Column(String, default="SUCCESS") # SUCCESS, DENIED, WARNING
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
