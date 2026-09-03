import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, Float, DateTime, Enum, ForeignKey, Column, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

try:
    from geoalchemy2 import Geometry
except ImportError:
    Geometry = None

try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = None


class ReportCategory(str, enum.Enum):
    POTHOLE = "POTHOLE"
    GARBAGE = "GARBAGE"
    STREETLIGHT = "STREETLIGHT"
    WATER_LEAK = "WATER_LEAK"
    DAMAGED_INFRASTRUCTURE = "DAMAGED_INFRASTRUCTURE"
    OTHER = "OTHER"


class ReportSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ReportStatus(str, enum.Enum):
    OPEN = "OPEN"
    VERIFIED = "VERIFIED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ADMIN_VERIFIED = "ADMIN_VERIFIED"
    REJECTED = "REJECTED"


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(ReportCategory, name="reportcategory"), nullable=False, index=True)
    severity = Column(Enum(ReportSeverity, name="reportseverity"), default=ReportSeverity.MEDIUM, nullable=False)
    status = Column(Enum(ReportStatus, name="reportstatus"), default=ReportStatus.OPEN, nullable=False, index=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geometry = Column(Geometry("POINT", srid=4326) if Geometry else Text, nullable=True)
    address = Column(Text, nullable=True)
    
    ai_confidence = Column(Float, nullable=True)
    verification_status = Column(Enum(VerificationStatus, name="verificationstatus"), default=VerificationStatus.UNVERIFIED, nullable=False)
    embedding = Column(Vector(1536) if Vector else JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="reports")
    media = relationship("ReportMedia", back_populates="report", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="report", cascade="all, delete-orphan")


class ReportMedia(Base):
    __tablename__ = "report_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    media_url = Column(Text, nullable=False)
    media_type = Column(String(50), nullable=False, default="image")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    report = relationship("Report", back_populates="media")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=True)
    detected_category = Column(String(100), nullable=True)
    confidence_score = Column(Float, nullable=True)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    report = relationship("Report", back_populates="ai_analyses")


class ReportRelation(Base):
    __tablename__ = "report_relations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    source_report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    target_report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    relation_type = Column(String(50), default="SIMILAR", nullable=False)
    similarity_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
