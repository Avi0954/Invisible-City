import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.intelligence.relationships.service import ReportRelationshipService
from app.intelligence.hotspots.service import HotspotDetectionService
from app.intelligence.schemas import (
    RelatedReportResponse,
    DuplicateReportResponse,
    RelationshipItem,
    HotspotListResponse,
    HotspotItem,
    HotspotSupportingReport
)
from app.models.report import Report
from app.core.config import settings

router = APIRouter()


@router.get("/reports/{id}/related", response_model=RelatedReportResponse, tags=["Intelligence"])
def get_related_reports(
    id: uuid.UUID,
    limit: int = Query(settings.MAX_RELATED_REPORTS, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Returns meaningful related reports for the target report."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    service = ReportRelationshipService(db)
    # Check if relationships evaluated, if not run quick evaluation
    relationships = service.get_related_reports(id, limit=limit)
    if not relationships:
        service.evaluate_report_relationships(id, limit=limit)
        relationships = service.get_related_reports(id, limit=limit)

    items = []
    for rel in relationships:
        # Determine the other report ID
        other_id = rel.related_report_id if rel.report_id == id else rel.report_id
        items.append(
            RelationshipItem(
                id=rel.id,
                report_id=id,
                related_report_id=other_id,
                relation_type=rel.relation_type,
                score=rel.score,
                confidence=rel.confidence,
                explanation=rel.explanation or "",
                created_at=rel.created_at
            )
        )

    return RelatedReportResponse(
        report_id=id,
        related_reports=items,
        count=len(items)
    )


@router.get("/reports/{id}/duplicates", response_model=DuplicateReportResponse, tags=["Intelligence"])
def get_duplicate_reports(
    id: uuid.UUID,
    limit: int = Query(settings.MAX_RELATED_REPORTS, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Returns potential duplicate reports for the target report."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    service = ReportRelationshipService(db)
    duplicates = service.get_duplicate_reports(id, limit=limit)
    if not duplicates:
        service.evaluate_report_relationships(id, limit=limit)
        duplicates = service.get_duplicate_reports(id, limit=limit)

    items = []
    for rel in duplicates:
        other_id = rel.related_report_id if rel.report_id == id else rel.report_id
        items.append(
            RelationshipItem(
                id=rel.id,
                report_id=id,
                related_report_id=other_id,
                relation_type=rel.relation_type,
                score=rel.score,
                confidence=rel.confidence,
                explanation=rel.explanation or "",
                created_at=rel.created_at
            )
        )

    return DuplicateReportResponse(
        report_id=id,
        duplicates=items,
        count=len(items)
    )


@router.get("/hotspots", response_model=HotspotListResponse, tags=["Intelligence"])
def list_hotspots(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query("ACTIVE"),
    min_score: Optional[float] = Query(None, ge=0.0, le=1.0),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Lists detected spatial problem hotspots with server-side filters."""
    service = HotspotDetectionService(db)

    # Trigger fresh detection if active list empty
    hotspots = service.list_hotspots(
        category=category,
        severity=severity,
        status=status,
        min_score=min_score,
        date_from=date_from,
        date_to=date_to,
        limit=limit
    )

    if not hotspots and status == "ACTIVE":
        service.detect_hotspots()
        hotspots = service.list_hotspots(
            category=category,
            severity=severity,
            status=status,
            min_score=min_score,
            date_from=date_from,
            date_to=date_to,
            limit=limit
        )

    items = []
    for h in hotspots:
        items.append(
            HotspotItem(
                id=h.id,
                title=h.title,
                description=h.description,
                category=h.category,
                categories=h.categories or ([h.category] if h.category else []),
                severity=h.severity,
                status=h.status,
                center_latitude=h.center_latitude,
                center_longitude=h.center_longitude,
                radius=h.radius,
                report_count=h.report_count,
                score=h.score,
                confidence=h.confidence,
                explanation=h.explanation,
                algorithm_version=h.algorithm_version,
                first_detected=h.first_detected,
                last_updated=h.last_updated
            )
        )

    return HotspotListResponse(hotspots=items, count=len(items))


@router.get("/hotspots/{id}", response_model=HotspotItem, tags=["Intelligence"])
def get_hotspot_detail(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Gets detailed information for a hotspot including privacy-sanitized supporting reports."""
    service = HotspotDetectionService(db)
    result = service.get_hotspot_detail(id)

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotspot not found")

    hotspot, supporting_reports = result

    sanitized_reports = [
        HotspotSupportingReport(
            id=r.id,
            title=r.title,
            category=r.category.value if hasattr(r.category, "value") else str(r.category),
            severity=r.severity.value if hasattr(r.severity, "value") else str(r.severity),
            status=r.status.value if hasattr(r.status, "value") else str(r.status),
            latitude=r.latitude,
            longitude=r.longitude,
            created_at=r.created_at
        )
        for r in supporting_reports
    ]

    return HotspotItem(
        id=hotspot.id,
        title=hotspot.title,
        description=hotspot.description,
        category=hotspot.category,
        categories=hotspot.categories or ([hotspot.category] if hotspot.category else []),
        severity=hotspot.severity,
        status=hotspot.status,
        center_latitude=hotspot.center_latitude,
        center_longitude=hotspot.center_longitude,
        radius=hotspot.radius,
        report_count=hotspot.report_count,
        score=hotspot.score,
        confidence=hotspot.confidence,
        explanation=hotspot.explanation,
        algorithm_version=hotspot.algorithm_version,
        first_detected=hotspot.first_detected,
        last_updated=hotspot.last_updated,
        supporting_reports=sanitized_reports
    )


@router.post("/intelligence/analyze/{report_id}", tags=["Intelligence"])
def trigger_report_analysis(
    report_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Triggers relationship evaluation and hotspot detection for a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    rel_service = ReportRelationshipService(db)
    relationships = rel_service.evaluate_report_relationships(report_id)

    hotspot_service = HotspotDetectionService(db)
    hotspots = hotspot_service.detect_hotspots()

    return {
        "status": "success",
        "report_id": str(report_id),
        "relationships_detected": len(relationships),
        "hotspots_detected": len(hotspots)
    }
