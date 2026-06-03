# Test Evidence — CHECKLIST_WORKER_CONNECTIVITY_FIX

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX` |
| **Timestamp** | 2026-06-02T22:16+07:00 |
| **Executor** | Cursor agent (automated curl / node fetch) |

---

## Environment

| Variable / setting | Value |
|--------------------|--------|
| `VITE_CBV_API_BASE_URL` | (empty — dev proxy) |
| `VITE_CBV_TASK_RUNTIME_MODE` | `google_sheet_existing_db` |
| Worker port | `8787` |
| Vite port (session) | `5175` (5173–5174 in use) |
| `GAS_TASK_API_URL` | Live Web App exec (see REPORT) |

---

## Before (prior phase)

| Check | Result |
|-------|--------|
| Browser `fetch('http://localhost:8787/health')` | **FAIL** — wrong path; also cross-origin/CORS |
| UI banner | `Runtime TASK_MAIN chưa kết nối` |
| OPTIONS `Origin: http://localhost:5174` | **FAIL** — Allow-Origin did not match |

---

## After — Worker direct (`127.0.0.1:8787`)

### `GET /api/health`

```json
{ "ok": true, "data": { "gasReachable": true, "mode": "GAS_SHEET_BRIDGE" } }
```

### `GET /api/runtime/connectivity`

```json
{ "ok": true, "data": { "connectivity": "worker_ok", "taskDbConfigured": true, "gasReachable": true } }
```

### OPTIONS preflight

- Request: `OPTIONS /api/health`, `Origin: http://localhost:5174`
- Response: **204**, `Access-Control-Allow-Origin: http://localhost:5174`

### Auth + checklist

- `POST /api/auth/login` (`admin`/`1234`) → token issued
- `GET /api/work-inbox/tasks/TASK-mpwr16qj-CNBT/checklist` → **2 items**, `ok: true`
- `GET /api/tasks/TASK-mpwr16qj-CNBT` → **WARN** one run: `GOOGLE_SHEET_TIMEOUT`

---

## After — Vite proxy (`localhost:5175`)

### `GET /api/health` (via proxy)

```json
{ "ok": true, "data": { "gasReachable": true } }
```

### Node fetch (browser simulation)

```text
fetch('http://localhost:5175/api/health') → browser-sim-proxy true true
fetch('http://127.0.0.1:8787/api/health', { Origin: 'http://localhost:5175' }) → browser-sim-direct true
```

---

## Not executed in this phase

- Playwright / full operator UAT-01..15
- Production Cloudflare Worker deploy CORS update

---

## Comparison summary

| Path | Before | After |
|------|--------|-------|
| Frontend → Worker (cross-origin) | FAIL | PASS with CORS fix |
| Frontend → Worker (Vite proxy) | N/A | PASS |
| Worker → GAS | PASS | PASS |
| Checklist via Worker | PASS (API) | PASS |
