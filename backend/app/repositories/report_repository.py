import uuid
from typing import Optional, List, Tuple
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from app.models.report import (
    Report,
    ReportMedia,
    ReportCategory,
    ReportSeverity,
    ReportStatus,
    VerificationStatus
)
from app.models.user import User


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: uuid.UUID,
        title: str,
        description: str,
        category: ReportCategory,
        severity: ReportSeverity,
        latitude: float,
        longitude: float,
        address: Optional[str] = None
    ) -> Report:
        # Create PostGIS point WKT if spatial extensions exist
        geometry_wkt = f"SRID=4326;POINT({longitude} {latitude})"
        
        report = Report(
            user_id=user_id,
            title=title,
            description=description,
            category=category,
            severity=severity,
            status=ReportStatus.OPEN,
            latitude=latitude,
            longitude=longitude,
            geometry=geometry_wkt,
            address=address,
            verification_status=VerificationStatus.UNVERIFIED
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_by_id(self, report_id: uuid.UUID) -> Optional[Report]:
        return (
            self.db.query(Report)
            .options(joinedload(Report.media), joinedload(Report.user))
            .filter(Report.id == report_id)
            .first()
        )

    def list_reports(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[ReportCategory] = None,
        severity: Optional[ReportSeverity] = None,
        status: Optional[ReportStatus] = None,
        user_id: Optional[uuid.UUID] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> Tuple[List[Report], int]:
        query = self.db.query(Report).options(joinedload(Report.media), joinedload(Report.user))

        if category:
            query = query.filter(Report.category == category)
        if severity:
            query = query.filter(Report.severity == severity)
        if status:
            query = query.filter(Report.status == status)
        if user_id:
            query = query.filter(Report.user_id == user_id)
        if date_from:
            query = query.filter(Report.created_at >= date_from)
        if date_to:
            query = query.filter(Report.created_at <= date_to)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(Report.created_at.desc()).offset(offset).limit(limit).all()

        return items, total

    def update(self, report: Report, update_data: dict) -> Report:
        for key, value in update_data.items():
            if value is not None and hasattr(report, key):
                setattr(report, key, value)
                
        if "latitude" in update_data or "longitude" in update_data:
            lat = update_data.get("latitude", report.latitude)
            lng = update_data.get("longitude", report.longitude)
            report.geometry = f"SRID=4326;POINT({lng} {lat})"

        self.db.commit()
        self.db.refresh(report)
        return report

    def delete(self, report: Report) -> None:
        self.db.delete(report)
        self.db.commit()

    def add_media(self, report_id: uuid.UUID, media_url: str, media_type: str = "image") -> ReportMedia:
        media = ReportMedia(
            report_id=report_id,
            media_url=media_url,
            media_type=media_type
        )
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        return media

    def get_media_by_id(self, media_id: uuid.UUID) -> Optional[ReportMedia]:
        return self.db.query(ReportMedia).filter(ReportMedia.id == media_id).first()

    def delete_media(self, media: ReportMedia) -> None:
        self.db.delete(media)
        self.db.commit()
