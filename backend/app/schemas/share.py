from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ShareCreate(BaseModel):
    file_id: int
    permission: str = "download" # view, download, edit
    passphrase: Optional[str] = None
    expires_in_hours: Optional[int] = 24
    max_downloads: Optional[int] = None

class ShareResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_id: int
    share_token: str
    share_url: str
    permission: str
    has_passphrase: bool
    expires_at: Optional[datetime]
    max_downloads: Optional[int]
    download_count: int
    created_at: datetime

class ShareAccessRequest(BaseModel):
    passphrase: Optional[str] = None

class DirectShareCreate(BaseModel):
    file_id: int
    recipient_email: str
    permission: str = "download" # view, download
    expires_in_hours: Optional[int] = 168 # 7 days default
    passphrase: Optional[str] = None

class ReceivedShareResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_id: int
    filename: str
    file_size_bytes: int
    mime_type: str
    category: str
    permission: str
    sender_name: str
    sender_email: str
    has_passphrase: bool
    expires_at: Optional[datetime]
    created_at: datetime
