"""Admin-only system management API: key rotation, user management, system health."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.deps import require_role
from app.services.key_rotation_service import rotate_all_keys

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.post("/key-rotation")
def trigger_key_rotation(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Trigger a system-wide AES-256 key rotation.
    Re-encrypts all files with new per-file keys wrapped under the current master key.
    Admin-only operation.
    """
    result = rotate_all_keys(db, user_id=current_user.id)
    return {
        "message": "Key rotation completed",
        "details": result
    }
