from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.alert import SecurityAlert

def log_activity(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    ip_address: str = "127.0.0.1",
    user_agent: str = "TrustShare Client",
    status: str = "SUCCESS",
    details: Optional[str] = None
):
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id else None,
        ip_address=ip_address,
        user_agent=user_agent,
        status=status,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # Suspicious Activity Detection Engine
    if status == "DENIED" or action in ["AUTH_FAILURE", "UNAUTHORIZED_ACCESS", "BURST_DOWNLOAD"]:
        check_suspicious_activity(db, user_id=user_id, ip_address=ip_address, action=action)

    return log_entry

def check_suspicious_activity(db: Session, user_id: Optional[int], ip_address: str, action: str):
    time_window = datetime.utcnow() - timedelta(minutes=5)
    recent_denied = db.query(AuditLog).filter(
        AuditLog.ip_address == ip_address,
        AuditLog.timestamp >= time_window,
        AuditLog.status == "DENIED"
    ).count()

    if recent_denied >= 3:
        alert = SecurityAlert(
            user_id=user_id,
            severity="HIGH" if recent_denied > 5 else "MEDIUM",
            title=f"Suspicious Failed Access Attempts from {ip_address}",
            description=f"Detected {recent_denied} failed access/auth attempts within 5 minutes from IP {ip_address}.",
            timestamp=datetime.utcnow()
        )
        db.add(alert)
        db.commit()
