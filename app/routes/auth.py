from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    MfaSetupResponse, MfaVerifyRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    generate_mfa_secret, get_mfa_uri, generate_qr_base64, verify_mfa_code
)
from app.services.audit_service import log_activity
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from app.config.settings import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        if email is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    return user

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        log_activity(db, action="REGISTER_FAILED", ip_address=request.client.host, status="DENIED", details="User or email already exists")
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role if user_in.role in ["user", "manager", "admin"] else "user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, action="REGISTER", user_id=user.id, target_type="USER", target_id=str(user.id), ip_address=request.client.host)
    return user

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        log_activity(db, action="AUTH_FAILURE", ip_address=request.client.host, status="DENIED", details=f"Failed login attempt for {login_in.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

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
