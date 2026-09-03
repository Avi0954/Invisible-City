import pytest
from fastapi import status
from app.models.user import UserRole
from app.models.report import Report, ReportCategory, ReportStatus
from app.core.security import create_access_token
from datetime import timedelta


def test_user_registration(client):
    """Test successful user registration."""
    payload = {
        "name": "Jane Citizen",
        "email": "jane@example.com",
        "password": "Password123!",
        "role": "CITIZEN"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["role"] == "CITIZEN"


def test_duplicate_registration(client):
    """Test registering an existing email returns HTTP 409 Conflict."""
    payload = {
        "name": "Original User",
        "email": "duplicate@example.com",
        "password": "Password123!",
        "role": "CITIZEN"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == status.HTTP_201_CREATED

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in res2.json()["error"]["message"]


def test_login_success(client):
    """Test authenticating with valid user credentials."""
    # Register first
    reg_payload = {
        "name": "Login User",
        "email": "login@example.com",
        "password": "SecurePassword123!",
        "role": "CITIZEN"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Login
    login_payload = {
        "email": "login@example.com",
        "password": "SecurePassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"


def test_login_invalid_password(client):
    """Test login with incorrect password returns HTTP 401 Unauthorized."""
    reg_payload = {
        "name": "User One",
        "email": "user1@example.com",
        "password": "CorrectPassword123!"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "user1@example.com",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid email or password" in response.json()["error"]["message"]


def test_token_refresh(client):
    """Test exchanging a valid refresh token for a new access token."""
    reg_payload = {
        "name": "Refresh User",
        "email": "refresh@example.com",
        "password": "Password123!"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload).json()
    refresh_token = reg_res["refresh_token"]

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_logout(client):
    """Test user logout with authorization header."""
    reg_payload = {
        "name": "Logout User",
        "email": "logout@example.com",
        "password": "Password123!"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload).json()
    access_token = reg_res["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Successfully logged out."


def test_citizen_authorization(client):
    """Test GET /api/v1/auth/me for authenticated citizen."""
    reg_payload = {
        "name": "Citizen User",
        "email": "citizen@example.com",
        "password": "Password123!",
        "role": "CITIZEN"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload).json()
    token = reg_res["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["role"] == "CITIZEN"


def test_admin_authorization(client):
    """Test registration and authorization for admin user role."""
    reg_payload = {
        "name": "Admin Person",
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "role": "ADMIN"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload).json()
    token = reg_res["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["role"] == "ADMIN"


def test_token_expiration(client):
    """Test access attempt with an expired token fails with HTTP 401."""
    expired_token = create_access_token(
        subject="00000000-0000-0000-0000-000000000000",
        role="CITIZEN",
        expires_delta=timedelta(seconds=-1)
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "expired" in response.json()["error"]["message"].lower()


def test_database_migration_schema_and_extensions():
    """Verify PostGIS and pgvector column definitions exist in Report model."""
    assert hasattr(Report, "geometry")
    assert hasattr(Report, "embedding")
    assert hasattr(Report, "latitude")
    assert hasattr(Report, "longitude")
    assert hasattr(Report, "verification_status")
