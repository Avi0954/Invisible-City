from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Current overall system status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC ISO-8601 timestamp")
    environment: str = Field(..., description="Active runtime environment (development, staging, production)")
    database_connected: bool = Field(..., description="Flag indicating PostgreSQL connection status")
    database_message: Optional[str] = Field(None, description="Details regarding database connectivity state")
    version: str = Field(default="0.1.0", description="Application API version")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "timestamp": "2026-09-03T15:18:50Z",
                "environment": "development",
                "database_connected": True,
                "database_message": "PostgreSQL connection successful",
                "version": "0.1.0"
            }
        }
    }
