from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.database import engine, Base
from app.core.rate_limiter import limiter
from app.api import auth, files, shares, audit, analytics, admin

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrustShare API",
    description="Enterprise Secure File-Sharing and Document Management Platform API with AES-256 Server-Side Encryption",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(shares.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "TrustShare Secure File Sharing Platform API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
