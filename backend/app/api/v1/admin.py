import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.db.session import get_db
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.models.report import (
    Report,
    ReportCategory,
    ReportSeverity,
    ReportStatus,
    VerificationStatus,
    ReportFlag
)
from app.models.hotspot import Hotspot
from app.models.audit import AuditLog
from app.intelligence.priority import calculate_report_priority
from app.services.audit_service import log_admin_action

router = APIRouter(prefix="/admin", tags=["Admin"])


class AdminOverviewResponse(BaseModel):
    total_reports: int
    open_reports: int
    verified_reports: int
    resolved_reports: int
    hotspot_count: int
    high_priority_count: int


class AdminReportItem(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: str
    severity: str
    status: str
    verification_status: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    priority_score: int
    priority_level: str
    priority_reasons: List[str]
    created_at: datetime
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdminReportListResponse(BaseModel):
    items: List[AdminReportItem]
    total: int
    page: int
    limit: int


class VerifyReportRequest(BaseModel):
    verification_status: VerificationStatus


class UpdateStatusRequest(BaseModel):
    status: ReportStatus


class AuditLogItem(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlagItem(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    reporter_id: uuid.UUID
    reason: str
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/overview", response_model=AdminOverviewResponse)
def get_admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Returns real-time database statistics for the Municipal Admin overview dashboard."""
    total_reports = db.query(Report).count()
    open_reports = db.query(Report).filter(Report.status == ReportStatus.OPEN).count()
    verified_reports = db.query(Report).filter(Report.verification_status == VerificationStatus.ADMIN_VERIFIED).count()
    resolved_reports = db.query(Report).filter(Report.status == ReportStatus.RESOLVED).count()
    hotspot_count = db.query(Hotspot).filter(Hotspot.status == "ACTIVE").count()

    # Calculate high priority count (CRITICAL or HIGH severity or priority >= 50)
    high_priority_count = db.query(Report).filter(
        Report.status != ReportStatus.RESOLVED,
        Report.status != ReportStatus.REJECTED,
        Report.severity.in_([ReportSeverity.HIGH, ReportSeverity.CRITICAL])
    ).count()

    return AdminOverviewResponse(
        total_reports=total_reports,
        open_reports=open_reports,
        verified_reports=verified_reports,
        resolved_reports=resolved_reports,
        hotspot_count=hotspot_count,
        high_priority_count=high_priority_count
    )


@router.get("/reports", response_model=AdminReportListResponse)
def list_admin_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    report_status: Optional[ReportStatus] = Query(None, alias="status"),
    verification_status: Optional[VerificationStatus] = Query(None),
    category: Optional[ReportCategory] = Query(None),
    severity: Optional[ReportSeverity] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lists civic reports for municipal triage sorted by Priority Score."""
    query = db.query(Report).options(joinedload(Report.user))

    if report_status:
        query = query.filter(Report.status == report_status)
    if verification_status:
        query = query.filter(Report.verification_status == verification_status)
    if category:
        query = query.filter(Report.category == category)
    if severity:
        query = query.filter(Report.severity == severity)

    all_matching = query.all()
    items_with_priority = []

    for r in all_matching:
        score, level, reasons, _ = calculate_report_priority(db, r)
        item = AdminReportItem(
            id=r.id,
            title=r.title,
            description=r.description,
            category=r.category.value if hasattr(r.category, "value") else str(r.category),
            severity=r.severity.value if hasattr(r.severity, "value") else str(r.severity),
            status=r.status.value if hasattr(r.status, "value") else str(r.status),
            verification_status=r.verification_status.value if hasattr(r.verification_status, "value") else str(r.verification_status),
            latitude=r.latitude,
            longitude=r.longitude,
            address=r.address,
            priority_score=score,
            priority_level=level,
            priority_reasons=reasons,
            created_at=r.created_at,
            user_name=r.user.name if r.user else "Citizen"
        )
        items_with_priority.append(item)

    # Sort by priority score desc, then created_at desc
    items_with_priority.sort(key=lambda x: (x.priority_score, x.created_at), reverse=True)

    total = len(items_with_priority)
    offset = (page - 1) * limit
    paginated_items = items_with_priority[offset : offset + limit]

    return AdminReportListResponse(
        items=paginated_items,
        total=total,
        page=page,
        limit=limit
    )


@router.patch("/reports/{id}/verify")
def verify_report(
    id: uuid.UUID,
    payload: VerifyReportRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Updates report verification status and records an audit log entry."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    old_status = report.verification_status
    report.verification_status = payload.verification_status

    if payload.verification_status == VerificationStatus.ADMIN_VERIFIED:
        report.status = ReportStatus.VERIFIED
    elif payload.verification_status == VerificationStatus.REJECTED:
        report.status = ReportStatus.REJECTED

    db.commit()
    db.refresh(report)

    # Log Audit Action
    log_admin_action(
        db=db,
        user=admin,
        action="CHANGE_VERIFICATION",
        entity_type="Report",
        entity_id=str(report.id),
        details={
            "old_verification_status": old_status.value if hasattr(old_status, "value") else str(old_status),
            "new_verification_status": payload.verification_status.value,
        }
    )

    score, level, reasons, _ = calculate_report_priority(db, report)
    return {
        "status": "success",
        "report_id": str(report.id),
        "verification_status": report.verification_status.value,
        "priority_score": score,
        "priority_level": level
    }


@router.patch("/reports/{id}/status")
def update_report_status(
    id: uuid.UUID,
    payload: UpdateStatusRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Updates report lifecycle status (IN_PROGRESS, RESOLVED, REJECTED) and records audit log."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    old_status = report.status
    report.status = payload.status

    db.commit()
    db.refresh(report)

    log_admin_action(
        db=db,
        user=admin,
        action=f"STATUS_CHANGE_{payload.status.value}",
        entity_type="Report",
        entity_id=str(report.id),
        details={
            "old_status": old_status.value if hasattr(old_status, "value") else str(old_status),
            "new_status": payload.status.value,
        }
    )

    return {
        "status": "success",
        "report_id": str(report.id),
        "new_status": report.status.value
    }


@router.get("/audit-logs", response_model=List[AuditLogItem])
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lists audit logs for municipal actions."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs


@router.get("/flags", response_model=List[FlagItem])
def list_report_flags(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lists report moderation flags."""
    flags = db.query(ReportFlag).order_by(ReportFlag.created_at.desc()).limit(limit).all()
    return flags
