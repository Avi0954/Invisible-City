"""Custom exceptions for the AI Analysis Layer."""

class AIProviderError(Exception):
    """Base exception for AI provider communication errors."""
    def __init__(self, message: str, is_retryable: bool = True):
        super().__init__(message)
        self.message = message
        self.is_retryable = is_retryable


class AITimeoutError(AIProviderError):
    """Raised when an AI provider call times out."""
    def __init__(self, message: str = "AI Provider request timed out"):
        super().__init__(message, is_retryable=True)


class AIValidationError(AIProviderError):
    """Raised when AI response fails Pydantic schema validation or business rules."""
    def __init__(self, message: str):
        super().__init__(message, is_retryable=False)


class AIRateLimitError(AIProviderError):
    """Raised when AI provider rate limits are exceeded."""
    def __init__(self, message: str = "AI Provider rate limit exceeded"):
        super().__init__(message, is_retryable=True)
