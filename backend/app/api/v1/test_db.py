"""
Test endpoint for database debugging
"""
from fastapi import APIRouter
from app.core.database import engine
from sqlalchemy.sql import text

router = APIRouter()

@router.get("/test-db")
async def test_database_connection():
    """Test database connection directly"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 'Database connection working!' as message;"))
            row = result.fetchone()
            return {"status": "success", "message": row[0]}
    except Exception as e:
        return {"status": "error", "message": str(e)}