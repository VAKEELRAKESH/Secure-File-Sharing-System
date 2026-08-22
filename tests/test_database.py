from app.database.session import check_database_connection, engine, SessionLocal, Base
from sqlalchemy import text

def test_database_connection_successful():
    """Verify database connection is healthy."""
    assert check_database_connection() is True

def test_database_session_executes_queries():
    """Verify SQLAlchemy session connects and executes raw SQL queries."""
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT 1")).scalar()
        assert result == 1
    finally:
        db.close()
