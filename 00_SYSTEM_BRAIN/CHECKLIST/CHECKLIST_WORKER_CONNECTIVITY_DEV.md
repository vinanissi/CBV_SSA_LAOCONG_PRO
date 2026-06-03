# Checklist Runtime — Local Worker Connectivity (Dev)

**Status:** Dev contract (PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX)  
**Scope:** Browser → Worker → GAS path for operator UAT only — not production deploy.

---

## Recommended local stack

1. **Worker** (`workers/api`, port `8787`):
   - Copy `workers/api/.dev.vars.example` → `.dev.vars`
   - Set `GAS_TASK_API_URL` / `CBV_GAS_API_BASE_URL` to live Web App exec URL
   - Set `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`
   - `npm run dev`

2. **Workboard** (`apps/workboard`):
   - Create `.env.local` with `VITE_CBV_API_BASE_URL=` (empty) — **required** because committed `.env` sets `http://localhost:8787` and breaks browser CORS on Windows.
   - Vite proxies `/api` → `http://127.0.0.1:8787`
   - Set `VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`
   - `npm run dev` (note actual port if 5173 is busy)

3. **Verify**
   - `GET http://localhost:<vite-port>/api/runtime/connectivity` → `gasReachable: true`
   - Login → open `/inbox/TASK-...` — must not show `TypeError: Failed to fetch` for `/api/*`

---

## Direct Worker URL (optional)

Use when not using Vite proxy:

```text
VITE_CBV_API_BASE_URL=http://127.0.0.1:8787
VITE_CBV_DEV_PROXY=false
```

Worker `CBV_ALLOWED_ORIGINS` must include the Vite origin. Local dev CORS also accepts any `http://localhost:*` / `http://127.0.0.1:*` origin.

**Windows:** prefer `127.0.0.1` over `localhost` for cross-origin Worker URL to avoid IPv6 listen mismatch.

---

## Diagnostics

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Worker + GAS probe |
| `GET /api/runtime/connectivity` | Browser-friendly connectivity snapshot |

Health path is **`/api/health`** (not `/health`).
