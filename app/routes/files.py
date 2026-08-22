import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Form, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.database.session import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.folder import Folder as FolderModel
from app.schemas.file import FileResponse, FolderCreate, FolderResponse
from app.services.storage_service import storage_service
from app.services.audit_service import log_activity
from app.routes.auth import get_current_user

router = APIRouter(prefix="/files", tags=["File Management"])

MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 # 100 MB max

def get_file_category(filename: str, mime: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext in ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt']:
        return "Document"
    elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']:
        return "Image"
    elif ext in ['.mp4', '.mov', '.avi', '.mkv']:
        return "Video"
    elif ext in ['.zip', '.tar', '.gz', '.7z', '.rar']:
        return "Archive"
    elif ext in ['.py', '.js', '.ts', '.html', '.css', '.json', '.sql']:
        return "Code"
    return "General"

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    request: Request,
    file: UploadFile = FastAPIFile(...),
    folder_id: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds maximum threshold of 100MB")

    cat = category if category else get_file_category(file.filename, file.content_type)

    encrypted_path, wrapped_key_hex, size_bytes = storage_service.store_encrypted_file(contents, file.filename)

    db_file = FileModel(
        filename=file.filename,
        original_filename=file.filename,
        file_size_bytes=size_bytes,
        mime_type=file.content_type or "application/octet-stream",
        category=cat,
        tags=tags,
        encrypted_path=encrypted_path,
        encryption_key_enc=wrapped_key_hex,
        folder_id=folder_id,
        owner_id=current_user.id
    )

    current_user.storage_used_bytes += size_bytes
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    log_activity(
        db, action="UPLOAD", user_id=current_user.id, target_type="FILE",
        target_id=str(db_file.id), ip_address=request.client.host,
        details=f"Uploaded {file.filename} ({size_bytes} bytes) encrypted with AES-256"
    )

    return db_file

@router.get("", response_model=List[FileResponse])
def list_files(
    search: Optional[str] = None,
    folder_id: Optional[int] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(FileModel).filter(FileModel.owner_id == current_user.id)
    
    if folder_id is not None:
        query = query.filter(FileModel.folder_id == folder_id)
    if category:
        query = query.filter(FileModel.category == category)
    if search:
        query = query.filter(FileModel.filename.ilike(f"%{search}%"))

    return query.order_by(FileModel.created_at.desc()).all()

@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if db_file.owner_id != current_user.id and current_user.role != "admin":
        log_activity(db, action="UNAUTHORIZED_ACCESS", user_id=current_user.id, target_type="FILE", target_id=str(file_id), status="DENIED")
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        decrypted_bytes = storage_service.read_decrypted_file(db_file.encrypted_path, db_file.encryption_key_enc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption error: {str(e)}")

    log_activity(db, action="DOWNLOAD", user_id=current_user.id, target_type="FILE", target_id=str(file_id), ip_address=request.client.host)

    return StreamingResponse(
        BytesIO(decrypted_bytes),
        media_type=db_file.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{db_file.filename}"'}
    )

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if db_file.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    storage_service.delete_encrypted_file(db_file.encrypted_path)
    current_user.storage_used_bytes = max(0, current_user.storage_used_bytes - db_file.file_size_bytes)
    
    db.delete(db_file)
    db.commit()

    log_activity(db, action="DELETE", user_id=current_user.id, target_type="FILE", target_id=str(file_id), ip_address=request.client.host)
    return {"message": "File deleted successfully"}
