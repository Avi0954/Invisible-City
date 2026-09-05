from fastapi import APIRouter
from app.api.v1 import health, auth, reports, ai, map, intelligence, admin, moderation

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(map.router)
api_router.include_router(intelligence.router)
api_router.include_router(admin.router)
api_router.include_router(moderation.router)
api_router.include_router(reports.router)
api_router.include_router(reports.media_router)
api_router.include_router(ai.router)



