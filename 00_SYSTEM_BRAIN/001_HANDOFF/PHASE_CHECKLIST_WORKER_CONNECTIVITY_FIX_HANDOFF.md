# Phase Handoff — CHECKLIST_WORKER_CONNECTIVITY_FIX

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |
| **Next** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun) |

---

## What was done

1. Added Vite `/api` proxy to Worker (`127.0.0.1:8787`) — browser uses same-origin fetch.
2. Added `apiBase.ts` so dev proxy + `VITE_CBV_TASK_RUNTIME_MODE` enables real runtime without absolute Worker URL.
3. Relaxed dev CORS for any localhost / 127.0.0.1 port.
4. Added `GET /api/runtime/connectivity` diagnostic route.
5. Documented operator dev stack in `CHECKLIST_WORKER_CONNECTIVITY_DEV.md`.

---

## Read first

1. `000_REPORTS/PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX_REPORT.md`
2. `005_TEST_EVIDENCE/PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX_TEST_EVIDENCE.md`
3. `00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_WORKER_CONNECTIVITY_DEV.md`

---

## Operator rerun (browser UAT)

```powershell
# Terminal 1
cd workers\api
copy .dev.vars.example .dev.vars   # if needed; set GAS_TASK_API_URL
npm run dev

# Terminal 2
cd apps\workboard
# .env.local: VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db only (empty API base)
npm run dev
```

Open Vite URL from console (e.g. `http://localhost:5173`), verify:

```text
GET /api/runtime/connectivity  → gasReachable: true
```

Login `admin` / `1234` → `/inbox/TASK-mpwr16qj-CNBT?step=TCL-mpwr1eup-48KU`

Complete `CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md` rows UAT-01..15.

---

## Before vs after

| Symptom | Before | After (verified) |
|---------|--------|------------------|
| Browser `fetch` to Worker | `Failed to fetch` | Same-origin `/api/*` via Vite proxy **PASS** |
| CORS port 5174+ | Blocked | **PASS** (dynamic localhost origin) |
| `isWorkerConnected` with empty env | false (mock) | true in dev with task runtime mode |

---

## Known warnings

- Full browser checklist UAT not executed in this phase.
- Use `localhost` (not `127.0.0.1`) for Vite URL when testing proxy (Vite binds `localhost`).
- Do not promote `PHASE_CHECKLIST_RUNTIME_LOCK` until browser UAT passes.
