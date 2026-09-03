import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User, UserRole
from app.models.report import ReportCategory, ReportSeverity, ReportStatus
from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportListResponse,
    ReportMediaResponse
)
from app.repositories.report_repository import ReportRepository
from app.services.storage import get_storage_provider
from app.services.image_validator import validate_image_upload
from app.core.exceptions import InvisibleCityException

router = APIRouter(prefix="/reports", tags=["Reports"])
media_router = APIRouter(tags=["Media"])


def build_report_response(report) -> ReportResponse:
    user_name = report.user.name if report.user else None
    media_list = [ReportMediaResponse.model_validate(m) for m in report.media]
    
    return ReportResponse(
        id=report.id,
        user_id=report.user_id,
        user_name=user_name,
        title=report.title,
        description=report.description,
        category=report.category,
        severity=report.severity,
        status=report.status,
        latitude=report.latitude,
        longitude=report.longitude,
        address=report.address,
        ai_confidence=report.ai_confidence,
        verification_status=report.verification_status,
        created_at=report.created_at,
        updated_at=report.updated_at,
        media=media_list
    )


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Civic Report",
    description="Creates a new civic issue report associated with the authenticated citizen."
)
async def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.create(
        user_id=current_user.id,
        title=report_in.title,
        description=report_in.description,
        category=report_in.category,
        severity=report_in.severity,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        address=report_in.address
    )
    report = repo.get_by_id(report.id)
    return build_report_response(report)


@router.get(
    "",
    response_model=ReportListResponse,
    summary="List Civic Reports",
    description="Returns a paginated list of civic reports with optional filtering."
)
async def list_reports(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[ReportCategory] = Query(None, description="Filter by category"),
    severity: Optional[ReportSeverity] = Query(None, description="Filter by severity"),
    report_status: Optional[ReportStatus] = Query(None, alias="status", description="Filter by status"),
    my_reports_only: bool = Query(False, description="Filter to reports owned by current user"),
    date_from: Optional[str] = Query(None, description="Filter from ISO date"),
    date_to: Optional[str] = Query(None, description="Filter to ISO date"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    user_id_filter = current_user.id if my_reports_only and current_user else None

    items, total = repo.list_reports(
        page=page,
        limit=limit,
        category=category,
        severity=severity,
        status=report_status,
        user_id=user_id_filter,
        date_from=date_from,
        date_to=date_to
    )

    pages = math.ceil(total / limit) if total > 0 else 1
    formatted_items = [build_report_response(r) for r in items]

    return ReportListResponse(
        items=formatted_items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get Report Details",
    description="Fetches full details of a specific report by UUID."
)
async def get_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )
    return build_report_response(report)


@router.patch(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Update Report",
    description="Updates report fields. Citizens can edit their own reports; Admins can update any report status."
)
async def update_report(
    report_id: uuid.UUID,
    report_in: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise InvisibleCityException(
            message="You do not have permission to update this report.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    update_data = report_in.model_dump(exclude_unset=True)
    if current_user.role != UserRole.ADMIN:
        update_data.pop("verification_status", None)

    updated_report = repo.update(report, update_data)
    updated_report = repo.get_by_id(updated_report.id)
    return build_report_response(updated_report)


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Report",
    description="Deletes a report and associated media. Citizens can delete their own; Admins can delete any."
)
async def delete_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise InvisibleCityException(
            message="You do not have permission to delete this report.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    storage = get_storage_provider()
    for media_item in report.media:
        storage.delete_file(media_item.media_url)

    repo.delete(report)
    return {"message": "Report deleted successfully."}


# --- Media Endpoints ---

@router.post(
    "/{report_id}/media",
    response_model=ReportMediaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Image Media for Report",
    description="Uploads and validates an image attachment for a report."
)
async def upload_report_media(
    report_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise InvisibleCityException(
            message="You do not have permission to attach media to this report.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    file_bytes = await file.read()
    validate_image_upload(file, file_bytes)

    storage = get_storage_provider()
    media_url = storage.upload_file(file_bytes, file.filename or "image.jpg", file.content_type or "image/jpeg")

    media = repo.add_media(report_id=report.id, media_url=media_url, media_type="image")
    return ReportMediaResponse.model_validate(media)


@router.get(
    "/{report_id}/media",
    response_model=list[ReportMediaResponse],
    summary="Get Media Attachments for Report"
)
async def get_report_media(
    report_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )
    return [ReportMediaResponse.model_validate(m) for m in report.media]


@media_router.delete(
    "/media/{media_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Media Attachment"
)
async def delete_media(
    media_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    media = repo.get_media_by_id(media_id)
    if not media:
        raise InvisibleCityException(
            message=f"Media attachment with ID '{media_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    report = repo.get_by_id(media.report_id)
    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise InvisibleCityException(
            message="You do not have permission to delete this media attachment.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    storage = get_storage_provider()
    storage.delete_file(media.media_url)

    repo.delete_media(media)
    return {"message": "Media attachment deleted successfully."}
