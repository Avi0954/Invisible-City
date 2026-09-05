import math
from datetime import datetime
from typing import List, Tuple, Dict, Any
from app.models.report import Report
from app.intelligence.relationships.scoring import calculate_haversine_distance
from app.core.config import settings

SEVERITY_WEIGHTS = {
    "CRITICAL": 1.0,
    "HIGH": 0.8,
    "MEDIUM": 0.5,
    "LOW": 0.2,
}


def calculate_hotspot_metrics(
    cluster: List[Report],
    epsilon_meters: float = settings.HOTSPOT_EPSILON_METERS
) -> Tuple[float, float, float, float, str, List[str], str, float, Dict[str, Any]]:
    """Calculates 7-factor hotspot score, separate evidence confidence score,

    center coordinates, cluster radius, primary categories, dominant severity, and metrics.
    """
    total_count = len(cluster)
    if total_count == 0:
        return 0.0, 0.0, 0.0, 0.0, "", [], "LOW", 0.0, {}

    # 1. Center Lat/Lng (Centroid)
    center_lat = sum(r.latitude for r in cluster) / total_count
    center_lng = sum(r.longitude for r in cluster) / total_count

    # 2. Radius calculation (max distance from centroid)
    distances = [
        calculate_haversine_distance(center_lat, center_lng, r.latitude, r.longitude)
        for r in cluster
    ]
    max_radius = max(distances) if distances else 0.0
    effective_radius = max(50.0, max_radius)

    # 3. Category distribution & concentration
    cat_counts: Dict[str, int] = {}
    for r in cluster:
        cat_str = r.category.value if hasattr(r.category, "value") else str(r.category)
        cat_counts[cat_str] = cat_counts.get(cat_str, 0) + 1

    sorted_categories = sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
    dominant_category = sorted_categories[0][0]
    dominant_cat_count = sorted_categories[0][1]
    categories_list = [c[0] for c in sorted_categories]

    cat_concentration_score = dominant_cat_count / float(total_count)

    # 4. Severity aggregation
    severity_scores = []
    for r in cluster:
        sev_str = r.severity.value if hasattr(r.severity, "value") else str(r.severity)
        severity_scores.append(SEVERITY_WEIGHTS.get(sev_str, 0.5))

    avg_severity = sum(severity_scores) / float(total_count)
    if avg_severity >= 0.75:
        dominant_severity = "HIGH"
    elif avg_severity >= 0.45:
        dominant_severity = "MEDIUM"
    else:
        dominant_severity = "LOW"

    # Check for any CRITICAL reports
    if any((r.severity.value if hasattr(r.severity, "value") else str(r.severity)) == "CRITICAL" for r in cluster):
        dominant_severity = "CRITICAL"

    # 5. Independent reporters score
    unique_users = len(set(str(r.user_id) for r in cluster if r.user_id))
    independent_reporter_score = min(1.0, unique_users / float(total_count))

    # 6. Recency score (average report age)
    now = datetime.utcnow()
    ages_days = [abs((now - r.created_at).total_seconds()) / 86400.0 for r in cluster]
    avg_age = sum(ages_days) / float(total_count)
    recency_score = math.exp(-avg_age / 30.0)

    # 7. Geographic density score
    geo_density_score = max(0.0, min(1.0, 1.0 - (effective_radius / epsilon_meters)))

    # 8. Report count score
    report_count_score = min(1.0, total_count / 10.0)

    # 9. Relationship strength score (default heuristic based on category consistency & distance)
    rel_strength_score = (cat_concentration_score + geo_density_score) / 2.0

    # 7-factor weighted formula
    hotspot_score = (
        0.20 * report_count_score
        + 0.20 * geo_density_score
        + 0.15 * cat_concentration_score
        + 0.15 * avg_severity
        + 0.15 * rel_strength_score
        + 0.10 * recency_score
        + 0.05 * independent_reporter_score
    )
    hotspot_score = max(0.0, min(1.0, hotspot_score))

    # Separate Confidence metric representing evidence quality
    confidence = (
        0.40 * independent_reporter_score
        + 0.30 * cat_concentration_score
        + 0.30 * min(1.0, total_count / 5.0)
    )
    confidence = max(0.0, min(1.0, confidence))

    metrics = {
        "report_count": total_count,
        "unique_users": unique_users,
        "dominant_category": dominant_category,
        "dominant_cat_count": dominant_cat_count,
        "radius_meters": effective_radius,
        "report_count_score": report_count_score,
        "geo_density_score": geo_density_score,
        "cat_concentration_score": cat_concentration_score,
        "severity_score": avg_severity,
        "rel_strength_score": rel_strength_score,
        "recency_score": recency_score,
        "independent_reporter_score": independent_reporter_score,
    }

    return (
        hotspot_score,
        confidence,
        center_lat,
        center_lng,
        dominant_category,
        categories_list,
        dominant_severity,
        effective_radius,
        metrics
    )
