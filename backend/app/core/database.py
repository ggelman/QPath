from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings
from urllib.parse import quote_plus
import logging

logger = logging.getLogger(__name__)

# Create database URL with proper encoding
def get_database_url():
    """Get properly encoded database URL"""
    # TEMPORARY: Hardcoded URL for debugging with new password
    return "postgresql://postgres:qpath123@localhost:5432/qpath_db"
    
    # Original code (commented for debugging)
    # password = quote_plus(settings.DATABASE_PASSWORD or "dev_password")
    # return f"postgresql://{settings.DATABASE_USER}:{password}@{settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"

# Create database engine
engine = create_engine(
    get_database_url(),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
)

# Create tables
def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)


def init_db():
    """Initialize database - alias for create_db_and_tables"""
    try:
        # Import all models to ensure they are registered
        from app.models import models  # noqa: F401
        
        create_db_and_tables()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Database initialization failed: %s", str(e))
        logger.warning("Continuing without database...")

# Database session dependency
def get_session():
    """Get database session"""
    session = Session(engine)
    try:
        yield session
    except Exception as e:
        logger.error("Database session error: %s", str(e))
        session.rollback()
        raise
    finally:
        session.close()

# Test database connection
def test_db_connection():
    """Test database connection"""
    try:
        with Session(engine) as session:
            session.exec("SELECT 1").first()
            return True
    except Exception as e:
        logger.error("Database connection failed: %s", str(e))
        return False