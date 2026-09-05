import math
import hashlib
from typing import List
from app.ai.base import AIProvider
from app.ai.schemas import AIReportInput, AIAnalysisResult
from app.models.report import ReportCategory, ReportSeverity


class LocalAIProvider(AIProvider):
    """Deterministic local AI provider for development, automated testing, and CI."""

    def __init__(self, model_name: str = "local-deterministic-v1"):
        self._model_name = model_name

    @property
    def provider_name(self) -> str:
        return "local"

    @property
    def model_name(self) -> str:
        return self._model_name

    async def analyze_report(self, input_data: AIReportInput) -> AIAnalysisResult:
        text = f"{input_data.title} {input_data.description}".lower()

        # Deterministic Category & Severity Inference
        if "pothole" in text or "road" in text or "crater" in text:
            category = ReportCategory.POTHOLE
            severity = ReportSeverity.HIGH if "large" in text or "danger" in text else ReportSeverity.MEDIUM
        elif "garbage" in text or "trash" in text or "waste" in text or "dump" in text:
            category = ReportCategory.GARBAGE
            severity = ReportSeverity.MEDIUM
        elif "light" in text or "dark" in text or "lamp" in text or "streetlight" in text:
            category = ReportCategory.STREETLIGHT
            severity = ReportSeverity.LOW if "minor" in text else ReportSeverity.MEDIUM
        elif "water" in text or "pipe" in text or "leak" in text or "sewage" in text:
            category = ReportCategory.WATER_LEAK
            severity = ReportSeverity.HIGH
        elif "footpath" in text or "bridge" in text or "wall" in text or "structure" in text:
            category = ReportCategory.DAMAGED_INFRASTRUCTURE
            severity = ReportSeverity.HIGH
        else:
            category = input_data.category or ReportCategory.OTHER
            severity = input_data.severity or ReportSeverity.MEDIUM

        # Low confidence check if text specifies uncertain language
        if "uncertain" in text or "not sure" in text or "maybe" in text:
            confidence = 0.45
        else:
            confidence = 0.92

        # Keywords Extraction
        words = [w.strip(".,!?") for w in text.split() if len(w) > 3]
        unique_keywords = list(dict.fromkeys(words))[:5]

        # Observations Building
        observations = [f"Identified issue related to {category.value.lower().replace('_', ' ')}."]
        if input_data.address:
            observations.append(f"Located near {input_data.address}.")
        if input_data.image_url or input_data.image_bytes:
            observations.append("Photo attachment provided and verified.")
        else:
            observations.append("Analyzed based on text report input.")

        summary = f"{input_data.title.strip()}. {input_data.description.strip()[:100]}"

        return AIAnalysisResult(
            category=category,
            severity=severity,
            summary=summary,
            confidence=confidence,
            keywords=unique_keywords,
            observations=observations
        )

    async def generate_embedding(self, text: str) -> List[float]:
        """Generates a deterministic 1536-dimensional vector embedding from text hash."""
        hash_digest = hashlib.sha256(text.encode("utf-8")).digest()
        embedding = []
        for i in range(1536):
            byte_val = hash_digest[i % len(hash_digest)]
            val = (byte_val / 255.0) * 2.0 - 1.0  # Normalize between -1.0 and 1.0
            embedding.append(round(val, 6))
        return embedding
