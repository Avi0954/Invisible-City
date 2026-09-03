from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import (
    InvisibleCityException,
    custom_exception_handler,
    unhandled_exception_handler
)
from app.middleware.request_id import RequestIDMiddleware
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown event handling."""
    logger.info(f"Starting {settings.PROJECT_NAME} in environment: {settings.ENVIRONMENT}")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Invisible City - Civic Intelligence & Aggregation Platform",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID Tracing Middleware
app.add_middleware(RequestIDMiddleware)

# Global Exception Handlers
app.add_exception_handler(InvisibleCityException, custom_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
