from typing import Dict, Any


def generate_hotspot_explanation(metrics: Dict[str, Any]) -> str:
    """Generates concise, deterministic, cautious pattern explanation for a hotspot."""
    count = metrics.get("report_count", 0)
    radius = int(round(metrics.get("radius_meters", 300)))
    dom_cat = metrics.get("dominant_category", "civic").replace("_", " ").lower()
    unique_reporters = metrics.get("unique_users", 1)

    reporter_str = (
        f"{unique_reporters} independent reporters"
        if unique_reporters > 1
        else "1 reporter"
    )

    return (
        f"Pattern detected: {count} reports within {radius}m show a strong concentration "
        f"of recent {dom_cat} complaints from {reporter_str}."
    )
