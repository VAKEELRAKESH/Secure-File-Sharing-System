from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.models.alert import SecurityAlert
from app.schemas.audit import AuditLogResponse, SecurityAlertResponse
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/audit", tags=["Audit & Security Monitoring"])

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

@router.put("/alerts/{alert_id}/resolve")
def resolve_security_alert(
    alert_id: int,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    alert = db.query(SecurityAlert).filter(SecurityAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    db.commit()
    return {"message": "Security alert marked as resolved"}
