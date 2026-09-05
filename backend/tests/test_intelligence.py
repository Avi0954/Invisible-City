import uuid
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db
from app.models.report import Report, ReportCategory, ReportSeverity, ReportStatus, ReportRelationship
from app.models.user import User, UserRole
from app.models.hotspot import Hotspot, HotspotReport
from app.intelligence.relationships.service import ReportRelationshipService
from app.intelligence.hotspots.service import HotspotDetectionService
from app.intelligence.relationships.candidate_search import find_spatial_candidates
from app.intelligence.relationships.scoring import (
    calculate_combined_relationship_score,
    calculate_haversine_distance
)


@pytest.fixture
def test_user(db_session):
    user = User(
        email=f"citizen_{uuid.uuid4().hex[:6]}@example.com",
        name="Test Citizen",
        role=UserRole.CITIZEN,
        password_hash="hashed_password_123"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def second_user(db_session):
    user = User(
        email=f"citizen2_{uuid.uuid4().hex[:6]}@example.com",
        name="Second Citizen",
        role=UserRole.CITIZEN,
        password_hash="hashed_password_123"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def create_sample_report(
    db, user_id, title, description, category, latitude, longitude,
    severity=ReportSeverity.HIGH, created_at=None
):
    report = Report(
        user_id=user_id,
        title=title,
        description=description,
        category=category,
        severity=severity,
        status=ReportStatus.OPEN,
        latitude=latitude,
        longitude=longitude,
        geometry=f"SRID=4326;POINT({longitude} {latitude})",
        address="123 Main Street",
        created_at=created_at or datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# --- SIMILARITY TESTS ---

def test_exact_duplicate(db_session, test_user):
    # 1. Exact Duplicate
    r1 = create_sample_report(
        db_session, test_user.id,
        "Large pothole outside Gate 1",
        "There is a deep dangerous pothole near the main entrance Gate 1",
        ReportCategory.POTHOLE, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Big pothole near Gate 1",
        "Large dangerous pothole outside Gate 1 near the main entrance",
        ReportCategory.POTHOLE, 12.9717, 77.5947
    )

    service = ReportRelationshipService(db_session)
    rels = service.evaluate_report_relationships(r1.id)

    assert len(rels) == 1
    assert rels[0].relation_type == "DUPLICATE"
    assert rels[0].score >= 0.80
    assert "DUPLICATE" in rels[0].explanation or "same problem" in rels[0].explanation


def test_same_location(db_session, test_user):
    # 2. Same Location
    r1 = create_sample_report(
        db_session, test_user.id,
        "Water leak near Gate 1", "Water leaking on road",
        ReportCategory.WATER_LEAK, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Pipe burst at Gate 1", "Major water overflow on road",
        ReportCategory.WATER_LEAK, 12.9716, 77.5946
    )

    score, dist, comp = calculate_combined_relationship_score(r1, r2)
    assert dist < 1.0  # essentially 0 meters
    assert comp["geographic_score"] == 1.0


def test_same_category(db_session, test_user):
    # 3. Same Category
    r1 = create_sample_report(
        db_session, test_user.id,
        "Streetlight broken", "Lamp not working at night",
        ReportCategory.STREETLIGHT, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Dark street near park", "Streetlight is out",
        ReportCategory.STREETLIGHT, 12.9720, 77.5950
    )

    score, dist, comp = calculate_combined_relationship_score(r1, r2)
    assert comp["category_score"] == 1.0


def test_different_category(db_session, test_user):
    # 4. Different Category
    r1 = create_sample_report(
        db_session, test_user.id,
        "Broken streetlight", "Lamp post unlit",
        ReportCategory.STREETLIGHT, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Garbage pile", "Trash dumping near gate",
        ReportCategory.GARBAGE, 12.9716, 77.5946
    )

    score, dist, comp = calculate_combined_relationship_score(r1, r2)
    assert comp["category_score"] == 0.10


def test_nearby_unrelated(db_session, test_user):
    # 5. Nearby Unrelated
    r1 = create_sample_report(
        db_session, test_user.id,
        "Broken streetlight near Gate 1", "Lighting issue",
        ReportCategory.STREETLIGHT, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Garbage pile near Gate 1", "Overflowing waste bin",
        ReportCategory.GARBAGE, 12.9716, 77.5946
    )

    service = ReportRelationshipService(db_session)
    rels = service.evaluate_report_relationships(r1.id)

    # Low score should result in UNRELATED (which is not saved as DUPLICATE/RELATED)
    duplicates = service.get_duplicate_reports(r1.id)
    assert len(duplicates) == 0


def test_far_away(db_session, test_user):
    # 6. Far Away (Outside Candidate Radius 1000m)
    r1 = create_sample_report(
        db_session, test_user.id,
        "Pothole outside Gate 1", "Big hole in road",
        ReportCategory.POTHOLE, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Pothole outside Gate 1", "Big hole in road",
        ReportCategory.POTHOLE, 13.0500, 77.7000  # ~14km away
    )

    candidates = find_spatial_candidates(db_session, r1, radius_meters=1000.0)
    candidate_ids = [c.id for c in candidates]
    assert r2.id not in candidate_ids


def test_old_report_temporal_decay(db_session, test_user):
    # 7. Old Report Temporal Decay vs 8. Recent Report
    r_old = create_sample_report(
        db_session, test_user.id,
        "Pothole issue", "Deep crater",
        ReportCategory.POTHOLE, 12.9716, 77.5946,
        created_at=datetime.utcnow() - timedelta(days=120)
    )
    r_recent = create_sample_report(
        db_session, test_user.id,
        "Pothole issue", "Deep crater",
        ReportCategory.POTHOLE, 12.9717, 77.5947,
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    r_now = create_sample_report(
        db_session, test_user.id,
        "Pothole issue", "Deep crater",
        ReportCategory.POTHOLE, 12.9716, 77.5946,
        created_at=datetime.utcnow()
    )

    score_old, _, comp_old = calculate_combined_relationship_score(r_now, r_old)
    score_rec, _, comp_rec = calculate_combined_relationship_score(r_now, r_recent)

    assert comp_rec["temporal_score"] > comp_old["temporal_score"]


def test_no_candidates(db_session, test_user):
    # 9. No Candidates
    r1 = create_sample_report(
        db_session, test_user.id,
        "Isolated issue", "Nobody around",
        ReportCategory.OTHER, 12.0000, 77.0000
    )
    service = ReportRelationshipService(db_session)
    rels = service.evaluate_report_relationships(r1.id)
    assert rels == []


def test_missing_embedding_handling(db_session, test_user):
    # 10. Missing Embedding Handling
    r1 = create_sample_report(
        db_session, test_user.id, "Missing embedding 1", "Description one",
        ReportCategory.POTHOLE, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id, "Missing embedding 2", "Description two",
        ReportCategory.POTHOLE, 12.9717, 77.5947
    )
    r1.embedding = None
    r2.embedding = None
    db_session.commit()

    score, dist, comp = calculate_combined_relationship_score(r1, r2)
    assert "semantic_score" in comp
    assert 0.0 <= score <= 1.0


def test_relationship_idempotency_and_canonical_pair(db_session, test_user):
    # 11. Idempotency, 12. Reverse Relationship, 13. Self Relationship
    r1 = create_sample_report(
        db_session, test_user.id, "Pothole A", "Dangerous pothole",
        ReportCategory.POTHOLE, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id, "Pothole B", "Dangerous pothole",
        ReportCategory.POTHOLE, 12.9717, 77.5947
    )

    service = ReportRelationshipService(db_session)

    # First evaluation (A -> B)
    rels1 = service.evaluate_report_relationships(r1.id)
    count1 = db_session.query(ReportRelationship).count()

    # Second evaluation (B -> A)
    rels2 = service.evaluate_report_relationships(r2.id)
    count2 = db_session.query(ReportRelationship).count()

    # Canonical pair constraint ensures no duplicate rows
    assert count1 == 1
    assert count2 == 1

    # Check Self-Relationship prevention
    rels_self = service.evaluate_report_relationships(r1.id)
    self_rels = db_session.query(ReportRelationship).filter(
        ReportRelationship.report_id == r1.id,
        ReportRelationship.related_report_id == r1.id
    ).all()
    assert len(self_rels) == 0


# --- HOTSPOT TESTS ---

def test_hotspot_no_reports(db_session):
    # 14. No Reports -> No Hotspots
    service = HotspotDetectionService(db_session)
    hotspots = service.detect_hotspots()
    assert hotspots == []


def test_hotspot_single_report(db_session, test_user):
    # 15. Single Report -> No Hotspot
    create_sample_report(
        db_session, test_user.id, "Single pothole", "One pothole report",
        ReportCategory.POTHOLE, 12.9716, 77.5946
    )
    service = HotspotDetectionService(db_session)
    hotspots = service.detect_hotspots(min_reports=3)
    assert len(hotspots) == 0


def test_hotspot_unrelated_reports(db_session, test_user):
    # 16. Unrelated Reports -> No strong hotspot
    # 2 reports in an area where min_reports is 3
    create_sample_report(db_session, test_user.id, "Issue 1", "Desc", ReportCategory.POTHOLE, 12.9716, 77.5946)
    create_sample_report(db_session, test_user.id, "Issue 2", "Desc", ReportCategory.GARBAGE, 12.9716, 77.5946)

    service = HotspotDetectionService(db_session)
    hotspots = service.detect_hotspots(min_reports=3)
    assert len(hotspots) == 0


def test_hotspot_dense_related_reports(db_session, test_user, second_user):
    # 17. Dense Related Reports -> Possible Hotspot
    for i in range(5):
        usr = test_user if i % 2 == 0 else second_user
        create_sample_report(
            db_session, usr.id,
            f"Road damage part {i}", f"Cracked road and pothole {i}",
            ReportCategory.POTHOLE, 12.9716 + (i * 0.0001), 77.5946 + (i * 0.0001)
        )

    service = HotspotDetectionService(db_session)
    hotspots = service.detect_hotspots(min_reports=3)

    assert len(hotspots) == 1
    h = hotspots[0]
    assert h.status == "ACTIVE"
    assert h.report_count == 5
    assert "Pattern detected" in h.explanation
    assert h.score > 0.30


def test_hotspot_multiple_categories_and_reporters(db_session, test_user, second_user):
    # 18. Multiple categories & 19. Independent reporters
    r1 = create_sample_report(db_session, test_user.id, "Pothole A", "Desc", ReportCategory.POTHOLE, 12.9716, 77.5946)
    r2 = create_sample_report(db_session, second_user.id, "Water Leak B", "Desc", ReportCategory.WATER_LEAK, 12.9717, 77.5947)
    r3 = create_sample_report(db_session, test_user.id, "Infrastructure C", "Desc", ReportCategory.DAMAGED_INFRASTRUCTURE, 12.9718, 77.5948)

    service = HotspotDetectionService(db_session)
    hotspots = service.detect_hotspots(min_reports=3)

    assert len(hotspots) == 1
    assert hotspots[0].confidence > 0.0


def test_hotspot_idempotency_and_supporting_reports(db_session, test_user):
    # 20. Repeated Hotspot Detection & 22. Hotspot Supporting Reports
    for i in range(4):
        create_sample_report(
            db_session, test_user.id, f"Garbage {i}", "Trash issue",
            ReportCategory.GARBAGE, 12.9716 + (i * 0.0001), 77.5946 + (i * 0.0001)
        )

    service = HotspotDetectionService(db_session)
    h_run1 = service.detect_hotspots(min_reports=3)
    count1 = db_session.query(Hotspot).count()

    h_run2 = service.detect_hotspots(min_reports=3)
    count2 = db_session.query(Hotspot).count()

    assert count1 == count2 == 1  # Updated existing hotspot, didn't duplicate

    detail = service.get_hotspot_detail(h_run1[0].id)
    assert detail is not None
    hotspot_obj, supporting = detail
    assert len(supporting) == 4


# --- API ENDPOINT TESTS ---

def test_api_related_and_duplicate_endpoints(client, db_session, test_user):
    r1 = create_sample_report(
        db_session, test_user.id,
        "Large pothole outside Gate 1",
        "Deep dangerous pothole near the main entrance Gate 1",
        ReportCategory.POTHOLE, 12.9716, 77.5946
    )
    r2 = create_sample_report(
        db_session, test_user.id,
        "Big pothole near Gate 1",
        "Large dangerous pothole outside Gate 1 near the main entrance",
        ReportCategory.POTHOLE, 12.9717, 77.5947
    )

    # Evaluate
    service = ReportRelationshipService(db_session)
    service.evaluate_report_relationships(r1.id)

    res_dups = client.get(f"/api/v1/reports/{r1.id}/duplicates")
    assert res_dups.status_code == 200
    data_dups = res_dups.json()
    assert data_dups["count"] >= 1

    res_rel = client.get(f"/api/v1/reports/{r1.id}/related")
    assert res_rel.status_code == 200


def test_api_hotspot_list_and_detail(client, db_session, test_user):
    for i in range(4):
        create_sample_report(
            db_session, test_user.id, f"Streetlight {i}", "Dark alley",
            ReportCategory.STREETLIGHT, 12.9716 + (i * 0.0001), 77.5946 + (i * 0.0001)
        )

    h_service = HotspotDetectionService(db_session)
    h_service.detect_hotspots(min_reports=3)

    res = client.get("/api/v1/hotspots")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 1

    hid = data["hotspots"][0]["id"]
    res_detail = client.get(f"/api/v1/hotspots/{hid}")
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert "supporting_reports" in detail_data
    assert len(detail_data["supporting_reports"]) >= 3
