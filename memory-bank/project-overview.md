# Project Overview

## Product

AFVA is a financial metrics dashboard. The current page presents total income, total outcome, profit, profit margin, a monthly income/outcome chart, and a monthly profit-margin chart (`frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`).

The backend provides additional metrics endpoints for summaries, top categories, period comparison, alerts, B2B, and B2C (`backend/app/routes.py`). The current dashboard fetches only `GET /api/metrics` (`frontend/src/App.tsx`).

## Technology Stack

- Frontend: React 19, TypeScript 6, Vite 8, Tailwind CSS, and Recharts (`frontend/package.json`).
- Backend: Python 3.13, FastAPI, Pydantic, and Uvicorn (`backend/Dockerfile`, `backend/requirements.in`, `backend/app/main.py`).
- Local orchestration: Docker Compose services `frontend` and `backend`; host ports are 5173 and 8000 (`docker-compose.yml`).
- Optional local debugging: `debugpy` on port 5678, exposed only on `127.0.0.1` through `docker-compose.debug.yml`.
- Dependency installation: frontend uses `npm ci` and its committed lockfile; backend uses pinned, hashed `backend/requirements.txt` (`frontend/Dockerfile`, `backend/Dockerfile`).

## Current Behavior

- The backend creates 360 deterministic sample movements per request with `generate_mock_movements(seed=42)`; dates are based on the current date (`backend/app/routes.py`).
- There is no database or persistence layer. The sample generator is the dashboard's source of data (`backend/app/routes.py`, `frontend/src/App.tsx`).
- The dashboard computes its KPIs and chart series in the frontend (`frontend/src/lib/financial-utils.ts`). Its displayed period is derived from the movement dates (`frontend/src/App.tsx`).
- The frontend uses Vite's `/api` proxy to reach `backend:8000` in Compose (`frontend/vite.config.ts`).
- CORS allows no origins by default; explicit origins can be provided with `CORS_ALLOW_ORIGINS` (`backend/app/main.py`, `docker-compose.yml`).
- Remote debugging is disabled in the normal Compose configuration; a separate override enables it locally (`backend/Dockerfile`, `docker-compose.debug.yml`).

## Known Gaps

- The additional backend analytics endpoints are not connected to the current dashboard; the UI currently requests only `/api/metrics` (`frontend/src/App.tsx`, `backend/app/routes.py`).
- There is no browser-level or component-level test for the dashboard's API request and loading/error workflow. Current frontend tests exercise financial utility functions (`frontend/src/lib/financial-utils.test.ts`).
- Amounts use Python `float` and TypeScript `number`; currency formatting currently displays USD with zero decimal places (`backend/app/routes.py`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`). This is a demo behavior, not a validated policy for real financial data.
- The sample data is generated at request time, so it must not be mistaken for stored business records (`backend/app/routes.py`).

## Candidate Priorities

These are evidence-based opportunities, not an approved roadmap; confirm product requirements before implementing them.

1. Decide whether the dashboard should expose filters and analytics already available from the backend (`backend/app/routes.py`, `frontend/src/App.tsx`).
2. Add focused UI/API workflow tests if the dashboard's fetch, loading, and failure states are changed (`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.test.ts`).
3. Define currency and precision requirements before connecting real financial records (`frontend/src/lib/financial-utils.ts`, `backend/app/routes.py`).
4. Introduce persistence only when required by product behavior; the current API is explicitly backed by generated samples (`backend/app/routes.py`).

## Verification Snapshot

The latest recorded validation for this workspace passed 7 frontend tests, frontend lint and build, and 18 backend tests. The backend test run emitted a Starlette deprecation warning about `TestClient` and `httpx`; the frontend build emitted a bundle-size warning. Re-run the documented checks after changing application code; these results are not a permanent guarantee of main's health.