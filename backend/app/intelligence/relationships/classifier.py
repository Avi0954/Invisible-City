from app.core.config import settings


def classify_relationship(score: float) -> str:
    """Classifies final relationship score into DUPLICATE, RELATED, or UNRELATED

    using deterministic thresholds configured via settings.
    """
    if score >= settings.DUPLICATE_THRESHOLD:
        return "DUPLICATE"
    elif score >= settings.RELATED_THRESHOLD:
        return "RELATED"
    else:
        return "UNRELATED"
