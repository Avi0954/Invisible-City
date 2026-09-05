import os
from typing import Generator, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger


def _init_engine():
    """Initializes SQLAlchemy engine with Postgres connection probe and SQLite demo fallback."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql"):
        try:
            # Probe Postgres connection quickly with connect_timeout=2
            test_engine = create_engine(
                db_url,
                connect_args={"connect_timeout": 2},
                pool_pre_ping=True
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            test_engine.dispose()
            logger.info("Connected to configured PostgreSQL database.")
            return create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=False
            )
        except Exception as e:
            db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../invisible_city_demo.db"))
            sqlite_url = f"sqlite:///{db_path}"
            logger.warning(f"PostgreSQL not reachable at {db_url}. Falling back to SQLite demo database ({sqlite_url}): {e}")
            return create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )
    else:
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


def check_db_connection() -> Tuple[bool, str]:
    """
    Executes a lightweight query to verify active database connectivity.
    Returns (is_connected: bool, message: str)
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                db_driver = engine.dialect.name
                if db_driver == "postgresql":
                    return True, "PostgreSQL connection successful"
                else:
                    return True, "SQLite demo connection successful"
            return False, "Unexpected query response"
    except Exception as e:
        logger.warning(f"Database connection check failed: {str(e)}")
        return False, f"Connection failed: {str(e)}"

