import os
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, Float, DateTime, Enum, ForeignKey, Column, JSON, UniqueConstraint
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


class ProcessingStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


# Use PostGIS Geometry in Postgres, standard Text/WKT in testing/SQLite
use_postgis = Geometry is not None and os.getenv("ENVIRONMENT") != "testing"
use_pgvector = Vector is not None and os.getenv("ENVIRONMENT") != "testing"



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
    geometry = Column(Geometry("POINT", srid=4326) if use_postgis else Text, nullable=True)
    address = Column(Text, nullable=True)
    
    ai_confidence = Column(Float, nullable=True)
    verification_status = Column(Enum(VerificationStatus, name="verificationstatus"), default=VerificationStatus.UNVERIFIED, nullable=False)
    embedding = Column(Vector(1536) if use_pgvector else JSON, nullable=True)
    
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
    
    provider = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    prompt_version = Column(String(50), nullable=True)
    
    category = Column(Enum(ReportCategory, name="reportcategory"), nullable=True)
    severity = Column(Enum(ReportSeverity, name="reportseverity"), nullable=True)
    summary = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    
    keywords = Column(JSON, nullable=True)
    observations = Column(JSON, nullable=True)
    embedding = Column(Vector(1536) if use_pgvector else JSON, nullable=True)
    
    processing_status = Column(Enum(ProcessingStatus, name="processingstatus"), default=ProcessingStatus.PENDING, nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    
    # Backward compatibility fields
    detected_category = Column(String(100), nullable=True)
    confidence_score = Column(Float, nullable=True)
    raw_response = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)

    report = relationship("Report", back_populates="ai_analyses")



class ReportRelationship(Base):
    __tablename__ = "report_relationships"
    __table_args__ = (
        UniqueConstraint("report_id", "related_report_id", name="uq_report_relationship_pair"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    related_report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    relation_type = Column(String(50), nullable=False, default="RELATED", index=True)  # DUPLICATE, RELATED, UNRELATED
    score = Column(Float, nullable=False, default=0.0)
    confidence = Column(Float, nullable=False, default=1.0)
    explanation = Column(Text, nullable=True)
    algorithm_version = Column(String(50), nullable=False, default="v1")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    report = relationship("Report", foreign_keys=[report_id], backref="relationships_as_primary")
    related_report = relationship("Report", foreign_keys=[related_report_id], backref="relationships_as_secondary")


# Alias for backward compatibility
ReportRelation = ReportRelationship


class ReportFlag(Base):
    __tablename__ = "report_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(String(100), nullable=False, index=True)  # FALSE_REPORT, DUPLICATE, INCORRECT_LOCATION, INAPPROPRIATE_CONTENT, ALREADY_RESOLVED
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    report = relationship("Report", backref="flags")
    reporter = relationship("User")
