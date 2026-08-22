from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.models.alert import SecurityAlert
from app.schemas.audit import AuditLogResponse, SecurityAlertResponse
from app.routes.auth import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Logging"])

@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if current_user.role != "admin":
        query = query.filter(AuditLog.user_id == current_user.id)
    if action:
        query = query.filter(AuditLog.action == action)

    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/alerts", response_model=List[SecurityAlertResponse])
def get_security_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SecurityAlert)
    if current_user.role != "admin":
        query = query.filter(SecurityAlert.user_id == current_user.id)
    return query.order_by(SecurityAlert.timestamp.desc()).all()
