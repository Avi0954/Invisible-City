# Invisible City

> **Build With Bharat 2.0 Hackathon MVP**  
> A civic intelligence and problem aggregation platform connecting citizen micro-reports to identify macro urban infrastructure issues using AI and location intelligence.

---

## 🏛️ Architecture Overview

Invisible City is built as a **Modular Monolith** to deliver production-quality reliability without unnecessary infrastructure or DevOps complexity.

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query v5, Axios.
- **Backend**: Python FastAPI, Pydantic v2, SQLAlchemy v2, Alembic, psycopg2-binary.
- **Database**: PostgreSQL with PostGIS (geographic location queries) and `pgvector` (semantic problem embeddings).
- **API Standard**: RESTful API with `/api/v1` versioning and Request ID correlation tracing (`X-Request-ID`).

```
invisible-city/
├── frontend/             # React SPA (Vite + TS + Tailwind)
│   ├── src/
│   │   ├── api/          # Axios HTTP client configuration
│   │   ├── components/   # Header, Sidebar, HealthBadge, Footer
│   │   ├── hooks/        # TanStack Query custom hooks
│   │   ├── layouts/      # Main application layout wrapper
│   │   ├── pages/        # Dashboard, Login, Register, Report, My Reports, Map, Admin
│   │   ├── routes/       # React Router route registry
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript interfaces & types
│   │   └── utils/        # Utility helpers (cn, etc.)
│   └── package.json
│
├── backend/              # FastAPI Modular Monolith
│   ├── app/
│   │   ├── api/v1/       # Version 1 API routers & endpoints (GET /api/v1/health)
│   │   ├── core/         # Settings (pydantic-settings), logging, custom exceptions
│   │   ├── db/           # SQLAlchemy engine, sessions & DB probes
│   │   ├── middleware/   # Request ID tracing middleware
│   │   ├── models/       # Declarative ORM base
│   │   ├── repositories/ # Data access abstraction layer
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── services/     # Business logic layer
│   ├── alembic/          # Migration scripts & configuration
│   ├── main.py           # FastAPI application factory & middleware setup
│   └── requirements.txt
│
├── docs/                 # System & architectural documentation
├── .github/              # GitHub Actions CI workflow
├── .env.example          # Environment variables template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start & Running Locally

### 1. Backend Setup (FastAPI)

Navigate to the `backend/` directory and set up a Python virtual environment:

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run FastAPI backend development server
python run.py
# OR
uvicorn app.main:app --reload --port 8000
```

Backend will be available at:
- **API Base**: `http://localhost:8000/api/v1`
- **Health Check**: `http://localhost:8000/api/v1/health`
- **Swagger Interactive Docs**: `http://localhost:8000/api/v1/docs`

---

### 2. Database Migrations (Alembic)

To verify or apply Alembic migrations against your PostgreSQL database:

```bash
cd backend

# Check current migration revision
alembic current

# Create a new migration (when schema models are added)
alembic revision --autogenerate -m "initial_schema"

# Upgrade database to latest revision
alembic upgrade head
```

---

### 3. Frontend Setup (React + Vite)

In a separate terminal, navigate to `frontend/` and start the Vite development server:

```bash
cd frontend

# Install node dependencies
npm install

# Run development server
npm run dev
```

Frontend application will be accessible at `http://localhost:5173`.

---

## ⚙️ Environment Variables

The following environment variables are configurable via `.env` files:

### Backend `.env`

| Variable | Default Value | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | Runtime environment mode |
| `LOG_LEVEL` | `INFO` | Logging granularity (DEBUG, INFO, WARNING, ERROR) |
| `PROJECT_NAME` | `Invisible City` | Application title |
| `API_V1_STR` | `/api/v1` | API versioning path prefix |
| `POSTGRES_SERVER` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `invisible_city` | Database name |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/invisible_city` | Full SQLAlchemy connection string |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins array |

### Frontend `.env`

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API v1 base URL |

---

## 🔍 Verification & Testing

- **Backend Health Check**: `GET /api/v1/health` returns `status: healthy`, timestamp, active environment, and `database_connected` probe status.
- **Frontend Syntax & Types**: Run `npm run lint` inside `frontend/` to verify zero TypeScript errors.
- **Backend Code Check**: Run `python -m py_compile backend/app/main.py` to verify backend module validity.
