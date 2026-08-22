from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ShareCreate(BaseModel):
    file_id: int
    permission: str = "download" # view, download, edit
    passphrase: Optional[str] = None
    expires_in_hours: Optional[int] = 24
    max_downloads: Optional[int] = None

class ShareResponse(BaseModel):
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

    class Config:
        from_attributes = True

class ShareAccessRequest(BaseModel):
    passphrase: Optional[str] = None
