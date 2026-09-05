import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.models.report import Report
from app.models.hotspot import Hotspot, HotspotReport, use_postgis
from app.intelligence.hotspots.clustering import cluster_reports_density
from app.intelligence.hotspots.scoring import calculate_hotspot_metrics
from app.intelligence.hotspots.explanations import generate_hotspot_explanation
from app.intelligence.relationships.scoring import calculate_haversine_distance
from app.core.config import settings


class HotspotDetectionService:
    def __init__(self, db: Session):
        self.db = db

    def detect_hotspots(
        self,
        lookback_days: int = settings.HOTSPOT_LOOKBACK_DAYS,
        epsilon_meters: float = settings.HOTSPOT_EPSILON_METERS,
        min_reports: int = settings.HOTSPOT_MIN_REPORTS
    ) -> List[Hotspot]:
        """Runs spatial density clustering over recent reports and detects/updates Hotspots idempotently."""
        cutoff_date = datetime.utcnow() - timedelta(days=lookback_days)

        # 1. Fetch relevant reports within lookback window
        reports = (
            self.db.query(Report)
            .filter(Report.created_at >= cutoff_date)
            .all()
        )

        if len(reports) < min_reports:
            return []

        # 2. Cluster reports geographically
        clusters = cluster_reports_density(reports, epsilon_meters=epsilon_meters, min_reports=min_reports)

        existing_hotspots = self.db.query(Hotspot).filter(Hotspot.status == "ACTIVE").all()
        detected_hotspots: List[Hotspot] = []

        for cluster in clusters:
            (
                score,
                confidence,
                center_lat,
                center_lng,
                dominant_cat,
                categories_list,
                dominant_sev,
                effective_radius,
                metrics
            ) = calculate_hotspot_metrics(cluster, epsilon_meters)

            explanation = generate_hotspot_explanation(metrics)
            title = f"Possible {dominant_cat.replace('_', ' ').title()} Pattern"
            desc = f"Detected {len(cluster)} complaints within {int(round(effective_radius))}m."

            # Match against existing active hotspots (Idempotency)
            matched_hotspot: Optional[Hotspot] = None
            for existing in existing_hotspots:
                dist = calculate_haversine_distance(
                    center_lat, center_lng, existing.center_latitude, existing.center_longitude
                )
                if dist <= max(existing.radius, effective_radius):
                    matched_hotspot = existing
                    break

            if matched_hotspot:
                # Update existing hotspot
                matched_hotspot.title = title
                matched_hotspot.description = desc
                matched_hotspot.category = dominant_cat
                matched_hotspot.categories = categories_list
                matched_hotspot.severity = dominant_sev
                matched_hotspot.center_latitude = center_lat
                matched_hotspot.center_longitude = center_lng
                if use_postgis:
                    matched_hotspot.geometry = f"SRID=4326;POINT({center_lng} {center_lat})"
                matched_hotspot.radius = effective_radius
                matched_hotspot.report_count = len(cluster)
                matched_hotspot.score = score
                matched_hotspot.confidence = confidence
                matched_hotspot.explanation = explanation
                matched_hotspot.last_updated = datetime.utcnow()
                matched_hotspot.algorithm_version = settings.HOTSPOT_ALGORITHM_VERSION
                hotspot_obj = matched_hotspot
            else:
                # Create new hotspot
                hotspot_obj = Hotspot(
                    title=title,
                    description=desc,
                    category=dominant_cat,
                    categories=categories_list,
                    severity=dominant_sev,
                    status="ACTIVE",
                    center_latitude=center_lat,
                    center_longitude=center_lng,
                    geometry=f"SRID=4326;POINT({center_lng} {center_lat})" if use_postgis else None,
                    radius=effective_radius,
                    report_count=len(cluster),
                    score=score,
                    confidence=confidence,
                    explanation=explanation,
                    algorithm_version=settings.HOTSPOT_ALGORITHM_VERSION,
                    first_detected=datetime.utcnow(),
                    last_updated=datetime.utcnow()
                )
                self.db.add(hotspot_obj)
                self.db.flush()  # assign ID

            # Link cluster reports (HotspotReport)
            cluster_report_ids = set(r.id for r in cluster)
            existing_links = (
                self.db.query(HotspotReport)
                .filter(HotspotReport.hotspot_id == hotspot_obj.id)
                .all()
            )
            linked_report_ids = set(link.report_id for link in existing_links)

            for report_item in cluster:
                if report_item.id not in linked_report_ids:
                    link = HotspotReport(
                        hotspot_id=hotspot_obj.id,
                        report_id=report_item.id,
                        contribution_score=1.0
                    )
                    self.db.add(link)

            detected_hotspots.append(hotspot_obj)

        # Mark active hotspots with no recent activity as STALE
        detected_ids = set(h.id for h in detected_hotspots)
        for existing in existing_hotspots:
            if existing.id not in detected_ids:
                if existing.last_updated < cutoff_date:
                    existing.status = "STALE"

        self.db.commit()
        return detected_hotspots

    def list_hotspots(
        self,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = "ACTIVE",
        min_score: Optional[float] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        limit: int = 50
    ) -> List[Hotspot]:
        """Lists hotspots with filter criteria."""
        query = self.db.query(Hotspot)

        if category:
            query = query.filter(Hotspot.category == category)
        if severity:
            query = query.filter(Hotspot.severity == severity)
        if status:
            query = query.filter(Hotspot.status == status)
        if min_score is not None:
            query = query.filter(Hotspot.score >= min_score)
        if date_from:
            query = query.filter(Hotspot.first_detected >= date_from)
        if date_to:
            query = query.filter(Hotspot.first_detected <= date_to)

        return query.order_by(Hotspot.score.desc()).limit(limit).all()

    def get_hotspot_detail(self, hotspot_id: uuid.UUID) -> Optional[Tuple[Hotspot, List[Report]]]:
        """Gets hotspot detail and privacy-sanitized supporting reports."""
        hotspot = self.db.query(Hotspot).filter(Hotspot.id == hotspot_id).first()
        if not hotspot:
            return None

        links = (
            self.db.query(HotspotReport)
            .filter(HotspotReport.hotspot_id == hotspot_id)
            .all()
        )
        report_ids = [link.report_id for link in links]

        supporting_reports = []
        if report_ids:
            supporting_reports = (
                self.db.query(Report)
                .filter(Report.id.in_(report_ids))
                .order_by(Report.created_at.desc())
                .all()
            )

        return hotspot, supporting_reports
