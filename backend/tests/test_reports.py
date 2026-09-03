import io
import pytest
from PIL import Image
from fastapi import status


def create_test_image_bytes(format="JPEG", size=(100, 100)):
    """Helper to generate valid image bytes in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color="red")
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()


@pytest.fixture
def auth_citizen_headers(client):
    """Fixture providing Auth headers for a registered Citizen."""
    payload = {
        "name": "Citizen One",
        "email": "citizen1@example.com",
        "password": "Password123!",
        "role": "CITIZEN"
    }
    res = client.post("/api/v1/auth/register", json=payload).json()
    return {"Authorization": f"Bearer {res['access_token']}"}


@pytest.fixture
def auth_citizen2_headers(client):
    """Fixture providing Auth headers for a second Citizen."""
    payload = {
        "name": "Citizen Two",
        "email": "citizen2@example.com",
        "password": "Password123!",
        "role": "CITIZEN"
    }
    res = client.post("/api/v1/auth/register", json=payload).json()
    return {"Authorization": f"Bearer {res['access_token']}"}


@pytest.fixture
def auth_admin_headers(client):
    """Fixture providing Auth headers for a registered Admin."""
    payload = {
        "name": "Admin One",
        "email": "admin1@example.com",
        "password": "Password123!",
        "role": "ADMIN"
    }
    res = client.post("/api/v1/auth/register", json=payload).json()
    return {"Authorization": f"Bearer {res['access_token']}"}


def test_create_report_success(client, auth_citizen_headers):
    """Test citizen can create a valid report."""
    payload = {
        "title": "Severe Pothole on Main St",
        "description": "Large pothole causing vehicle tire damage near intersection.",
        "category": "POTHOLE",
        "severity": "HIGH",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "address": "5th Main Rd, Bengaluru"
    }
    response = client.post("/api/v1/reports", json=payload, headers=auth_citizen_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["category"] == "POTHOLE"
    assert data["status"] == "OPEN"
    assert data["latitude"] == 12.9716


def test_create_report_invalid_validation(client, auth_citizen_headers):
    """Test creating a report with short title or invalid coordinates returns 422 Unprocessable Entity."""
    # Title too short (<5 chars)
    payload_short = {
        "title": "Bad",
        "description": "Valid description long enough.",
        "category": "POTHOLE",
        "severity": "MEDIUM",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    res1 = client.post("/api/v1/reports", json=payload_short, headers=auth_citizen_headers)
    assert res1.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Invalid latitude (>90)
    payload_coords = {
        "title": "Valid Report Title",
        "description": "Valid description long enough.",
        "category": "POTHOLE",
        "severity": "MEDIUM",
        "latitude": 120.0,
        "longitude": 77.5946
    }
    res2 = client.post("/api/v1/reports", json=payload_coords, headers=auth_citizen_headers)
    assert res2.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_unauthorized_report_creation(client):
    """Test unauthenticated report creation fails with HTTP 401."""
    payload = {
        "title": "Unauthorized Report Title",
        "description": "Valid description long enough.",
        "category": "GARBAGE",
        "severity": "LOW",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    response = client.post("/api/v1/reports", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_citizen_ownership_permissions(client, auth_citizen_headers, auth_citizen2_headers):
    """Test citizen cannot modify or delete another citizen's report."""
    payload = {
        "title": "Citizen 1 Pothole Report",
        "description": "Report description for testing ownership.",
        "category": "POTHOLE",
        "severity": "MEDIUM",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    rep_res = client.post("/api/v1/reports", json=payload, headers=auth_citizen_headers).json()
    report_id = rep_res["id"]

    # Citizen 2 attempts to patch Citizen 1's report
    update_res = client.patch(
        f"/api/v1/reports/{report_id}",
        json={"title": "Hacked Title"},
        headers=auth_citizen2_headers
    )
    assert update_res.status_code == status.HTTP_403_FORBIDDEN

    # Citizen 2 attempts to delete Citizen 1's report
    del_res = client.delete(f"/api/v1/reports/{report_id}", headers=auth_citizen2_headers)
    assert del_res.status_code == status.HTTP_403_FORBIDDEN


def test_image_upload_success(client, auth_citizen_headers):
    """Test uploading a valid JPEG image to a report."""
    rep_payload = {
        "title": "Garbage Dump Near School",
        "description": "Unattended garbage heap near primary school gate.",
        "category": "GARBAGE",
        "severity": "HIGH",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    report_id = client.post("/api/v1/reports", json=rep_payload, headers=auth_citizen_headers).json()["id"]

    img_bytes = create_test_image_bytes("JPEG")
    files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
    
    upload_res = client.post(f"/api/v1/reports/{report_id}/media", files=files, headers=auth_citizen_headers)
    assert upload_res.status_code == status.HTTP_201_CREATED
    data = upload_res.json()
    assert "media_url" in data
    assert data["report_id"] == report_id


def test_invalid_image_upload(client, auth_citizen_headers):
    """Test uploading a text file or executable as an image fails with HTTP 400."""
    rep_payload = {
        "title": "Broken Streetlight Issue",
        "description": "Streetlight unlit for past 3 weeks.",
        "category": "STREETLIGHT",
        "severity": "LOW",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    report_id = client.post("/api/v1/reports", json=rep_payload, headers=auth_citizen_headers).json()["id"]

    fake_file_bytes = b"echo 'malicious script'"
    files = {"file": ("script.sh", fake_file_bytes, "text/plain")}

    upload_res = client.post(f"/api/v1/reports/{report_id}/media", files=files, headers=auth_citizen_headers)
    assert upload_res.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid MIME type" in upload_res.json()["error"]["message"]


def test_oversized_image_upload(client, auth_citizen_headers):
    """Test uploading an image exceeding 10MB fails with HTTP 400."""
    rep_payload = {
        "title": "Water Pipe Leak Incident",
        "description": "Clean water wasting on main road.",
        "category": "WATER_LEAK",
        "severity": "MEDIUM",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    report_id = client.post("/api/v1/reports", json=rep_payload, headers=auth_citizen_headers).json()["id"]

    # 11MB dummy payload
    oversized_bytes = b"X" * (11 * 1024 * 1024)
    files = {"file": ("big.jpg", oversized_bytes, "image/jpeg")}

    upload_res = client.post(f"/api/v1/reports/{report_id}/media", files=files, headers=auth_citizen_headers)
    assert upload_res.status_code == status.HTTP_400_BAD_REQUEST
    assert "exceeds maximum allowed limit" in upload_res.json()["error"]["message"]


def test_delete_media_attachment(client, auth_citizen_headers):
    """Test deleting an attached image from a report."""
    rep_payload = {
        "title": "Infrastructure Damage Footpath",
        "description": "Slab broken on pedestrian footpath.",
        "category": "DAMAGED_INFRASTRUCTURE",
        "severity": "MEDIUM",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    report_id = client.post("/api/v1/reports", json=rep_payload, headers=auth_citizen_headers).json()["id"]

    img_bytes = create_test_image_bytes("PNG")
    files = {"file": ("footpath.png", img_bytes, "image/png")}
    media_res = client.post(f"/api/v1/reports/{report_id}/media", files=files, headers=auth_citizen_headers).json()
    media_id = media_res["id"]

    # Delete media
    del_res = client.delete(f"/api/v1/media/{media_id}", headers=auth_citizen_headers)
    assert del_res.status_code == status.HTTP_200_OK

    # Fetch report to verify media list is empty
    rep_detail = client.get(f"/api/v1/reports/{report_id}").json()
    assert len(rep_detail["media"]) == 0


def test_report_pagination_and_filtering(client, auth_citizen_headers):
    """Test pagination limits and category/severity filtering."""
    # Create 3 reports with different categories
    cats = ["POTHOLE", "GARBAGE", "POTHOLE"]
    for i, cat in enumerate(cats):
        client.post(
            "/api/v1/reports",
            json={
                "title": f"Report Item Number {i+1}",
                "description": "Test description for list filtering.",
                "category": cat,
                "severity": "HIGH" if i == 0 else "LOW",
                "latitude": 12.9716,
                "longitude": 77.5946
            },
            headers=auth_citizen_headers
        )

    # Filter by category POTHOLE
    res_cat = client.get("/api/v1/reports?category=POTHOLE")
    assert res_cat.status_code == status.HTTP_200_OK
    assert res_cat.json()["total"] == 2

    # Filter with pagination (limit=1)
    res_page = client.get("/api/v1/reports?limit=1&page=1")
    assert res_page.status_code == status.HTTP_200_OK
    assert len(res_page.json()["items"]) == 1
    assert res_page.json()["pages"] == 3
