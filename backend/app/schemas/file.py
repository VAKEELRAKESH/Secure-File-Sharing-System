from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None

class FolderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    parent_id: Optional[int]
    owner_id: int
    created_at: datetime

class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

class FileVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_id: int
    version_number: int
    file_size_bytes: int
    created_at: datetime
