# Invisible City — Hackathon Demo Guide

This guide details the exact step-by-step procedure for demonstrating **Invisible City** during a live hackathon evaluation.

---

## 1. Environment & Application Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL + PostGIS + pgvector (or SQLite fallback)

### Step 1: Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will run at `http://localhost:8000` (OpenAPI interactive docs at `http://localhost:8000/docs`).

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```
Frontend Web SPA will run at `http://localhost:5173`.

---

## 2. Seed Hackathon Demo Dataset

Run the automated seed CLI command in the backend directory:
```bash
cd backend
python -m app.cli.seed_demo
```

### What `seed_demo` Executes
1. **Creates Demo Accounts**:
   - **Municipal Admin**: `admin@invisiblecity.civic` / `Admin123!`
   - **Citizens**: `citizen1@example.com` / `Password123!`, `citizen2@example.com`, etc.
2. **Seeds 6 Concentrated Reports** near Main Gate (12.9716, 77.5946):
   - *Large pothole near Main Gate*
   - *Huge pothole outside Main Gate*
   - *Road damage near Main Gate*
   - *Water collects in damaged road near Main Gate*
   - *Broken streetlight near Main Gate*
   - *Garbage dumped near Main Gate*
3. **Runs Genuine Intelligence Engine Pipeline**:
   - Executes AI analysis & vector embedding generation
   - Runs PostGIS spatial candidate search & 4-signal relationship classification
   - Runs DBSCAN spatial density clustering to detect problem hotspots
   - Calculates 6-factor priority scores ($0 \to 100$)

---

## 3. End-to-End Live Hackathon Demo Sequence

### Step 1 — Citizen Login & Report Submission
1. Open `http://localhost:5173/login`.
2. Login as Citizen: `citizen1@example.com` / `Password123!`.
3. Click **Report Issue** (`/report`).
4. Enter description: *"Large dangerous pothole outside Main Gate 1 disrupting traffic."*
5. Select location on interactive map or click **Current Location**.
6. Upload a photo attachment.
7. Click **Submit Civic Report**.

### Step 2 — Real-time AI Analysis
1. Upon submission, the UI navigates to `/reports/:id`.
2. Notice the AI status badge (`COMPLETED`) displaying:
   - **Category**: `Potholes & Roads`
   - **Severity**: `HIGH`
   - **AI Confidence**: `92%`
   - **Summary**: Key factual summary extracted by AI layer
   - **Extracted Keywords**: `pothole`, `traffic hazard`, `road damage`

### Step 3 — Spatial Problem Map & Hotspot Layer
1. Navigate to **Map** (`/map`).
2. Observe the interactive spatial map displaying:
   - PostGIS viewport-bounded report markers color-coded by severity (`CRITICAL`/`HIGH` pulsating red).
   - **Hotspot Circle Layer** rendered around Main Gate area.
3. Click the **Possible Hotspot** circle:
   - Displays popup badge: `Possible Hotspot` (e.g. 82% confidence)
   - Pattern summary: *"Pattern detected: 6 reports within 300m show a strong concentration of recent pothole complaints from 4 independent reporters."*

### Step 4 — Cross-Report Similarity & Duplicates
1. Open report detail for *"Large pothole near Main Gate"*.
2. Scroll to **Possible Duplicates** section:
   - Displays duplicate report *"Huge pothole outside Main Gate"* with `89% match` confidence and clear evidence explanation.
3. Scroll to **Related Reports** section:
   - Displays related reports *"Road damage near Main Gate"* and *"Water collects in damaged road"* with `76% similarity`.

### Step 5 — Municipal Admin Priority Triage Dashboard
1. Open `/login` and sign in as Municipal Admin: `admin@invisiblecity.civic` / `Admin123!`.
2. Navigate to **Admin Triage** (`/admin`).
3. View real-time KPI cards:
   - **Total Reports**: 6
   - **Open Reports**: 6
   - **Verified**: 0
   - **Hotspots**: 1
   - **High Priority**: 5
4. Examine the **Priority Triage Queue Table**:
   - Reports are automatically ranked by calculated Priority Score ($85/100$, `CRITICAL`).
   - Click Priority Badge to view exact evidence calculation breakdown:
     - *"High severity civic issue"*
     - *"6 nearby civic complaints in local area"*
     - *"Reported by 4 independent citizens"*
     - *"Recent report submitted within 24 hours"*

### Step 6 — Verification & Resolution Workflow
1. In the Triage Table, change Verification Status dropdown for top issue to **ADMIN VERIFIED**.
   - Notice immediate priority update & audit log record creation.
2. Change Lifecycle Status dropdown to **IN PROGRESS**, then **RESOLVED**.
3. Switch to **Audit Logs** tab to demonstrate administrative action transparency.

---

## Key Hackathon Differentiator Message

> **"Traditional complaint portals treat reports as isolated events. Invisible City connects individual citizen reports into evidence of larger civic problems and tells municipal authorities what needs attention first."**
