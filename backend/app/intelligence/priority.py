import math
from datetime import datetime
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.report import Report, ReportSeverity, VerificationStatus, ReportRelationship
from app.intelligence.relationships.candidate_search import find_spatial_candidates
from app.core.config import settings

SEVERITY_POINTS = {
    ReportSeverity.CRITICAL: 35.0,
    ReportSeverity.HIGH: 25.0,
    ReportSeverity.MEDIUM: 15.0,
    ReportSeverity.LOW: 5.0,
}


def calculate_report_priority(
    db: Session,
    report: Report,
    radius_meters: float = settings.INTELLIGENCE_CANDIDATE_RADIUS_METERS
) -> Tuple[int, str, List[str], Dict[str, Any]]:
    """Calculates deterministic Priority Score (0-100), Priority Level (LOW, MEDIUM, HIGH, CRITICAL),

    and evidence-based human readable reasons list.
    """
    if report.verification_status == VerificationStatus.REJECTED or report.status == "REJECTED":
        return 0, "LOW", ["Report rejected during verification"], {"final_score": 0}

    reasons: List[str] = []

    # 1. Severity points (up to 35 pts)
    sev_enum = report.severity
    sev_str = sev_enum.value if hasattr(sev_enum, "value") else str(sev_enum)
    sev_pts = SEVERITY_POINTS.get(sev_enum, 15.0)
    reasons.append(f"{sev_str.title()} severity civic issue")

    # 2. Spatial density / nearby reports count (up to 20 pts)
    candidates = find_spatial_candidates(db, report, radius_meters=radius_meters, limit=50)
    nearby_count = len(candidates)
    nearby_pts = min(20.0, nearby_count * 2.5)
    if nearby_count > 0:
        reasons.append(f"{nearby_count} nearby civic complaints in local area")

    # 3. Independent reporters count (up to 15 pts)
    all_users = set([str(report.user_id)])
    for c in candidates:
        if c.user_id:
            all_users.add(str(c.user_id))

    unique_reporters = len(all_users)
    reporters_pts = min(15.0, unique_reporters * 3.0)
    if unique_reporters > 1:
        reasons.append(f"Reported by {unique_reporters} independent citizens")

    # 4. Recency points (up to 10 pts)
    now = datetime.utcnow()
    age_days = abs((now - report.created_at).total_seconds()) / 86400.0
    recency_pts = max(0.0, 10.0 - (age_days * 0.5))
    if age_days <= 1.0:
        reasons.append("Recent report submitted within 24 hours")
    elif age_days <= 7.0:
        reasons.append("Active issue reported within last 7 days")

    # 5. Relationship strength points (up to 10 pts)
    rels_count = (
        db.query(ReportRelationship)
        .filter(
            or_(
                ReportRelationship.report_id == report.id,
                ReportRelationship.related_report_id == report.id
            )
        )
        .count()
    )
    rel_pts = min(10.0, rels_count * 2.5)
    if rels_count > 0:
        reasons.append(f"{rels_count} cross-report relationships detected")

    # 6. Verification bonus (up to 10 pts)
    ver_status = report.verification_status
    if ver_status == VerificationStatus.ADMIN_VERIFIED:
        ver_pts = 10.0
        reasons.append("Verified by municipal authority")
    elif ver_status == VerificationStatus.UNDER_REVIEW:
        ver_pts = 5.0
        reasons.append("Under official municipal review")
    else:
        ver_pts = 0.0

    # Calculate total and clamp [0, 100]
    total_raw = sev_pts + nearby_pts + reporters_pts + recency_pts + rel_pts + ver_pts
    final_score = int(round(max(0.0, min(100.0, total_raw))))

    # Priority Level Mapping
    if final_score >= 75:
        level = "CRITICAL"
    elif final_score >= 50:
        level = "HIGH"
    elif final_score >= 25:
        level = "MEDIUM"
    else:
        level = "LOW"

    breakdown = {
        "final_score": final_score,
        "level": level,
        "severity_pts": sev_pts,
        "nearby_pts": nearby_pts,
        "reporters_pts": reporters_pts,
        "recency_pts": recency_pts,
        "rel_pts": rel_pts,
        "ver_pts": ver_pts,
        "nearby_count": nearby_count,
        "unique_reporters": unique_reporters,
    }

    return final_score, level, reasons, breakdown
