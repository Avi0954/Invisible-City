from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import ReportCategory, ReportSeverity, ReportStatus
from app.schemas.map_schemas import MapReportItem, MapReportListResponse
from app.repositories.report_repository import ReportRepository
from app.core.config import settings
from app.core.exceptions import InvisibleCityException

router = APIRouter(prefix="/reports", tags=["Map & Spatial Intelligence"])


@router.get(
    "/nearby",
    response_model=MapReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Nearby / Viewport Civic Reports",
    description="Returns spatial reports within a geographic radius or viewport bounding box with strict privacy controls."
)
async def get_nearby_reports(
    latitude: Optional[float] = Query(None, description="Center WGS84 Latitude (-90 to 90)"),
    longitude: Optional[float] = Query(None, description="Center WGS84 Longitude (-180 to 180)"),
    radius: Optional[float] = Query(None, description="Search radius in meters"),
    min_latitude: Optional[float] = Query(None, description="Viewport minimum Latitude"),
    max_latitude: Optional[float] = Query(None, description="Viewport maximum Latitude"),
    min_longitude: Optional[float] = Query(None, description="Viewport minimum Longitude"),
    max_longitude: Optional[float] = Query(None, description="Viewport maximum Longitude"),
    category: Optional[ReportCategory] = Query(None, description="Filter by issue category"),
    severity: Optional[ReportSeverity] = Query(None, description="Filter by issue severity"),
    report_status: Optional[ReportStatus] = Query(None, alias="status", description="Filter by report status"),
    date_from: Optional[str] = Query(None, description="Filter from ISO date string"),
    date_to: Optional[str] = Query(None, description="Filter to ISO date string"),
    limit: int = Query(settings.MAP_MAX_REPORTS, ge=1, le=1000, description="Max reports limit"),
    db: Session = Depends(get_db)
):
    # 1. Coordinate Validation
    if latitude is not None and not (-90.0 <= latitude <= 90.0):
        raise InvisibleCityException(
            message=f"Latitude {latitude} is out of valid range [-90, 90].",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    if longitude is not None and not (-180.0 <= longitude <= 180.0):
        raise InvisibleCityException(
            message=f"Longitude {longitude} is out of valid range [-180, 180].",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 2. Radius Validation
    if radius is not None:
        if radius <= 0 or radius > settings.MAX_NEARBY_RADIUS_METERS:
            raise InvisibleCityException(
                message=f"Radius must be > 0 and <= {settings.MAX_NEARBY_RADIUS_METERS} meters.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

    # 3. Bounding Box Validation
    if min_latitude is not None and max_latitude is not None:
        if not (-90.0 <= min_latitude <= 90.0) or not (-90.0 <= max_latitude <= 90.0):
            raise InvisibleCityException(
                message="Bounding box latitude values must be between -90 and 90.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        if min_latitude > max_latitude:
            raise InvisibleCityException(
                message="min_latitude cannot be greater than max_latitude.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

    if min_longitude is not None and max_longitude is not None:
        if not (-180.0 <= min_longitude <= 180.0) or not (-180.0 <= max_longitude <= 180.0):
            raise InvisibleCityException(
                message="Bounding box longitude values must be between -180 and 180.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        if min_longitude > max_longitude:
            raise InvisibleCityException(
                message="min_longitude cannot be greater than max_longitude.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

    repo = ReportRepository(db)
    items, count, applied_limit, truncated = repo.list_nearby_reports(
        lat=latitude,
        lng=longitude,
        radius=radius,
        min_lat=min_latitude,
        max_lat=max_latitude,
        min_lng=min_longitude,
        max_lng=max_longitude,
        category=category,
        severity=severity,
        status=report_status,
        date_from=date_from,
        date_to=date_to,
        limit=min(limit, settings.MAP_MAX_REPORTS)
    )

    # Map to privacy-safe response DTO
    report_items = []
    for report in items:
        thumbnail = report.media[0].media_url if report.media and len(report.media) > 0 else None
        report_items.append(
            MapReportItem(
                id=report.id,
                title=report.title,
                description=report.description,
                category=report.category,
                severity=report.severity,
                status=report.status,
                latitude=report.latitude,
                longitude=report.longitude,
                address=report.address,
                created_at=report.created_at,
                thumbnail_url=thumbnail
            )
        )

    return MapReportListResponse(
        reports=report_items,
        count=count,
        limit=applied_limit,
        truncated=truncated
    )
