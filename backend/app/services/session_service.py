from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.session import Session as SessionModel
from app.models.user import User

class SessionService:
    @staticmethod
    def create_session(
        db: Session,
        user_id: int,
        refresh_token: str,
        expires_at: datetime,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> SessionModel:
        device_info = "Desktop / Browser"
        if user_agent:
            ua_lower = user_agent.lower()
            if "mobile" in ua_lower or "android" in ua_lower or "iphone" in ua_lower:
                device_info = "Mobile Device"
            elif "tablet" in ua_lower or "ipad" in ua_lower:
                device_info = "Tablet Device"
            elif "windows" in ua_lower:
                device_info = "Windows PC"
            elif "macintosh" in ua_lower or "mac os" in ua_lower:
                device_info = "macOS Workstation"
            elif "linux" in ua_lower:
                device_info = "Linux Client"

        session = SessionModel(
            user_id=user_id,
            refresh_token=refresh_token,
            ip_address=ip_address,
            user_agent=user_agent,
            device_info=device_info,
            expires_at=expires_at,
            is_revoked=False
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def list_active_sessions(db: Session, user_id: int) -> List[SessionModel]:
        now = datetime.utcnow()
        return db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.is_revoked == False,
            SessionModel.expires_at > now
        ).order_by(SessionModel.created_at.desc()).all()

    @staticmethod
    def revoke_session(db: Session, session_id: int, user_id: int) -> bool:
        session = db.query(SessionModel).filter(
            SessionModel.id == session_id,
            SessionModel.user_id == user_id
        ).first()
        if not session:
            return False
        session.is_revoked = True
        db.commit()
        return True

    @staticmethod
    def revoke_all_user_sessions(db: Session, user_id: int):
        db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.is_revoked == False
        ).update({"is_revoked": True})
        db.commit()

session_service = SessionService()
