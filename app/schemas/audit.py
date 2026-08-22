from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    ip_address: str
    user_agent: str
    status: str
    details: Optional[str]
    timestamp: datetime

class SecurityAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    severity: str
    title: str
    description: str
    is_resolved: bool
    timestamp: datetime
