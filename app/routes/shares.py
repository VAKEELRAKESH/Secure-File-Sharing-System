import secrets
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.database.session import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.share import FileShare
from app.schemas.share import ShareCreate, ShareResponse, ShareAccessRequest
from app.routes.auth import get_current_user
from app.security import hash_password, verify_password
from app.services.storage_service import storage_service
from app.services.audit_service import log_activity

router = APIRouter(prefix="/shares", tags=["Secure Sharing"])

@router.post("", response_model=ShareResponse)
def create_share_link(
    share_in: ShareCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(FileModel).filter(FileModel.id == share_in.file_id).first()
    if not db_file or (db_file.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="File not found or permission denied")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=share_in.expires_in_hours) if share_in.expires_in_hours else None
    passphrase_hash = hash_password(share_in.passphrase) if share_in.passphrase else None

    file_share = FileShare(
        file_id=db_file.id,
        share_token=token,
        permission=share_in.permission,
        passphrase_hash=passphrase_hash,
        expires_at=expires_at,
        max_downloads=share_in.max_downloads,
        created_by_id=current_user.id
    )

    db.add(file_share)
    db.commit()
    db.refresh(file_share)

    log_activity(db, action="CREATE_SHARE", user_id=current_user.id, target_type="SHARE", target_id=str(file_share.id), ip_address=request.client.host)

    return {
        "id": file_share.id,
        "file_id": file_share.file_id,
        "share_token": file_share.share_token,
        "share_url": f"/share/{token}",
        "permission": file_share.permission,
        "has_passphrase": bool(file_share.passphrase_hash),
        "expires_at": file_share.expires_at,
        "max_downloads": file_share.max_downloads,
        "download_count": file_share.download_count,
        "created_at": file_share.created_at
    }

@router.get("", response_model=List[ShareResponse])
def list_user_shares(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    shares = db.query(FileShare).filter(FileShare.created_by_id == current_user.id).all()
    return [
        {
            "id": s.id,
            "file_id": s.file_id,
            "share_token": s.share_token,
            "share_url": f"/share/{s.share_token}",
            "permission": s.permission,
            "has_passphrase": bool(s.passphrase_hash),
            "expires_at": s.expires_at,
            "max_downloads": s.max_downloads,
            "download_count": s.download_count,
            "created_at": s.created_at
        }
        for s in shares
    ]

@router.get("/access/{token}/info")
def get_share_info(token: str, db: Session = Depends(get_db)):
    share = db.query(FileShare).filter(FileShare.share_token == token).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share link invalid or expired")

    if share.expires_at and datetime.utcnow() > share.expires_at:
        raise HTTPException(status_code=410, detail="Share link has expired")

    if share.max_downloads and share.download_count >= share.max_downloads:
        raise HTTPException(status_code=410, detail="Maximum download limit reached for this share link")

    file_info = db.query(FileModel).filter(FileModel.id == share.file_id).first()
    if not file_info:
        raise HTTPException(status_code=404, detail="Shared file no longer exists")

    return {
        "filename": file_info.filename,
        "file_size_bytes": file_info.file_size_bytes,
        "category": file_info.category,
        "permission": share.permission,
        "requires_passphrase": bool(share.passphrase_hash),
        "expires_at": share.expires_at,
        "download_count": share.download_count,
        "max_downloads": share.max_downloads
    }

@router.post("/access/{token}/download")
def download_shared_file(
    token: str,
    access_req: ShareAccessRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    share = db.query(FileShare).filter(FileShare.share_token == token).first()
    if not share:
        log_activity(db, action="INVALID_SHARE_ACCESS", status="DENIED", details=f"Attempted access with token {token}")
        raise HTTPException(status_code=404, detail="Invalid share link")

    if share.expires_at and datetime.utcnow() > share.expires_at:
        log_activity(db, action="EXPIRED_SHARE_ACCESS", status="DENIED", details=f"Attempted access expired token {token}")
        raise HTTPException(status_code=410, detail="Share link expired")

    if share.max_downloads and share.download_count >= share.max_downloads:
        log_activity(db, action="MAX_DOWNLOADS_EXCEEDED", status="DENIED", details=f"Max download cap reached for share {token}")
        raise HTTPException(status_code=410, detail="Download limit exceeded")

    if share.passphrase_hash:
        if not access_req.passphrase or not verify_password(access_req.passphrase, share.passphrase_hash):
            log_activity(db, action="INVALID_PASSPHRASE", status="DENIED", ip_address=request.client.host)
            raise HTTPException(status_code=401, detail="Incorrect passphrase for share link")

    db_file = db.query(FileModel).filter(FileModel.id == share.file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Shared file not found")

    try:
        decrypted_bytes = storage_service.read_decrypted_file(db_file.encrypted_path, db_file.encryption_key_enc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")

    share.download_count += 1
    db.commit()

    log_activity(db, action="SHARED_FILE_DOWNLOAD", target_type="SHARE", target_id=str(share.id), ip_address=request.client.host)

    return StreamingResponse(
        BytesIO(decrypted_bytes),
        media_type=db_file.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{db_file.filename}"'}
    )
