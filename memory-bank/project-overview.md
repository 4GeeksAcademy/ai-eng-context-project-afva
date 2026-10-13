# Project Overview

## Product

AFVA is a financial metrics dashboard. The current page presents total income, total outcome, profit, profit margin, a monthly income/outcome chart, and a monthly profit-margin chart (`frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`).

The backend provides additional metrics endpoints for summaries, top categories, period comparison, alerts, B2B, and B2C (`backend/app/routes.py`). The current dashboard fetches only `GET /api/metrics` (`frontend/src/App.tsx`).

## Technology Stack

- Frontend: React 19, TypeScript 6, Vite 8, Tailwind CSS, Recharts, Vitest, and React Testing Library (`frontend/package.json`).
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
- Dashboard API workflow coverage is in `frontend/src/App.test.tsx`: loading, empty results, calculated metrics, API errors, and switching to the business comparison view. Utility behavior remains covered by `frontend/src/lib/financial-utils.test.ts`.
- Amounts use Python `float` and TypeScript `number`; currency formatting currently displays USD with zero decimal places (`backend/app/routes.py`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`). This is a demo behavior, not a validated policy for real financial data.
- The sample data is generated at request time, so it must not be mistaken for stored business records (`backend/app/routes.py`).

## Candidate Priorities

These are evidence-based opportunities, not an approved roadmap; confirm product requirements before implementing them.

1. Decide whether the dashboard should expose filters and analytics already available from the backend (`backend/app/routes.py`, `frontend/src/App.tsx`).
2. Extend the focused UI/API workflow tests when dashboard request, loading, error, or filter behavior changes (`frontend/src/App.tsx`, `frontend/src/App.test.tsx`).
3. Define currency and precision requirements before connecting real financial records (`frontend/src/lib/financial-utils.ts`, `backend/app/routes.py`).
4. Introduce persistence only when required by product behavior; the current API is explicitly backed by generated samples (`backend/app/routes.py`).

## Skill Selection Rationale

- Discovered candidate skills with `npx skills find testing` and `npx skills find performance`, and selected `webapp-testing` (`anthropics/skills@webapp-testing`). Testing is the higher-value next step because the dashboard had no component-level coverage for API loading and error states, while performance work beyond the known bundle-size warning needs measurements first.
- Applied its Playwright workflow to attempt a browser smoke test. Chromium could not launch in this dev container because `libatk-1.0.so.0` is unavailable. Added focused Vitest/React Testing Library coverage instead; browser-level verification remains an environment limitation.

## Skills Applied

- `accessibility` and `vercel-react-best-practices` informed the dashboard changes recorded in commits `3e806c3` and `5a20b7b` (verified keyboard focus `:focus-visible`, `aria-*`/`role="status"` attributes, decorative icons marked `aria-hidden="true"` plus `sr-only` chart tables, and WCAG AA contrast tokens `--muted-foreground` / `--input`).
- `webapp-testing` (found via `npx skills find`) was selected over performance-focused work because UI workflow coverage was the clearer gap. The frontend suite passed 14 tests with lint and build in the broader validation; Playwright remained blocked by the missing Chromium system library.
- The internal `data-flow-contracts` skill at `.agents/skills/data-flow-contracts/SKILL.md` (mirrored at `.skills/data-flow-contracts/SKILL.md`) addresses contract drift across API and frontend boundaries. Applied to `/api/metrics` through frontend calculations: field/type definitions matched statically, but the frontend does not validate the JSON payload at runtime. The focused `App.test.tsx` run passed 4 tests, and the backend endpoint test passed in the existing Docker image; the active host Python interpreter lacks FastAPI.

## Verification Snapshot

The latest frontend validation passed 14 tests, lint, and build. The build still emits the known 617.51 kB chunk-size warning; the backend snapshot passed 18 tests and emitted a Starlette deprecation warning about `TestClient` and `httpx`. A browser smoke test was attempted but Chromium could not launch because this container lacks `libatk-1.0.so.0`; the equivalent dashboard states have component-level coverage. The full npm development dependency audit reports 13 vulnerabilities, while `npm audit --omit=dev` reports zero production vulnerabilities. Re-run the documented checks after changing application code; these results are not a permanent guarantee of main's health.