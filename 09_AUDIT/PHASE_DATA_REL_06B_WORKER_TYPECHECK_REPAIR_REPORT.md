# PHASE_DATA_REL_06B — Worker Typecheck Repair Report

**Result:** GO  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_06A_FINANCE_CHECK_REBASE`

---

## 1. Summary

Repaired **pre-existing** `workers/api` TypeScript compile failures (P0). No workbook, GAS, or frontend logic changes beyond types/imports required for compile.

---

## 2. Files changed

| File | Fix |
|------|-----|
| `workers/api/src/router.ts` | Removed duplicate `handleWorkInboxChecklistBridge` import from `workInboxChecklist`; bridge only from `workInboxChecklistBridge` |
| `workers/api/src/modules/workInboxPerformanceTrace.ts` | `envelopeWithRoutePerf` accepts/returns `ApiEnvelope<T>` + `performanceTrace`; `finishWorkerPerf` opts include `sheetReadCount` / `sheetWriteCount` |
| `workers/api/src/modules/workInboxCreateTask.ts` | Removed invalid `result.warnings` on GAS error branch (`TaskDbCallResult` failure has no `warnings`) |
| `workers/api/src/auth/workInboxCreatePermissions.ts` | Removed unused `role` in `enforceCreateOwnerForUser` |
| `workers/api/src/modules/workInboxCombinedAction.ts` | Renamed unused `user` → `_user` in memory fallback |

**Not changed:** `workInboxOperational.ts` (fixed via `envelopeWithRoutePerf` signature only).

---

## 3. Findings fixed

| Error | Resolution |
|-------|------------|
| `TS2300` duplicate `handleWorkInboxChecklistBridge` | Single import from `./modules/workInboxChecklistBridge` |
| `TS2724` missing export on checklist module | Removed erroneous import |
| `TS2345` `ApiEnvelope` not assignable to index-signature envelope | `envelopeWithRoutePerf<T>(…, envelope: ApiEnvelope<T>)` |
| `TS2352` cast to `ApiEnvelope` in router | Satisfied by correct return type from perf wrapper |
| `TS2339` `warnings` on failure `TaskDbCallResult` | Omit warnings on error `createEnvelope` |
| `TS6133` unused `role` / `user` | Remove / prefix `_` |
| `TS2339` `sheetReadCount` on finish opts | Extended `finishWorkerPerf` options type |
| `TS6133` unused generic `T` | Resolved with typed `envelopeWithRoutePerf<T>` |

---

## 4. Findings deferred

| Finding | Notes |
|---------|--------|
| Workbook user/finance/HO_SO migration | Unrelated to compile; phases 02–04 plans |
| `workers/api` router still uses `as ApiEnvelope<unknown>` casts | Pre-existing pattern; compile-clean without broad router refactor |
| GAS clasp tests | Not in CI for this phase |

---

## 5. Tests run

```bash
cd workers/api && npm run typecheck && npm run test:permissions
cd apps/workboard && npm run typecheck
```

| Command | Result |
|---------|--------|
| `workers/api` `npm run typecheck` | **Pass** |
| `workers/api` `npm run test:permissions` | **Pass** (`taskPermissions smoke: PASS`) |
| `apps/workboard` `npm run typecheck` | **Pass** |

---

## 6. Risks / rollback

| Risk | Mitigation |
|------|------------|
| Runtime JSON shape change | `performanceTrace` still appended; `ApiEnvelope` fields unchanged |

**Rollback:** Revert commit on listed Worker files.

---

## 7. Next recommended phase

**PHASE_DATA_REL_06C — Current-State Closeout Re-Audit** (run all phase scripts + consolidated report).

---

## 8. Workbook statement

**No workbook / production DB mutation** in this phase.
