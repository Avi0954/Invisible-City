import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.report import Report, ReportFlag

router = APIRouter()

ALLOWED_FLAG_REASONS = [
    "FALSE_REPORT",
    "DUPLICATE",
    "INCORRECT_LOCATION",
    "INAPPROPRIATE_CONTENT",
    "ALREADY_RESOLVED",
]


class FlagReportRequest(BaseModel):
    reason: str
    details: Optional[str] = None


class FlagReportResponse(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    reporter_id: uuid.UUID
    reason: str
    details: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)


@router.post("/reports/{id}/flag", response_model=FlagReportResponse, status_code=status.HTTP_201_CREATED, tags=["Moderation"])
def flag_report(
    id: uuid.UUID,
    payload: FlagReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Flags a civic report for moderation with a specific reason."""
    if payload.reason not in ALLOWED_FLAG_REASONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid flag reason. Must be one of: {', '.join(ALLOWED_FLAG_REASONS)}"
        )

    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    flag_entry = ReportFlag(
        report_id=id,
        reporter_id=current_user.id,
        reason=payload.reason,
        details=payload.details
    )
    db.add(flag_entry)
    db.commit()
    db.refresh(flag_entry)

    return FlagReportResponse(
        id=flag_entry.id,
        report_id=flag_entry.report_id,
        reporter_id=flag_entry.reporter_id,
        reason=flag_entry.reason,
        details=flag_entry.details,
        created_at=flag_entry.created_at.isoformat()
    )
