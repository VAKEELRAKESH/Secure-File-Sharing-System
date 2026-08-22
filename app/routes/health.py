from fastapi import APIRouter, HTTPException, status
from app.database.session import check_database_connection

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """
    Health-check endpoint.
    Verifies application and database status.
    Returns {"status": "healthy"}.
    """
    db_ok = check_database_connection()
    if not db_ok:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failure"
        )
    return {"status": "healthy"}
