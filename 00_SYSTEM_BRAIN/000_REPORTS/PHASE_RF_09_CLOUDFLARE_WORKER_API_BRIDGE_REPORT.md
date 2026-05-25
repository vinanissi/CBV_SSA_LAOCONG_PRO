# PHASE_RF_09 — Cloudflare Worker API Bridge — Report

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase name** | PHASE_RF_09_CLOUDFLARE_WORKER_API_BRIDGE |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Baselines** | RF_07 runtime lock v1, RF_08 local FE workboard |
| **Date** | 2026-05-25 |

---

## Summary

Established Cloudflare Worker API bridge at `workers/api/` with read-first projection endpoints, ApiEnvelope contract, auth stub (`x-cbv-role`), Worker-side permission filtering, CORS for local FE, and GAS/AppSheet adapter skeletons. Updated `apps/workboard` API client to call Worker endpoints with mock fallback.

---

## Architecture

```
Sheet/AppSheet → GAS (locked) → [gasAdapter skeleton] → Worker (:8787) → React FE (:5173)
```

RF_09 primary data: `mockData` projection aligned with RF_08 contracts.

---

## Files created

### workers/api/

| Area | Path |
|------|------|
| Entry | `src/index.ts`, `src/router.ts` |
| Contracts | `src/contracts.ts`, `src/utils/envelope.ts` |
| Auth | `src/auth/userContext.ts`, `src/auth/me.ts` |
| Modules | `src/modules/workboard.ts`, `tasks.ts`, `finance.ts`, `hoso.ts`, `coordination.ts`, `observation.ts`, `plugins.ts`, `search.ts` |
| Adapters | `src/adapters/mockData.ts`, `gasAdapter.ts`, `appSheetAdapter.ts` |
| Config | `package.json`, `wrangler.toml`, `tsconfig.json`, `.dev.vars.example`, `README.md` |

### 00_SYSTEM_BRAIN/

Prompt, report, handoff, test evidence for RF_09.

---

## Files modified

| File | Change |
|------|--------|
| `apps/workboard/src/api/client.ts` | Worker endpoints `/api/me`, `/api/today`, fallback + `x-cbv-role` |
| `apps/workboard/.env.example` | Default Worker URL + optional role |
| `apps/workboard/src/vite-env.d.ts` | `VITE_CBV_ROLE` |

---

## Endpoints implemented

| Path | Handler |
|------|---------|
| `GET /api/health` | Service health + adapter status |
| `GET /api/me` | User context stub |
| `GET /api/today` | Today summary |
| `GET /api/tasks`, `/api/tasks/:id` | Task list/detail |
| `GET /api/finance`, `/api/finance/alerts` | Finance read |
| `GET /api/hoso`, `/api/hoso/alerts` | HoSo read |
| `GET /api/coordination` + sub-routes | Coordination projection |
| `GET /api/observation` + sub-routes | Observation projection |
| `GET /api/plugins`, `/api/plugins/:id` | Plugin descriptors |
| `GET /api/search?q=` | Unified search |
| POST/PUT/PATCH/DELETE | 405 writes locked |

---

## Validation

| Check | Result |
|-------|--------|
| Worker `npm run typecheck` | PASS |
| Worker smoke (8 endpoints) | PASS — all ApiEnvelope, HTTP 200 |
| Role filter STAFF → `/api/finance` | PASS — HTTP 403 |
| FE `npm run typecheck` | PASS |
| FE `npm run build` | PASS |

---

## Acceptance checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Correct branch | PASS |
| 2 | `workers/api` exists | PASS |
| 3 | ApiEnvelope on all routes | PASS |
| 4 | Auth stub + role header | PASS |
| 5 | Worker permission filter | PASS |
| 6 | Writes locked | PASS |
| 7 | FE uses `VITE_CBV_API_BASE_URL` | PASS |
| 8 | No Sheet from FE | PASS |
| 9 | No secrets committed | PASS |
| 10 | README + SYSTEM_BRAIN | PASS |
| 11 | GAS runtime unchanged | PASS |

---

## Warnings

- mockData only — GAS/AppSheet adapters skeleton
- Auth stub only (LOCAL_STUB)
- No automated test suite
- No Cloudflare deploy executed
- npm audit warnings in worker devDependencies (non-blocking)

---

## Verdict

**GO_WITH_WARNINGS**

---

## Next recommended phase

**PHASE_RF_10_LOCAL_RUNTIME_INTEGRATION_UAT** — Worker + FE together, role switching, operator PC workflow, deploy prep.
