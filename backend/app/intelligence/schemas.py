import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RelationshipItem(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    related_report_id: uuid.UUID
    relation_type: str  # DUPLICATE, RELATED, UNRELATED
    score: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    explanation: str
    distance_meters: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RelatedReportResponse(BaseModel):
    report_id: uuid.UUID
    related_reports: List[RelationshipItem]
    count: int


class DuplicateReportResponse(BaseModel):
    report_id: uuid.UUID
    duplicates: List[RelationshipItem]
    count: int


class HotspotSupportingReport(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    severity: str
    status: str
    latitude: float
    longitude: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HotspotItem(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    categories: List[str] = []
    severity: str
    status: str  # ACTIVE, STALE, RESOLVED
    center_latitude: float
    center_longitude: float
    radius: float
    report_count: int
    score: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    explanation: Optional[str] = None
    algorithm_version: str = "v1"
    first_detected: datetime
    last_updated: datetime
    supporting_reports: Optional[List[HotspotSupportingReport]] = None

    model_config = ConfigDict(from_attributes=True)


class HotspotListResponse(BaseModel):
    hotspots: List[HotspotItem]
    count: int
