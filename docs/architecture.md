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

## Phase 4: AI Analysis Layer Architecture

```
                               ┌─────────────────────────┐
                               │   POST /reports/{id}/   │
                               │        analyze          │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │  ReportAnalysisService  │
                               │  (State Lock & Retry)   │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        ┌─────────────────────────┐                   ┌─────────────────────────┐
        │   LocalAIProvider       │                   │    OpenAIProvider       │
        │  (Deterministic Dev)    │                   │   (Production API)      │
        └────────────┬────────────┘                   └────────────┬────────────┘
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │   Pydantic Validation   │
                               │ (Category, Severity,    │
                               │  Confidence, Keywords)  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Confidence & Vector Check│
                               │   (>= 0.70 Threshold)   │
                               └────────────┬────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │ status = COMPLETED          │                 │ status = REVIEW_REQUIRED    │
     │ Store vector(1536) embedding│                 │ Flag for Human Review       │
     └─────────────────────────────┘                 └─────────────────────────────┘
```

- **Provider Abstraction (`AIProvider`)**: Clean separation between development mock (`LocalAIProvider`) and production AI APIs (`OpenAIProvider`). Controlled strictly via `AI_PROVIDER` env variable.
- **Strict Validation Pipeline**: Raw AI JSON responses must pass Pydantic `AIAnalysisResult` schema validation (controlled `ReportCategory` & `ReportSeverity` enums, confidence `$0.0 \le c \le 1.0$`).
- **Processing Status Lifecycle**: `PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED` | `REVIEW_REQUIRED` | `FAILED`.
- **Assistive AI Principle**: AI outputs below `AI_CONFIDENCE_THRESHOLD` (0.70) transition to `REVIEW_REQUIRED`. AI insights complement citizen reports without replacing source records.
- **Vector Embeddings**: 1536-dimensional float vectors validated and stored in `ai_analyses.embedding` and `reports.embedding` for Phase 6 similarity indexing.

## Phase 5: Map & Location Intelligence Architecture

```
                               ┌─────────────────────────┐
                               │   Leaflet Map /map      │
                               │  (OpenStreetMap Tiles)  │
                               └────────────┬────────────┘
                                            │
                                            │ Viewport moveend (300ms Debounced)
                                            ▼
                               ┌─────────────────────────┐
                               │  GET /reports/nearby    │
                               │ (minLat, maxLat, etc.)  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │    ReportRepository     │
                               │   (PostGIS GiST Index)  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ PostGIS ST_Intersects / │
                               │       ST_DWithin        │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │   MapReportListResponse │
                               │  (Privacy-Safe DTO)     │
                               └─────────────────────────┘
```

- **PostGIS Server-Side GIS Execution**: Bounding box queries (`ST_Intersects`) and radius searches (`ST_DWithin`) execute directly on PostgreSQL using PostGIS GiST spatial indexes. No Python-side distance loop or array filtering is performed.
- **Viewport Bounding-Box Strategy**: Map component fetches reports within active map viewport bounds (`min_latitude`, `max_latitude`, `min_longitude`, `max_longitude`), debounced by 300ms.
- **Marker Styling & Interactive Popups**: Markers visually convey severity (HIGH/CRITICAL pulsating red, MEDIUM amber, LOW cyan). Popups display category, status, date, short description, and links to `/reports/:id`.
- **Privacy Controls**: Public map API outputs `MapReportItem` objects omitting all citizen credentials and personal identifiers.


