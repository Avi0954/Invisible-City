# Invisible City - Architecture & System Design

## Overview
**Invisible City** is a civic intelligence platform built for **Build With Bharat 2.0**. It empowers citizens to report urban issues (potholes, garbage, broken streetlights, water leaks, damaged infrastructure) and leverages location intelligence and AI to aggregate micro-reports into actionable macro-insights for municipal authorities.

## Architectural Philosophy: Modular Monolith
To maintain production-quality reliability while avoiding DevOps overhead during hackathons, Invisible City uses a **Modular Monolith architecture**.

- **Frontend**: Single-Page Application (SPA) powered by React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, and Axios.
- **Backend**: FastAPI modular application structured into clear layers (API routes, services, repositories, schemas, models, database session management).
- **Persistence Layer**: PostgreSQL with PostGIS (for spatial/geographic queries) and pgvector (for semantic problem clustering).
- **Integration**: Clean HTTP JSON REST API with `/api/v1` versioning.

```
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │   (Vite + TS + Tailwind)│
                    └────────────┬────────────┘
                                 │ HTTP / JSON REST
                                 ▼
                    ┌─────────────────────────┐
                    │     FastAPI Monolith    │
                    │      (/api/v1/health)   │
                    └────────────┬────────────┘
                                 │ SQLAlchemy 2.0
                                 ▼
                    ┌─────────────────────────┐
                    │   PostgreSQL Database   │
                    │   (PostGIS + pgvector)  │
                    └─────────────────────────┘
```

## Backend Layer Responsibilities
- `app/core/`: Application settings (`pydantic-settings`), logging, custom exception handling.
- `app/api/v1/`: Versioned API routing and controller endpoints.
- `app/schemas/`: Pydantic data validation schemas for inputs and outputs.
- `app/models/`: SQLAlchemy ORM models inheriting from common `DeclarativeBase`.
- `app/repositories/`: Data access logic isolating ORM queries from business services.
- `app/services/`: Core business logic, validation rules, AI aggregation workflows.
- `app/db/`: Database session management, engine pooling, health probes.
- `app/middleware/`: Global ASGI middleware (Request ID correlation, CORS, error interceptors).

## Data Schema & Future Extensions
- **Geographic Queries**: PostGIS `GEOMETRY(Point, 4326)` for spatial proximity clustering.
- **AI Embeddings**: `vector(1536)` fields with `pgvector` for semantic issue similarity indexing.
