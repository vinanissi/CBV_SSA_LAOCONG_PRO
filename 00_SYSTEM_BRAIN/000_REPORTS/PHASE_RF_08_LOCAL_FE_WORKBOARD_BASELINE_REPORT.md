# PHASE_RF_08 — Local FE Workboard Baseline — Report

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase name** | PHASE_RF_08_LOCAL_FE_WORKBOARD_BASELINE |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Runtime lock** | `v2.4.1-RF-RUNTIME-LOCK-V1` (unchanged) |
| **Date** | 2026-05-25 |

---

## Summary

Established local React operational workboard at `apps/workboard/` — Vite + React + TypeScript + Tailwind, PC-first AppShell (nav / main queue / right detail / top bar / quick bar), eight routes with mock API aligned to runtime lock v1 contracts. No GAS/AppSheet changes. No direct Sheet access from browser. Write actions surfaced as “Chỉ xem trong phiên bản này”.

---

## Architecture

```
Google Sheet / AppSheet → GAS (locked legacy) → Worker (RF_09) → React Workboard
```

RF_08: FE + `mockApi` only when `VITE_CBV_API_BASE_URL` is unset.

---

## Files created

### apps/workboard/

| Area | Path |
|------|------|
| App shell | `src/app/App.tsx`, `routes.tsx`, `components/layout/*` |
| API | `src/api/contracts.ts`, `client.ts`, `mockApi.ts` |
| Modules | `src/modules/task|finance|hoso|coordination|observation|plugins/*` |
| UI / states | `src/components/ui/*`, `src/components/states/*` |
| Shared | `src/shared/constants`, `utils`, `types` |
| Config | `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `README.md` |

### 00_SYSTEM_BRAIN/

| File | Purpose |
|------|---------|
| `000_PROMPTS/PHASE_RF_08_LOCAL_FE_WORKBOARD_BASELINE_PROMPT.md` | Prompt archive |
| `000_REPORTS/PHASE_RF_08_LOCAL_FE_WORKBOARD_BASELINE_REPORT.md` | This report |
| `001_HANDOFF/PHASE_RF_08_LOCAL_FE_WORKBOARD_BASELINE_HANDOFF.md` | Handoff |
| `005_TEST_EVIDENCE/PHASE_RF_08_LOCAL_FE_WORKBOARD_BASELINE_TEST_EVIDENCE.md` | Build evidence |

---

## Files modified

**None** in GAS runtime. New `apps/` tree only.

---

## Build validation

| Check | Result |
|-------|--------|
| `npm install` | PASS (140 packages, 0 vulnerabilities) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS (`dist/` ~271 kB JS) |

---

## Routes implemented

| Route | Page |
|-------|------|
| `/` | Home / Today Workboard |
| `/tasks`, `/tasks/:taskId` | Task feed + detail panel |
| `/finance` | Finance (ACTIVE_READONLY) |
| `/hoso` | Hồ sơ (ACTIVE_READONLY) |
| `/coordination` | Queue, workload, unassigned |
| `/observation` | Status cards, alerts, sync/projection |
| `/plugins` | TASK ACTIVE, FINANCE/HO_SO ACTIVE_READONLY |
| `/search` | Global search (mockApi) |

---

## Acceptance checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Correct branch | PASS |
| 2 | `apps/workboard` exists | PASS |
| 3 | Vite/React/TS/Tailwind | PASS |
| 4 | `npm run build` | PASS |
| 5 | AppShell 3-zone + top/bottom bars | PASS |
| 6 | All 8 route areas | PASS |
| 7 | mockApi search | PASS |
| 8 | Loading/empty/error states | PASS |
| 9 | PermissionGate | PASS |
| 10 | Quick actions no write | PASS |
| 11 | No direct Google Sheet from FE | PASS |
| 12 | No secrets in code | PASS |
| 13 | README local dev | PASS |
| 14 | SYSTEM_BRAIN artifacts | PASS |
| 15 | GAS runtime unchanged | PASS |

---

## Warnings (non-blocking)

- API bridge not implemented — mockApi only
- No automated FE tests
- Mobile layout basic (PC-first by design)
- `package-lock.json` added under `apps/workboard`

---

## Verdict

**GO_WITH_WARNINGS**

Local FE baseline ready. Worker connection deferred to RF_09.

---

## Next recommended phase

**PHASE_RF_09_CLOUDFLARE_WORKER_API_BRIDGE** — Worker API, auth stub, projection endpoints, connect FE via `VITE_CBV_API_BASE_URL`, still no write actions.
