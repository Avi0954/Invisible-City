import os
from typing import Generator, Tuple, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger


def _init_engine():
    """Initializes SQLAlchemy database engine strictly for configured DATABASE_URL (PostgreSQL)."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql"):
        return create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=False
        )
    else:
        # Allows sqlite:///:memory: only when DATABASE_URL is explicitly set for testing
        connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
        return create_engine(db_url, connect_args=connect_args)


# Create SQLAlchemy database engine
engine = _init_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency generator for acquiring SQLAlchemy database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Tuple[bool, str, Dict[str, Any]]:
    """
    Executes a lightweight query to verify active PostgreSQL database connectivity.
    Probes for PostGIS and pgvector extension availability.
    Returns (is_connected: bool, message: str, details: Dict[str, Any])
    """
    details: Dict[str, Any] = {
        "database": engine.dialect.name,
        "postgis": False,
        "pgvector": False
    }

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                db_driver = engine.dialect.name
                if db_driver == "postgresql":
                    try:
                        postgis_ver = conn.execute(text("SELECT PostGIS_Version()")).scalar()
                        details["postgis"] = bool(postgis_ver)
                    except Exception:
                        details["postgis"] = False

                    try:
                        vec_exists = conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'")).scalar()
                        details["pgvector"] = bool(vec_exists)
                    except Exception:
                        details["pgvector"] = False

                    return True, "PostgreSQL connection successful", details
                else:
                    return True, f"{db_driver} connection successful", details
            return False, "Unexpected query response", details
    except Exception as e:
        logger.warning(f"Database connection check failed: {str(e)}")
        return False, f"PostgreSQL connection failed: {str(e)}", details


