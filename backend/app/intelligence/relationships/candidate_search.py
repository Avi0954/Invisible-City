import math
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.report import Report, use_postgis
from app.core.config import settings


def find_spatial_candidates(
    db: Session,
    target_report: Report,
    radius_meters: float = settings.INTELLIGENCE_CANDIDATE_RADIUS_METERS,
    limit: int = settings.MAX_SIMILARITY_CANDIDATES
) -> List[Report]:
    """Uses PostGIS ST_DWithin (or spatial bounding box fallback) to generate spatial candidate reports.

    Explicitly excludes self-matching (target_report.id != candidate.id).
    """
    query = db.query(Report).filter(Report.id != target_report.id)

    lat = target_report.latitude
    lng = target_report.longitude

    if use_postgis:
        try:
            from geoalchemy2 import Geography
            point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
            query = query.filter(
                func.ST_DWithin(
                    func.cast(Report.geometry, Geography),
                    func.cast(point, Geography),
                    radius_meters
                )
            )
        except Exception:
            # Fallback to lat/lng bounding box if ST_DWithin compilation fails
            lat_delta = radius_meters / 111111.0
            cos_lat = math.cos(math.radians(lat))
            lng_delta = radius_meters / (111111.0 * max(0.01, cos_lat))
            query = query.filter(
                Report.latitude >= lat - lat_delta,
                Report.latitude <= lat + lat_delta,
                Report.longitude >= lng - lng_delta,
                Report.longitude <= lng + lng_delta
            )
    else:
        # SQLite / testing bounding box & haversine fallback
        lat_delta = radius_meters / 111111.0
        cos_lat = math.cos(math.radians(lat))
        lng_delta = radius_meters / (111111.0 * max(0.01, cos_lat))
        
        query = query.filter(
            Report.latitude >= lat - lat_delta,
            Report.latitude <= lat + lat_delta,
            Report.longitude >= lng - lng_delta,
            Report.longitude <= lng + lng_delta
        )

    candidates = query.limit(limit).all()
    return candidates
