import json
import asyncio
import httpx
from typing import List, Optional
from app.ai.base import AIProvider
from app.ai.schemas import AIReportInput, AIAnalysisResult
from app.ai.exceptions import (
    AIProviderError,
    AITimeoutError,
    AIValidationError,
    AIRateLimitError
)
from app.core.config import settings
from app.models.report import ReportCategory, ReportSeverity


SYSTEM_PROMPT = """You are an AI assistant analyzing civic issue reports for municipal infrastructure triage.

Your task is to classify the submitted report using ONLY the information provided by the citizen and any provided image details.

Return ONLY valid structured JSON matching this schema:
{
  "category": "POTHOLE" | "GARBAGE" | "STREETLIGHT" | "WATER_LEAK" | "DAMAGED_INFRASTRUCTURE" | "OTHER",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "string (concise summary based only on input)",
  "confidence": float (between 0.0 and 1.0),
  "keywords": ["string"],
  "observations": ["string"]
}

Rules:
1. Do not invent facts not present in the input.
2. Choose exactly one category from the allowed categories.
3. Choose exactly one severity from LOW, MEDIUM, HIGH, CRITICAL.
4. Confidence must be a number between 0.0 and 1.0. Lower the confidence if evidence is insufficient or ambiguous.
5. Observations must contain only factual statements derived directly from the report text or image.
"""


class OpenAIProvider(AIProvider):
    """Production provider using OpenAI Chat Completions and Embeddings APIs."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gpt-4o-mini",
        embedding_model: str = "text-embedding-3-small",
        timeout_seconds: int = 30
    ):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self._model_name = model_name
        self._embedding_model = embedding_model
        self.timeout_seconds = timeout_seconds

        if not self.api_key:
            raise AIProviderError("OPENAI_API_KEY is not configured.", is_retryable=False)

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def model_name(self) -> str:
        return self._model_name

    async def analyze_report(self, input_data: AIReportInput) -> AIAnalysisResult:
        user_message = f"Report Title: {input_data.title}\nReport Description: {input_data.description}"
        if input_data.address:
            user_message += f"\nLocation/Address: {input_data.address}"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]

        payload = {
            "model": self._model_name,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.1
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout_seconds)) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                )

            if response.status_code == 429:
                raise AIRateLimitError("OpenAI API rate limit exceeded.")
            elif response.status_code != 200:
                raise AIProviderError(
                    f"OpenAI API returned HTTP {response.status_code}: {response.text}",
                    is_retryable=response.status_code >= 500
                )

            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"]
            parsed_json = json.loads(content)

            return AIAnalysisResult(**parsed_json)

        except httpx.TimeoutException:
            raise AITimeoutError(f"OpenAI request timed out after {self.timeout_seconds} seconds.")
        except json.JSONDecodeError as err:
            raise AIValidationError(f"Failed to parse OpenAI JSON response: {err}")
        except Exception as err:
            if isinstance(err, AIProviderError):
                raise err
            raise AIValidationError(f"AI response schema validation failed: {err}")

    async def generate_embedding(self, text: str) -> List[float]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self._embedding_model,
            "input": text
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout_seconds)) as client:
                response = await client.post(
                    "https://api.openai.com/v1/embeddings",
                    headers=headers,
                    json=payload
                )

            if response.status_code == 429:
                raise AIRateLimitError("OpenAI Embedding rate limit exceeded.")
            elif response.status_code != 200:
                raise AIProviderError(f"OpenAI Embedding API error HTTP {response.status_code}: {response.text}")

            res_data = response.json()
            embedding = res_data["data"][0]["embedding"]

            if len(embedding) != 1536:
                raise AIValidationError(f"Expected embedding dimension 1536, got {len(embedding)}")

            return embedding

        except httpx.TimeoutException:
            raise AITimeoutError("OpenAI embedding request timed out.")
        except Exception as err:
            if isinstance(err, AIProviderError):
                raise err
            raise AIProviderError(f"Embedding generation failed: {err}")
