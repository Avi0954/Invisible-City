import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Set test environment variables
os.environ["ENVIRONMENT"] = "testing"
os.environ["JWT_SECRET_KEY"] = "test_super_secret_jwt_key_32_bytes_minimum!"
os.environ["JWT_REFRESH_SECRET_KEY"] = "test_super_secret_refresh_jwt_key_32_bytes_minimum!"

from app.main import app
from app.db.session import get_db
from app.models import Base  # Explicitly import app.models so all ORM models register on Base.metadata

# Single in-memory SQLite database connection shared across sessions via StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(setup_db):
    """Fixture providing a database session."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Fixture providing FastAPI TestClient with overridden get_db dependency."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
