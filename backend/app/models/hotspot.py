import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

try:
    from geoalchemy2 import Geometry
except ImportError:
    Geometry = None


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    geometry = Column(Geometry("POINT", srid=4326) if Geometry else Text, nullable=True)
    report_count = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    hotspot_reports = relationship("HotspotReport", back_populates="hotspot", cascade="all, delete-orphan")


class HotspotReport(Base):
    __tablename__ = "hotspot_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    hotspot_id = Column(UUID(as_uuid=True), ForeignKey("hotspots.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    hotspot = relationship("Hotspot", back_populates="hotspot_reports")
