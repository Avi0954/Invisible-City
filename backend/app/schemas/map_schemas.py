import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.report import ReportCategory, ReportSeverity, ReportStatus


class MapReportItem(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: ReportCategory
    severity: ReportSeverity
    status: ReportStatus
    latitude: float
    longitude: float
    address: Optional[str] = None
    created_at: datetime
    thumbnail_url: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class MapReportListResponse(BaseModel):
    reports: List[MapReportItem]
    count: int
    limit: int
    truncated: bool = False
