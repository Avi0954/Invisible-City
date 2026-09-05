import math
from datetime import datetime
from typing import Optional, Dict, Tuple
from app.models.report import Report, ReportCategory
from app.core.config import settings

# Category Relationship Matrix: intermediate similarity scores for related infrastructure categories
CATEGORY_RELATIONSHIP_MATRIX: Dict[Tuple[str, str], float] = {
    ("POTHOLE", "DAMAGED_INFRASTRUCTURE"): 0.65,
    ("DAMAGED_INFRASTRUCTURE", "POTHOLE"): 0.65,
    ("WATER_LEAK", "DAMAGED_INFRASTRUCTURE"): 0.60,
    ("DAMAGED_INFRASTRUCTURE", "WATER_LEAK"): 0.60,
    ("WATER_LEAK", "POTHOLE"): 0.55,
    ("POTHOLE", "WATER_LEAK"): 0.55,
    ("STREETLIGHT", "DAMAGED_INFRASTRUCTURE"): 0.50,
    ("DAMAGED_INFRASTRUCTURE", "STREETLIGHT"): 0.50,
}


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates physical distance in meters between two lat/lon points using the Haversine formula."""
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def calculate_geographic_score(
    lat1: float, lon1: float, lat2: float, lon2: float, radius_meters: float = settings.INTELLIGENCE_CANDIDATE_RADIUS_METERS
) -> Tuple[float, float]:
    """Returns (geographic_score [0,1], distance_meters)."""
    dist = calculate_haversine_distance(lat1, lon1, lat2, lon2)
    if radius_meters <= 0:
        return 0.0, dist
    # Smooth continuous decay
    score = max(0.0, min(1.0, 1.0 - (dist / radius_meters)))
    return score, dist


def calculate_category_score(cat1: ReportCategory, cat2: ReportCategory) -> float:
    """Returns normalized category similarity score [0,1]."""
    c1 = cat1.value if hasattr(cat1, "value") else str(cat1)
    c2 = cat2.value if hasattr(cat2, "value") else str(cat2)

    if c1 == c2:
        return 1.0
    return CATEGORY_RELATIONSHIP_MATRIX.get((c1, c2), 0.10)


def calculate_temporal_score(time1: datetime, time2: datetime) -> float:
    """Returns normalized temporal similarity score [0,1] using exponential decay."""
    delta_seconds = abs((time1 - time2).total_seconds())
    delta_days = delta_seconds / 86400.0
    # Half-life decay over 30 days
    decay_factor = 30.0
    score = math.exp(-delta_days / decay_factor)
    return max(0.0, min(1.0, score))


def calculate_semantic_score(
    report1: Report,
    report2: Report,
    embedding1: Optional[list] = None,
    embedding2: Optional[list] = None
) -> float:
    """Calculates semantic similarity using vector embeddings.

    If vector embeddings are present, computes normalized cosine similarity [0,1].
    If embeddings are missing/unavailable, gracefully falls back to text Jaccard token similarity.
    """
    emb1 = embedding1 or getattr(report1, "embedding", None)
    emb2 = embedding2 or getattr(report2, "embedding", None)

    if emb1 and emb2 and len(emb1) == len(emb2) and len(emb1) > 0:
        # Cosine similarity
        dot_product = sum(a * b for a, b in zip(emb1, emb2))
        norm1 = math.sqrt(sum(a * a for a in emb1))
        norm2 = math.sqrt(sum(b * b for b in emb2))
        if norm1 > 0 and norm2 > 0:
            cos_sim = dot_product / (norm1 * norm2)
            # Map cosine similarity [-1, 1] -> [0, 1]
            return max(0.0, min(1.0, (cos_sim + 1.0) / 2.0))

    # Text Jaccard fallback if embeddings missing or uncalculable
    text1 = set(f"{report1.title} {report1.description}".lower().split())
    text2 = set(f"{report2.title} {report2.description}".lower().split())

    intersection = text1.intersection(text2)
    union = text1.union(text2)

    if not union:
        return 0.0

    jaccard = len(intersection) / len(union)
    return max(0.0, min(1.0, jaccard))


def calculate_combined_relationship_score(
    report1: Report,
    report2: Report,
    radius_meters: float = settings.INTELLIGENCE_CANDIDATE_RADIUS_METERS
) -> Tuple[float, float, Dict[str, float]]:
    """Calculates deterministic 4-signal relationship score.

    Returns:
      (final_relationship_score, distance_meters, component_scores)
    """
    geo_score, distance = calculate_geographic_score(
        report1.latitude, report1.longitude, report2.latitude, report2.longitude, radius_meters
    )
    cat_score = calculate_category_score(report1.category, report2.category)
    temp_score = calculate_temporal_score(report1.created_at, report2.created_at)
    sem_score = calculate_semantic_score(report1, report2)

    w_sem = settings.SIMILARITY_WEIGHT_SEMANTIC
    w_geo = settings.SIMILARITY_WEIGHT_GEO
    w_cat = settings.SIMILARITY_WEIGHT_CATEGORY
    w_temp = settings.SIMILARITY_WEIGHT_TIME

    # Normalize weights sum to 1.0
    total_w = w_sem + w_geo + w_cat + w_temp
    if total_w > 0:
        w_sem /= total_w
        w_geo /= total_w
        w_cat /= total_w
        w_temp /= total_w

    final_score = (
        (w_sem * sem_score)
        + (w_geo * geo_score)
        + (w_cat * cat_score)
        + (w_temp * temp_score)
    )
    final_score = max(0.0, min(1.0, final_score))

    components = {
        "semantic_score": sem_score,
        "geographic_score": geo_score,
        "category_score": cat_score,
        "temporal_score": temp_score,
    }

    return final_score, distance, components
