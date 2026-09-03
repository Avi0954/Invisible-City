import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.models.report import ReportCategory, ReportSeverity, ReportStatus, VerificationStatus


class ReportMediaResponse(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    media_url: str
    media_type: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255, description="Brief report headline")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed problem description")
    category: ReportCategory = Field(..., description="Issue category")
    severity: ReportSeverity = Field(default=ReportSeverity.MEDIUM, description="Impact severity")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 Latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 Longitude")
    address: Optional[str] = Field(None, max_length=500, description="Human readable address or landmark")


class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[ReportCategory] = None
    severity: Optional[ReportSeverity] = None
    status: Optional[ReportStatus] = None
    verification_status: Optional[VerificationStatus] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    address: Optional[str] = Field(None, max_length=500)


class ReportResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    title: str
    description: str
    category: ReportCategory
    severity: ReportSeverity
    status: ReportStatus
    latitude: float
    longitude: float
    address: Optional[str] = None
    ai_confidence: Optional[float] = None
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    media: List[ReportMediaResponse] = []

    model_config = {
        "from_attributes": True
    }


class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    limit: int
    pages: int
