from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.share import FileShare
from app.models.audit import AuditLog
from app.models.alert import SecurityAlert
from app.schemas.analytics import SystemAnalyticsResponse
from app.routes.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=SystemAnalyticsResponse)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        file_query = db.query(FileModel)
        total_users = db.query(User).count()
        total_downloads = db.query(func.sum(FileShare.download_count)).scalar() or 0
        total_shares = db.query(FileShare).count()
        total_alerts = db.query(SecurityAlert).filter(SecurityAlert.is_resolved == False).count()
    else:
        file_query = db.query(FileModel).filter(FileModel.owner_id == current_user.id)
        total_users = 1
        total_downloads = db.query(func.sum(FileShare.download_count)).join(FileModel).filter(FileModel.owner_id == current_user.id).scalar() or 0
        total_shares = db.query(FileShare).filter(FileShare.created_by_id == current_user.id).count()
        total_alerts = db.query(SecurityAlert).filter(SecurityAlert.user_id == current_user.id, SecurityAlert.is_resolved == False).count()

    total_files = file_query.count()
    total_storage = db.query(func.sum(FileModel.file_size_bytes)).scalar() or 0

    categories = db.query(FileModel.category, func.count(FileModel.id)).group_by(FileModel.category).all()
    category_dist = {cat or "General": cnt for cat, cnt in categories}

    mimes = db.query(FileModel.mime_type, func.count(FileModel.id)).group_by(FileModel.mime_type).all()
    type_dist = {m or "Unknown": cnt for m, cnt in mimes}

    recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(5).all()
    recent_activity = [
        {
            "id": l.id,
            "action": l.action,
            "status": l.status,
            "timestamp": l.timestamp.isoformat(),
            "details": l.details
        }
        for l in recent_logs
    ]

    return {
        "total_users": total_users,
        "total_files": total_files,
        "total_storage_bytes": total_storage,
        "total_downloads": total_downloads,
        "active_shares_count": total_shares,
        "security_alerts_count": total_alerts,
        "category_distribution": category_dist,
        "file_type_breakdown": type_dist,
        "recent_activity": recent_activity
    }
