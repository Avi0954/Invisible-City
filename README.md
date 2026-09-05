# Invisible City

> **Build With Bharat 2.0 Hackathon MVP**  
> A civic intelligence and problem aggregation platform connecting citizen micro-reports to identify macro urban infrastructure issues using AI, location intelligence, and multi-signal pattern clustering.

---

## 🌟 Key Differentiator

Traditional complaint portals treat citizen reports as isolated events. **Invisible City** connects individual citizen reports into evidence of larger civic problems, detects spatial problem hotspots, ranks issues by priority, and gives municipal authorities the evidence they need to act first.

---

## 🏛️ Architecture Overview

Invisible City is built as a **Modular Monolith** to deliver production-quality reliability without unnecessary infrastructure or DevOps complexity.

- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS + Tailwind, React Router v6, Leaflet (`react-leaflet`), TanStack Query v5, Axios.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy v2, Alembic, psycopg2-binary.
- **Database**: PostgreSQL with PostGIS (spatial geometry queries via `ST_DWithin`) and `pgvector` (1536-dimensional semantic problem embeddings).
- **AI Analysis**: Multi-provider AI Layer (`LocalAIProvider`, `OpenAIProvider`) with structured Pydantic validation, keyword extraction, and embedding generation.
- **Intelligence Engine**: PostGIS spatial candidate generation, 4-signal similarity scoring (semantic, geographic, category, temporal), duplicate detection, DBSCAN spatial density hotspot clustering, and 6-factor priority ranking ($0 \to 100$).
- **API Standard**: RESTful API with `/api/v1` versioning and Request ID correlation tracing (`X-Request-ID`).

```
invisible-city/
├── frontend/             # React SPA (Vite + TS + Tailwind + Leaflet)
│   ├── src/
│   │   ├── api/          # Axios HTTP client configuration
│   │   ├── components/   # Header, Sidebar, HealthBadge, Footer
│   │   ├── hooks/        # TanStack Query custom hooks (useReports, useMapReports, useIntelligence, useAdmin)
│   │   ├── layouts/      # Main application layout wrapper
│   │   ├── pages/        # HomePage, Login, Register, Report, MyReports, MapPage, ReportDetailPage, AdminPage
│   │   ├── services/     # API service layer (reportService, mapService, intelligenceService, adminService)
│   │   └── types/        # TypeScript interfaces (report, map, intelligence, admin)
│   └── package.json
│
├── backend/              # FastAPI Modular Monolith
│   ├── app/
│   │   ├── ai/           # AI analysis provider layer & schemas
│   │   ├── api/v1/       # Version 1 API routers (auth, reports, map, intelligence, admin, moderation, health)
│   │   ├── cli/          # CLI commands (seed_demo.py)
│   │   ├── core/         # Settings (pydantic-settings), security, logging, exceptions
│   │   ├── db/           # SQLAlchemy engine, sessions & DB probes
│   │   ├── intelligence/ # Candidate search, 4-signal scoring, DBSCAN hotspots, 6-factor priority engine
│   │   ├── middleware/   # Request ID tracing middleware
│   │   ├── models/       # Declarative ORM models (User, Report, ReportMedia, AIAnalysis, ReportRelationship, Hotspot, HotspotReport, AuditLog, ReportFlag)
│   │   ├── repositories/ # Data access abstraction layer
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── services/     # Storage providers & image validation
│   ├── alembic/          # Migration scripts (001_phase2, 002_phase4_ai, 003_phase6_intelligence)
│   ├── tests/            # Pytest test suite (test_auth, test_reports, test_ai_analysis, test_map_spatial, test_intelligence, test_final_readiness)
│   ├── main.py           # FastAPI application factory
│   └── requirements.txt
│
├── docs/                 # Hackathon Demo Guide (demo.md) and architectural docs
├── .env.example          # Environment variables template
└── README.md
```

---

## 🚀 Quick Start & Running Locally

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend development server
python run.py
# OR
uvicorn app.main:app --reload --port 8000
```

Backend will be available at:
- **API Base**: `http://localhost:8000/api/v1`
- **Health Check**: `http://localhost:8000/api/v1/health`
- **Swagger Interactive Docs**: `http://localhost:8000/docs`

---

### 2. Seed Hackathon Demo Dataset

Run the automated seed CLI command in the backend directory:

```bash
cd backend
python -m app.cli.seed_demo
```

#### Seed Credentials Summary
- **Municipal Admin**: `admin@invisiblecity.civic` / `Admin123!`
- **Citizen Account**: `citizen1@example.com` / `Password123!`

The seed script creates users, concentrated reports near Main Gate, executes AI analysis, generates embeddings, calculates 4-signal similarity, detects spatial problem hotspots, and calculates priority scores.

---

### 3. Frontend Setup (React + Vite)

In a separate terminal, navigate to `frontend/` and start the Vite development server:

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend application will be accessible at `http://localhost:5173`.

---

## 📖 Live Hackathon Demo Guide

For full step-by-step evaluation instructions, consult [`docs/demo.md`](file:///d:/LPU%20CERTIFICATES/Invisible%20CIty/docs/demo.md).

---

## 🔍 Verification & Testing

Run the complete backend test suite (64 automated unit & integration tests):

```bash
cd backend
python -m pytest
```

Run frontend production build verification:

```bash
cd frontend
npm run build
```
