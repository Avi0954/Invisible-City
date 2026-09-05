from typing import Dict
from app.models.report import Report


def generate_relationship_explanation(
    report1: Report,
    report2: Report,
    relation_type: str,
    distance_meters: float,
    components: Dict[str, float]
) -> str:
    """Generates concise, deterministic, template-based human readable explanation.

    Strictly avoids exposing internal model reasoning or non-public citizen details.
    """
    dist_str = f"{int(round(distance_meters))}m" if distance_meters < 1000 else f"{distance_meters / 1000.0:.1f}km"

    cat1 = report1.category.value if hasattr(report1.category, "value") else str(report1.category)
    cat2 = report2.category.value if hasattr(report2.category, "value") else str(report2.category)

    if cat1 == cat2:
        cat_desc = f"share the same category ({cat1})"
    else:
        cat_desc = f"concern related categories ({cat1} / {cat2})"

    sem_score = components.get("semantic_score", 0.0)
    if sem_score >= 0.75:
        sem_desc = "very high semantic similarity"
    elif sem_score >= 0.50:
        sem_desc = "moderate semantic similarity"
    else:
        sem_desc = "distinct textual descriptions"

    if relation_type == "DUPLICATE":
        return f"Reports are {dist_str} apart, {cat_desc}, and describe the same problem with {sem_desc}."
    elif relation_type == "RELATED":
        return f"Reports are {dist_str} apart, {cat_desc}, and show {sem_desc}."
    else:
        return f"Reports are {dist_str} apart with different issue characteristics."
