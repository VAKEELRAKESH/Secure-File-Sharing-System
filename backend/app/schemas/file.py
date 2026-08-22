from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None

class FolderResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FileResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size_bytes: int
    mime_type: str
    category: str
    tags: Optional[str]
    version: int
    folder_id: Optional[int]
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FileVersionResponse(BaseModel):
    id: int
    file_id: int
    version_number: int
    file_size_bytes: int
    created_at: datetime

    class Config:
        from_attributes = True
