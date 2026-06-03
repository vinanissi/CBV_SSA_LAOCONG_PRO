# Phase Report — CHECKLIST_WORKER_CONNECTIVITY_FIX

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |
| **RUNTIME_STATE** | NOT_WIRED |

---

## Objective

Restore browser connectivity for Checklist Runtime after `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` **FAIL** (`TypeError: Failed to fetch`, `Runtime TASK_MAIN chưa kết nối`).

---

## Root cause (confirmed)

| Issue | Impact |
|-------|--------|
| Cross-origin fetch `localhost:517x` → `localhost:8787` | CORS + Windows IPv6 (`localhost` vs `127.0.0.1`) → `Failed to fetch` |
| `CBV_ALLOWED_ORIGINS` only listed port **5173** | UAT on **5174/5175/5176** got wrong `Access-Control-Allow-Origin` |
| Wrong probe path `/health` in UAT | Worker exposes **`/api/health`** |
| `isWorkerConnected()` required non-empty `VITE_CBV_API_BASE_URL` | Empty base forced mock even when proxy could work |

Backend path (Web App POST, checklist list) was already **PASS** — failure was browser ↔ Worker only.

---

## Fixes applied (minimal)

1. **Vite dev proxy** — `/api` → `http://127.0.0.1:8787` (`apps/workboard/vite.config.ts`).
2. **`apiBase.ts`** — empty base in dev + `VITE_CBV_TASK_RUNTIME_MODE` ⇒ Worker configured (same-origin proxy).
3. **CORS** — reflect any `http://localhost:*` / `http://127.0.0.1:*` origin (`workers/api/src/cors.ts`).
4. **Wrangler / `.dev.vars.example`** — dual origins `localhost` + `127.0.0.1` on 5173.
5. **Diagnostics** — `GET /api/runtime/connectivity`.
6. **Dev contract** — `00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_WORKER_CONNECTIVITY_DEV.md`.
7. **`.env.example`** — document proxy-first local dev; prefer `127.0.0.1:8787` when direct.

---

## URLs tested

| Layer | URL |
|-------|-----|
| Worker | `http://127.0.0.1:8787` |
| Vite (session) | `http://localhost:5175` |
| GAS Web App | `https://script.google.com/macros/s/AKfycbxldVl0LeNYG5J4drQBCqwQRaYZxoZSC11vR6BtQun1ly2HAa_yefH_SHxg64f5kPA/exec` |

---

## Connectivity test summary

| # | Check | Result |
|---|--------|--------|
| 1 | Worker `/api/health` | PASS (`gasReachable: true`) |
| 2 | Worker `/api/runtime/connectivity` | PASS |
| 3 | OPTIONS preflight `Origin: http://localhost:5174` | PASS (204, Allow-Origin matches) |
| 4 | Vite proxy `localhost:5175/api/health` | PASS |
| 5 | Node fetch same-origin proxy | PASS |
| 6 | Node fetch direct Worker + CORS | PASS |
| 7 | Checklist list via Worker | PASS (2 items) |
| 8 | Task detail via Worker | WARN (one `GOOGLE_SHEET_TIMEOUT`) |
| 9 | Full browser operator UAT | **Not re-run** in this phase |

---

## Warnings & risks

- Operator must **restart Vite** after env changes; note dynamic port if 5173 busy.
- `.dev.vars` / `.env.local` are operator-local (not committed).
- Task read can still timeout under slow GAS — unrelated to fetch connectivity.
- Production Worker deploy not updated in this phase (dev-only fixes).

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun) on operator machine per `CHECKLIST_WORKER_CONNECTIVITY_DEV.md`.

---

## Files changed (source)

- `apps/workboard/src/api/apiBase.ts` (new)
- `apps/workboard/src/api/client.ts`
- `apps/workboard/vite.config.ts`
- `apps/workboard/.env.example`
- `apps/workboard/src/vite-env.d.ts`
- `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalApi.ts`
- `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalService.ts`
- `apps/workboard/src/modules/task/inbox/actionRuntime/workInboxCombinedActionClient.ts`
- `workers/api/src/cors.ts`
- `workers/api/wrangler.toml`
- `workers/api/.dev.vars.example`
- `workers/api/src/modules/workboard.ts`
- `workers/api/src/router.ts`
- `00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_WORKER_CONNECTIVITY_DEV.md`
