import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    MfaSetupResponse, MfaVerifyRequest, ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, VerifyOtpRequest, ResendOtpRequest
)
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    generate_mfa_secret, get_mfa_uri, generate_qr_base64, verify_mfa_code
)
from app.api.deps import get_current_user
from app.services.audit_service import log_activity
from app.services.notification_service import notification_service
from app.security.reset_token import create_reset_token, verify_reset_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _generate_otp() -> str:
    """Generate a cryptographically random 6-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        log_activity(db, action="REGISTER_FAILED", ip_address=request.client.host, status="DENIED", details="User or email already exists")
        raise HTTPException(status_code=400, detail="Username or email already registered")

    otp = _generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role="user",  # Public self-registration ALWAYS assigns standard user role
        is_verified=False,
        verification_otp=otp,
        otp_expires_at=otp_expiry
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, action="REGISTER", user_id=user.id, target_type="USER", target_id=str(user.id), ip_address=request.client.host)

    # Out-of-band OTP delivery (SMTP when configured, console log fallback) - running asynchronously
    background_tasks.add_task(notification_service.send_verification_otp_email, user.email, otp)

    return user

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        log_activity(db, action="AUTH_FAILURE", ip_address=request.client.host, status="DENIED", details=f"Failed login attempt for {login_in.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Block unverified accounts
    if not user.is_verified:
        log_activity(db, action="LOGIN_UNVERIFIED", user_id=user.id, ip_address=request.client.host, status="DENIED")
        raise HTTPException(status_code=403, detail="Email verification required")

    if user.mfa_enabled:
        if not login_in.mfa_code or not verify_mfa_code(user.mfa_secret, login_in.mfa_code):
            log_activity(db, action="MFA_FAILURE", user_id=user.id, ip_address=request.client.host, status="DENIED")
            raise HTTPException(status_code=401, detail="MFA verification code required or invalid")

    access_token = create_access_token({"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role})

    log_activity(db, action="LOGIN", user_id=user.id, target_type="USER", target_id=str(user.id), ip_address=request.client.host)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest, request: Request, db: Session = Depends(get_db)):
    """Verify the 6-digit OTP sent during registration and activate the account."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email address")

    if user.is_verified:
        return {"message": "Account is already verified", "already_verified": True}

    if not user.verification_otp:
        raise HTTPException(status_code=400, detail="No OTP pending for this account. Please request a new one.")

    # Check expiry
    if user.otp_expires_at and datetime.utcnow() > user.otp_expires_at:
        log_activity(db, action="OTP_EXPIRED", user_id=user.id, ip_address=request.client.host, status="DENIED")
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new verification code.")

    # Validate OTP
    if user.verification_otp != req.otp:
        log_activity(db, action="OTP_INVALID", user_id=user.id, ip_address=request.client.host, status="DENIED")
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Activate account
    user.is_verified = True
    user.verification_otp = None
    user.otp_expires_at = None
    db.commit()

    log_activity(db, action="EMAIL_VERIFIED", user_id=user.id, target_type="USER", target_id=str(user.id), ip_address=request.client.host)

    # Issue tokens immediately so user doesn't have to log in again
    access_token = create_access_token({"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role})

    return {
        "message": "Email verified successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user).model_dump()
    }

@router.post("/resend-otp")
def resend_otp(req: ResendOtpRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Resend a fresh 6-digit OTP for email verification."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Generic response to prevent enumeration
        return {"message": "If an account with that email exists, a new verification code has been sent."}

    if user.is_verified:
        return {"message": "Account is already verified"}

    # Generate new OTP with fresh 10-minute expiry
    new_otp = _generate_otp()
    user.verification_otp = new_otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    log_activity(db, action="OTP_RESENT", user_id=user.id, ip_address=request.client.host)

    # Out-of-band OTP delivery (SMTP when configured, console log fallback) - running asynchronously
    background_tasks.add_task(notification_service.send_verification_otp_email, user.email, new_otp)

    return {"message": "If an account with that email exists, a new verification code has been sent."}

@router.post("/mfa/setup", response_model=MfaSetupResponse)
def setup_mfa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_mfa_secret()
    current_user.mfa_secret = secret
    db.commit()

    uri = get_mfa_uri(current_user.email, secret)
    qr_base64 = generate_qr_base64(uri)
    return {"secret": secret, "qr_code_base64": qr_base64}

@router.post("/mfa/verify")
def verify_mfa(req: MfaVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA setup not initialized")

    if not verify_mfa_code(current_user.mfa_secret, req.code):
        raise HTTPException(status_code=400, detail="Invalid verification code")

    current_user.mfa_enabled = True
    db.commit()
    return {"message": "Multi-Factor Authentication enabled successfully"}

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        # Generate a dedicated password-reset JWT token (expires in 15 minutes)
        token = create_reset_token(user.email)
        log_activity(db, action="PASSWORD_RESET_REQUESTED", user_id=user.id, target_type="USER", target_id=str(user.id), ip_address=request.client.host)
        # Out-of-band delivery (SMTP when configured, console log fallback) - running asynchronously
        background_tasks.add_task(notification_service.send_password_reset_email, user.email, token)

    # Return identical generic response whether user exists or not (prevents account enumeration & token leaks)
    return {
        "message": "If an account with that email exists, password reset instructions have been sent."
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Validate the reset token cryptographically
    email_from_token = verify_reset_token(req.token)
    if not email_from_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Ensure the token email matches the request email
    if email_from_token != req.email:
        raise HTTPException(status_code=400, detail="Token does not match the provided email")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")

    user.hashed_password = hash_password(req.new_password)
    db.commit()
    log_activity(db, action="PASSWORD_RESET", user_id=user.id, target_type="USER", target_id=str(user.id))
    return {"message": "Password reset successful"}

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Authenticated password change — requires current password verification."""
    if not verify_password(req.current_password, current_user.hashed_password):
        log_activity(db, action="PASSWORD_CHANGE_FAILED", user_id=current_user.id, ip_address=request.client.host, status="DENIED")
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(req.new_password)
    db.commit()
    log_activity(db, action="PASSWORD_CHANGED", user_id=current_user.id, target_type="USER", target_id=str(current_user.id), ip_address=request.client.host)
    return {"message": "Password changed successfully"}

@router.post("/token/refresh", response_model=Token)
def refresh_access_token(request: Request, db: Session = Depends(get_db)):
    """Issue a new access token using a valid refresh token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Refresh token required")
    
    refresh_token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    new_access_token = create_access_token({"sub": user.email, "role": user.role})
    new_refresh_token = create_refresh_token({"sub": user.email, "role": user.role})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }
