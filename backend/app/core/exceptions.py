from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("invisible_city.exceptions")


class InvisibleCityException(Exception):
    """Base exception for all domain-specific errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class DatabaseConnectionException(InvisibleCityException):
    """Raised when database connection fails."""
    def __init__(self, message: str = "Database connection failed", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_503_SERVICE_UNAVAILABLE, details=details)


class ResourceNotFoundException(InvisibleCityException):
    """Raised when requested entity is not found."""
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": identifier}
        )


async def custom_exception_handler(request: Request, exc: InvisibleCityException):
    """Global handler for domain-specific application exceptions."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[{request_id}] Application Exception ({exc.status_code}): {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
                "request_id": request_id
            }
        }
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    """Global fallback handler for unexpected uncaught exceptions."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"[{request_id}] Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "An unexpected internal server error occurred.",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "request_id": request_id
            }
        }
    )
