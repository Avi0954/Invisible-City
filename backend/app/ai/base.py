from abc import ABC, abstractmethod
from typing import List
from app.ai.schemas import AIReportInput, AIAnalysisResult


class AIProvider(ABC):
    """Abstract base class interface for AI Analysis and Embedding providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name identifier of the provider (e.g. 'local', 'openai')."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Name of the configured model."""
        pass

    @abstractmethod
    async def analyze_report(self, input_data: AIReportInput) -> AIAnalysisResult:
        """Analyzes a civic report (text and optional image) and returns a validated AIAnalysisResult."""
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Generates a numeric vector embedding for the given input text."""
        pass
