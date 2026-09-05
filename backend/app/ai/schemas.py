import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.models.report import ReportCategory, ReportSeverity, ProcessingStatus


class AIReportInput(BaseModel):
    title: str
    description: str
    category: Optional[ReportCategory] = None
    severity: Optional[ReportSeverity] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    image_bytes: Optional[bytes] = None


class AIAnalysisResult(BaseModel):
    category: ReportCategory = Field(..., description="Controlled issue category")
    severity: ReportSeverity = Field(..., description="Controlled impact severity")
    summary: str = Field(..., min_length=5, description="Concise factual summary based strictly on input")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    keywords: List[str] = Field(default_factory=list, description="Relevant short keywords")
    observations: List[str] = Field(default_factory=list, description="Factual observations supported by input")

    @field_validator("confidence")
    @classmethod
    def validate_confidence_range(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError(f"Confidence score {v} must be between 0.0 and 1.0")
        return round(v, 4)


class AIAnalysisResponse(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    provider: Optional[str] = None
    model: Optional[str] = None
    model_version: Optional[str] = None
    prompt_version: Optional[str] = None
    category: Optional[ReportCategory] = None
    severity: Optional[ReportSeverity] = None
    summary: Optional[str] = None
    confidence: Optional[float] = None
    keywords: List[str] = []
    observations: List[str] = []
    processing_status: ProcessingStatus
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class TriggerAnalysisResponse(BaseModel):
    report_id: uuid.UUID
    analysis_id: uuid.UUID
    processing_status: ProcessingStatus
    message: str
