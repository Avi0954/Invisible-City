from fastapi import APIRouter
from datetime import datetime
from app.schemas.health import HealthResponse
from app.core.config import settings
from app.db.session import check_db_connection

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check API & Database Health",
    description="Returns system operational status and probes PostgreSQL database connectivity."
)
async def health_check():
    is_db_connected, db_msg = check_db_connection()
    
    return HealthResponse(
        status="healthy" if is_db_connected else "degraded",
        timestamp=datetime.utcnow(),
        environment=settings.ENVIRONMENT,
        database_connected=is_db_connected,
        database_message=db_msg,
        version="0.1.0"
    )
