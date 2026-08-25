from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.deps import require_role
from app.core.security import hash_password
from app.services.key_rotation_service import rotate_all_keys
from app.services.audit_service import log_activity

router = APIRouter(prefix="/admin", tags=["Admin Management"])


class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class AdminRoleUpdate(BaseModel):
    role: str


@router.get("/users", response_model=List[UserResponse])
def list_admin_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """List all registered system users (Admin only)."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserResponse)
def create_admin_user(
    user_in: AdminUserCreate,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin-only creation/invitation of a system user with explicit role assignment."""
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    assigned_role = user_in.role if user_in.role in ["user", "manager", "admin"] else "user"

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=assigned_role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(
        db, action="ADMIN_USER_CREATE", user_id=current_user.id, target_type="USER",
        target_id=str(user.id), ip_address=request.client.host,
        details=f"Created user {user.username} with role {user.role}"
    )
    return user


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_in: AdminRoleUpdate,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Update role of an existing user (Admin only)."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if role_in.role not in ["user", "manager", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    target_user.role = role_in.role
    db.commit()
    db.refresh(target_user)

    log_activity(
        db, action="ADMIN_ROLE_CHANGE", user_id=current_user.id, target_type="USER",
        target_id=str(target_user.id), ip_address=request.client.host,
        details=f"Changed role of user {target_user.username} to {target_user.role}"
    )
    return target_user


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

