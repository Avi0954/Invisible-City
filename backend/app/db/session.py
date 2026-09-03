from typing import Generator, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

# Create SQLAlchemy database engine
# pool_pre_ping ensures connections are validated before reuse
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency generator for acquiring SQLAlchemy database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Tuple[bool, str]:
    """
    Executes a lightweight query to verify active PostgreSQL database connectivity.
    Returns (is_connected: bool, message: str)
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                return True, "PostgreSQL connection successful"
            return False, "Unexpected query response"
    except Exception as e:
        logger.warning(f"Database connection check failed: {str(e)}")
        return False, f"Connection failed: {str(e)}"
