from app.ai.base import AIProvider
from app.ai.providers.local import LocalAIProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.core.config import settings


def get_ai_provider(provider_override: str = None) -> AIProvider:
    """Factory function returning the configured AIProvider instance."""
    provider_type = (provider_override or settings.AI_PROVIDER).lower()

    if provider_type == "local":
        return LocalAIProvider(model_name=settings.AI_MODEL)
    elif provider_type == "openai":
        return OpenAIProvider(
            api_key=settings.OPENAI_API_KEY,
            model_name=settings.AI_MODEL,
            embedding_model=settings.AI_EMBEDDING_MODEL,
            timeout_seconds=settings.AI_TIMEOUT_SECONDS
        )
    else:
        raise ValueError(f"Unsupported AI Provider '{provider_type}'. Allowed choices: 'local', 'openai'.")
