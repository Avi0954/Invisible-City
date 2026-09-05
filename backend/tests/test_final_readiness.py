import uuid
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.user import User, UserRole
from app.models.report import (
    Report,
    ReportCategory,
    ReportSeverity,
    ReportStatus,
    VerificationStatus,
    ReportFlag
)
from app.models.audit import AuditLog
from app.models.hotspot import Hotspot
from app.intelligence.priority import calculate_report_priority
from app.intelligence.relationships.service import ReportRelationshipService
from app.intelligence.hotspots.service import HotspotDetectionService
from app.ai.service import ReportAnalysisService
from app.core.security import create_access_token, get_password_hash


@pytest.fixture
def citizen_user(db_session):
    user = User(
        email=f"citizen_e2e_{uuid.uuid4().hex[:6]}@example.com",
        name="E2E Citizen",
        role=UserRole.CITIZEN,
        password_hash=get_password_hash("Password123!")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session):
    user = User(
        email=f"admin_e2e_{uuid.uuid4().hex[:6]}@invisiblecity.civic",
        name="E2E Admin Officer",
        role=UserRole.ADMIN,
        password_hash=get_password_hash("Admin123!")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def citizen_token(citizen_user):
    return create_access_token(subject=str(citizen_user.id), role=citizen_user.role.value)


@pytest.fixture
def admin_token(admin_user):
    return create_access_token(subject=str(admin_user.id), role=admin_user.role.value)


# --- 1. PRIORITY ENGINE TESTS ---

def test_priority_calculation_bounds_and_determinism(db_session, citizen_user):
    report = Report(
        user_id=citizen_user.id,
        title="Critical Bridge Pothole",
        description="Deep dangerous hole on bridge main span",
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.CRITICAL,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.UNVERIFIED,
        latitude=12.9716,
        longitude=77.5946,
        created_at=datetime.utcnow()
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)

    score, level, reasons, breakdown = calculate_report_priority(db_session, report)

    assert 0 <= score <= 100
    assert level in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert len(reasons) > 0
    assert "severity_pts" in breakdown


# --- 2. ADMIN AUTHORIZATION TESTS ---

def test_admin_authorization_unauthenticated(client):
    res = client.get("/api/v1/admin/overview")
    assert res.status_code == 401


def test_admin_authorization_citizen(client, citizen_token):
    headers = {"Authorization": f"Bearer {citizen_token}"}
    res = client.get("/api/v1/admin/overview", headers=headers)
    assert res.status_code == 403


def test_admin_authorization_admin(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/v1/admin/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_reports" in data
    assert "open_reports" in data


# --- 3. VERIFICATION & STATUS TRANSITION TESTS ---

def test_verify_report_transition_and_audit_log(client, db_session, citizen_user, admin_token):
    report = Report(
        user_id=citizen_user.id,
        title="Pothole to Verify",
        description="Pothole issue needing verification",
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.HIGH,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.UNVERIFIED,
        latitude=12.9716,
        longitude=77.5946,
        created_at=datetime.utcnow()
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)

    headers = {"Authorization": f"Bearer {admin_token}"}

    # Verify report -> ADMIN_VERIFIED
    res = client.patch(
        f"/api/v1/admin/reports/{report.id}/verify",
        json={"verification_status": "ADMIN_VERIFIED"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["verification_status"] == "ADMIN_VERIFIED"

    # Check Audit Log created
    res_audit = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert res_audit.status_code == 200
    audit_data = res_audit.json()
    assert len(audit_data) >= 1
    assert audit_data[0]["action"] == "CHANGE_VERIFICATION"


def test_update_report_status_transition(client, db_session, citizen_user, admin_token):
    report = Report(
        user_id=citizen_user.id,
        title="Status Transition Report",
        description="Testing lifecycle status transition",
        category=ReportCategory.GARBAGE,
        severity=ReportSeverity.MEDIUM,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.ADMIN_VERIFIED,
        latitude=12.9716,
        longitude=77.5946,
        created_at=datetime.utcnow()
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)

    headers = {"Authorization": f"Bearer {admin_token}"}

    # Move status -> IN_PROGRESS
    res1 = client.patch(
        f"/api/v1/admin/reports/{report.id}/status",
        json={"status": "IN_PROGRESS"},
        headers=headers
    )
    assert res1.status_code == 200
    assert res1.json()["new_status"] == "IN_PROGRESS"

    # Move status -> RESOLVED
    res2 = client.patch(
        f"/api/v1/admin/reports/{report.id}/status",
        json={"status": "RESOLVED"},
        headers=headers
    )
    assert res2.status_code == 200
    assert res2.json()["new_status"] == "RESOLVED"


# --- 4. MODERATION FLAGS TEST ---

def test_flag_report_moderation(client, db_session, citizen_user, citizen_token, admin_token):
    report = Report(
        user_id=citizen_user.id,
        title="Report to Flag",
        description="Spam report to be flagged",
        category=ReportCategory.OTHER,
        severity=ReportSeverity.LOW,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.UNVERIFIED,
        latitude=12.9716,
        longitude=77.5946,
        created_at=datetime.utcnow()
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)

    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # Flag report
    res_flag = client.post(
        f"/api/v1/reports/{report.id}/flag",
        json={"reason": "FALSE_REPORT", "details": "This report is spam"},
        headers=citizen_headers
    )
    assert res_flag.status_code == 201
    flag_data = res_flag.json()
    assert flag_data["reason"] == "FALSE_REPORT"

    # Admin view flags
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    res_list = client.get("/api/v1/admin/flags", headers=admin_headers)
    assert res_list.status_code == 200
    flags_list = res_list.json()
    assert len(flags_list) >= 1


# --- 5. COMPLETE END-TO-END JOURNEY TEST ---

def test_full_end_to_end_journey(client, db_session, citizen_user, citizen_token, admin_token):
    """Executes full journey:

    Citizen report creation -> AI analysis -> PostGIS similarity -> Hotspots -> Priority -> Admin Triage -> Resolution.
    """
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create 3 Concentrated Reports
    r1 = Report(
        user_id=citizen_user.id,
        title="E2E Pothole 1 Main Gate",
        description="Deep dangerous pothole near gate 1 entrance",
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.HIGH,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.UNVERIFIED,
        latitude=12.9716,
        longitude=77.5946,
        created_at=datetime.utcnow()
    )
    r2 = Report(
        user_id=citizen_user.id,
        title="E2E Pothole 2 Main Gate",
        description="Deep dangerous crater near gate 1 entrance",
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.HIGH,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.UNVERIFIED,
        latitude=12.9717,
        longitude=77.5947,
        created_at=datetime.utcnow()
    )
    r3 = Report(
        user_id=citizen_user.id,
        title="E2E Road Damage 3 Main Gate",
        description="Cracked road surface near gate 1 entrance",
        category=ReportCategory.DAMAGED_INFRASTRUCTURE,
        severity=ReportSeverity.HIGH,
        status=ReportStatus.OPEN,
        verification_status=VerificationStatus.UNVERIFIED,
        latitude=12.9718,
        longitude=77.5948,
        created_at=datetime.utcnow()
    )
    db_session.add_all([r1, r2, r3])
    db_session.commit()
    db_session.refresh(r1)

    # 2. Run AI Analysis Service
    ai_service = ReportAnalysisService(db_session)
    import asyncio
    asyncio.run(ai_service.process_analysis(r1.id))
    asyncio.run(ai_service.process_analysis(r2.id))
    asyncio.run(ai_service.process_analysis(r3.id))

    # 3. Run Relationship Engine
    rel_service = ReportRelationshipService(db_session)
    rel_service.evaluate_report_relationships(r1.id)

    # 4. Run Hotspot Engine
    hotspot_service = HotspotDetectionService(db_session)
    hotspots = hotspot_service.detect_hotspots(min_reports=3)
    assert len(hotspots) >= 1

    # 5. Check Related Reports API
    res_rel = client.get(f"/api/v1/reports/{r1.id}/related", headers=citizen_headers)
    assert res_rel.status_code == 200

    # 6. Admin Triage Queue API
    res_admin = client.get("/api/v1/admin/reports", headers=admin_headers)
    assert res_admin.status_code == 200
    queue = res_admin.json()
    assert queue["total"] >= 3

    # 7. Admin Verify & Resolve
    client.patch(
        f"/api/v1/admin/reports/{r1.id}/verify",
        json={"verification_status": "ADMIN_VERIFIED"},
        headers=admin_headers
    )
    res_resolve = client.patch(
        f"/api/v1/admin/reports/{r1.id}/status",
        json={"status": "RESOLVED"},
        headers=admin_headers
    )
    assert res_resolve.status_code == 200
    assert res_resolve.json()["new_status"] == "RESOLVED"
