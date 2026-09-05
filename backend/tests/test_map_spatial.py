import pytest
import uuid
from datetime import datetime, timedelta
from fastapi import status
from app.models.user import User, UserRole
from app.models.report import Report, ReportCategory, ReportSeverity, ReportStatus
from app.repositories.report_repository import ReportRepository
from app.core.config import settings


@pytest.fixture
def map_user(db_session):
    """Fixture providing a saved User instance in database."""
    user = User(
        id=uuid.uuid4(),
        name="Map Citizen",
        email="mapuser@example.com",
        password_hash="hashed_pw_map",
        role=UserRole.CITIZEN
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def seeded_spatial_reports(db_session, map_user):
    """Fixture seeding spatial reports at known Bengaluru coordinates."""
    # Center Point: 12.9716, 77.5946 (Indiranagar / MG Road center)
    r1 = Report(
        id=uuid.uuid4(),
        user_id=map_user.id,
        title="Center Pothole",
        description="Pothole right at center coordinates.",
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.HIGH,
        status=ReportStatus.OPEN,
        latitude=12.9716,
        longitude=77.5946,
        address="MG Road Center",
        geometry="SRID=4326;POINT(77.5946 12.9716)",
        created_at=datetime.utcnow() - timedelta(days=2)
    )

    # 300 meters away: 12.9730, 77.5960
    r2 = Report(
        id=uuid.uuid4(),
        user_id=map_user.id,
        title="Nearby Garbage Dump",
        description="Garbage waste 300 meters away.",
        category=ReportCategory.GARBAGE,
        severity=ReportSeverity.MEDIUM,
        status=ReportStatus.OPEN,
        latitude=12.9730,
        longitude=77.5960,
        address="Near MG Road",
        geometry="SRID=4326;POINT(77.5960 12.9730)",
        created_at=datetime.utcnow() - timedelta(days=5)
    )

    # 10 km far away: 13.0500, 77.6500 (Yelahanka area)
    r3 = Report(
        id=uuid.uuid4(),
        user_id=map_user.id,
        title="Distant Water Leak",
        description="Water main leak 10km north.",
        category=ReportCategory.WATER_LEAK,
        severity=ReportSeverity.CRITICAL,
        status=ReportStatus.RESOLVED,
        latitude=13.0500,
        longitude=77.6500,
        address="Yelahanka North",
        geometry="SRID=4326;POINT(77.6500 13.0500)",
        created_at=datetime.utcnow() - timedelta(days=20)
    )

    db_session.add_all([r1, r2, r3])
    db_session.commit()
    return [r1, r2, r3]


def test_1_nearby_radius_query(db_session, seeded_spatial_reports):
    """Test 1: Nearby spatial radius query returns reports within specified radius."""
    repo = ReportRepository(db_session)
    items, count, limit, truncated = repo.list_nearby_reports(
        lat=12.9716,
        lng=77.5946,
        radius=500.0  # 500 meters
    )

    titles = [r.title for r in items]
    assert "Center Pothole" in titles
    assert "Nearby Garbage Dump" in titles
    assert "Distant Water Leak" not in titles


def test_2_radius_filtering_variations(db_session, seeded_spatial_reports):
    """Test 2: Radius filtering at different distances (100m, 500m, 15000m)."""
    repo = ReportRepository(db_session)

    # 100m radius -> only center pothole
    items100, _, _, _ = repo.list_nearby_reports(lat=12.9716, lng=77.5946, radius=100.0)
    assert len(items100) == 1
    assert items100[0].title == "Center Pothole"

    # 15km radius -> all 3 reports
    items15k, _, _, _ = repo.list_nearby_reports(lat=12.9716, lng=77.5946, radius=15000.0)
    assert len(items15k) == 3


def test_3_category_filter(db_session, seeded_spatial_reports):
    """Test 3: Spatial query with category filter excludes unrelated categories."""
    repo = ReportRepository(db_session)
    items, _, _, _ = repo.list_nearby_reports(
        lat=12.9716,
        lng=77.5946,
        radius=15000.0,
        category=ReportCategory.GARBAGE
    )
    assert len(items) == 1
    assert items[0].title == "Nearby Garbage Dump"


def test_4_severity_filter(db_session, seeded_spatial_reports):
    """Test 4: Spatial query with severity filter returns only matching severity."""
    repo = ReportRepository(db_session)
    items, _, _, _ = repo.list_nearby_reports(
        lat=12.9716,
        lng=77.5946,
        radius=15000.0,
        severity=ReportSeverity.CRITICAL
    )
    assert len(items) == 1
    assert items[0].title == "Distant Water Leak"


def test_5_status_filter(db_session, seeded_spatial_reports):
    """Test 5: Spatial query with status filter returns only matching status."""
    repo = ReportRepository(db_session)
    items, _, _, _ = repo.list_nearby_reports(
        lat=12.9716,
        lng=77.5946,
        radius=15000.0,
        status=ReportStatus.RESOLVED
    )
    assert len(items) == 1
    assert items[0].title == "Distant Water Leak"


def test_6_bounding_box_query(db_session, seeded_spatial_reports):
    """Test 6: Viewport Bounding box spatial query filters by min/max lat and lng."""
    repo = ReportRepository(db_session)
    items, _, _, _ = repo.list_nearby_reports(
        min_lat=12.9600,
        max_lat=12.9800,
        min_lng=77.5800,
        max_lng=77.6100
    )
    titles = [r.title for r in items]
    assert "Center Pothole" in titles
    assert "Nearby Garbage Dump" in titles
    assert "Distant Water Leak" not in titles


def test_7_invalid_coordinates_validation(client):
    """Test 7: Latitude out of range returns HTTP 400 Bad Request."""
    res = client.get("/api/v1/reports/nearby?latitude=100.0&longitude=77.5946&radius=500")
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "Latitude 100.0 is out of valid range" in res.json()["error"]["message"]


def test_8_invalid_radius_validation(client):
    """Test 8: Negative or zero radius returns HTTP 400 Bad Request."""
    res = client.get("/api/v1/reports/nearby?latitude=12.9716&longitude=77.5946&radius=-10")
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "Radius must be > 0" in res.json()["error"]["message"]


def test_9_empty_area_response(client, seeded_spatial_reports):
    """Test 9: Querying an empty area returns HTTP 200 with empty reports list."""
    # Query ocean coordinates
    res = client.get("/api/v1/reports/nearby?latitude=0.0&longitude=0.0&radius=500")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["reports"] == []
    assert data["count"] == 0
    assert data["truncated"] is False


def test_10_large_dataset_truncation(db_session, map_user):
    """Test 10: Seeding many reports respects limit parameter and sets truncated=True."""
    reports = []
    for i in range(15):
        reports.append(
            Report(
                id=uuid.uuid4(),
                user_id=map_user.id,
                title=f"Cluster Pothole {i}",
                description="Seeded pothole",
                category=ReportCategory.POTHOLE,
                severity=ReportSeverity.MEDIUM,
                status=ReportStatus.OPEN,
                latitude=12.9716 + (i * 0.0001),
                longitude=77.5946 + (i * 0.0001),
                geometry=f"SRID=4326;POINT({77.5946 + i * 0.0001} {12.9716 + i * 0.0001})"
            )
        )
    db_session.add_all(reports)
    db_session.commit()

    repo = ReportRepository(db_session)
    items, count, limit, truncated = repo.list_nearby_reports(
        min_lat=12.9000,
        max_lat=13.1000,
        min_lng=77.5000,
        max_lng=77.7000,
        limit=10
    )

    assert count == 10
    assert truncated is True


def test_11_spatial_query_compatibility(db_session, seeded_spatial_reports):
    """Test 11: Verify spatial repository query compiles and executes cleanly."""
    repo = ReportRepository(db_session)
    items, count, limit, truncated = repo.list_nearby_reports(
        min_lat=12.0, max_lat=14.0, min_lng=76.0, max_lng=78.0
    )
    assert count == 3
    assert truncated is False


def test_12_combined_filters(client, seeded_spatial_reports):
    """Test 12: Viewport + Category + Severity + Status combined spatial filters."""
    url = (
        "/api/v1/reports/nearby"
        "?min_latitude=12.9000&max_latitude=13.1000"
        "&min_longitude=77.5000&max_longitude=77.7000"
        "&category=POTHOLE&severity=HIGH&status=OPEN"
    )
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["count"] == 1
    assert data["reports"][0]["title"] == "Center Pothole"


def test_13_date_filtering(client, seeded_spatial_reports):
    """Test 13: Date range filtering (date_from, date_to)."""
    date_from = (datetime.utcnow() - timedelta(days=3)).isoformat()
    url = f"/api/v1/reports/nearby?min_latitude=12.0&max_latitude=14.0&min_longitude=76.0&max_longitude=78.0&date_from={date_from}"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["count"] == 1
    assert data["reports"][0]["title"] == "Center Pothole"


def test_14_privacy_enforcement(client, seeded_spatial_reports):
    """Test 14: Public map response exposes issue details but strictly omits citizen private data."""
    res = client.get("/api/v1/reports/nearby?min_latitude=12.0&max_latitude=14.0&min_longitude=76.0&max_longitude=78.0")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["count"] > 0

    first_item = data["reports"][0]
    # Verify required map fields present
    assert "id" in first_item
    assert "title" in first_item
    assert "category" in first_item
    assert "severity" in first_item
    assert "latitude" in first_item
    assert "longitude" in first_item

    # Verify sensitive user credentials omitted
    assert "user" not in first_item
    assert "user_id" not in first_item
    assert "email" not in first_item
    assert "password_hash" not in first_item
