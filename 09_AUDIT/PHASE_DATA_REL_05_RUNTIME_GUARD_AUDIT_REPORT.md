# PHASE_DATA_REL_05 — Runtime Guard Audit Report

**Result:** GO_WITH_WARNINGS (GAS guards + static checks GO; Worker typecheck pre-existing failures)  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_04_HO_SO_RELATION_AUTHORITY` (DECISION_LOCKED)

---

## 1. Summary

Audited GAS write paths for task, checklist, finance, and HO_SO relation. **Task create/update/assign** already used `assertActiveUserId` / `assertActiveDonViId`. This phase added **narrow guards** on finance `DON_VI_ID`, finance log parent `FIN_ID`, finance `CONFIRMED_BY`, checklist `DONE_BY`, and HO_SO `createHoSoRelation` polymorphic refs. **No workbook migration.** Worker RF_12 / local mock paths documented as out of scope.

---

## 2. Write-path audit (before → after)

| Path | File | Guard (before) | Guard (after) |
|------|------|----------------|---------------|
| `createTask` | `20_TASK_SERVICE.js` | `assertActiveUserId` OWNER/REPORTER; `assertActiveDonViId` | Unchanged |
| `updateTask` / `assignTask` | `20_TASK_SERVICE.js` | Same on patch fields | Unchanged |
| `_addTaskUpdateLog` | `20_TASK_SERVICE.js` | None on ACTOR_ID (email/system OK) | **Unchanged** (by design) |
| `markChecklistDone` | `20_TASK_SERVICE.js` | None on DONE_BY | **`assertActiveUserId`** when mapped id non-empty |
| `createTransaction` | `30_FINANCE_SERVICE.js` | None on DON_VI_ID | **`financeAssertOptionalDonViId_`** |
| `updateDraftTransaction` | `30_FINANCE_SERVICE.js` | None on DON_VI patch | **`financeAssertOptionalDonViId_`** on patch |
| `logFinance` | `30_FINANCE_SERVICE.js` | None on FIN_ID parent | **`_findById` FINANCE_TRANSACTION** |
| `setFinanceStatus` → CONFIRMED | `30_FINANCE_SERVICE.js` | None on CONFIRMED_BY | **`financeAssertOptionalActiveUserId_`** when non-empty |
| `addHosoRelation` | `10_HOSO_SERVICE.js` | `hosoValidateRelationTarget` | Unchanged |
| `createHoSoRelation` | `10_HOSO_SERVICE.js` | Master FROM/TO only | **+ `hosoValidateRelationTarget`** if RELATED_* set; **+ `HO_SO_ID` master** |
| `createHoSoRelation` RELATED only | — | — | Satellite tables still need whitelist extension (PHASE 04 M-HO-3) |

### Out of scope (documented)

| Path | Reason |
|------|--------|
| `workers/api` `taskWriteStore` | Local RF_11 mock; not sheet authority |
| `gas-runtime-api/41_Tasks.js` RF_12 | Legacy sheet layout; separate from `TASK_MAIN` |
| `gas-runtime-api/40_TaskDbService.js` | Uses USER_CODE display layer; GAS `20_TASK_SERVICE` is PRO write authority |
| Historical sheet rows | Migration phases 02–04 |

---

## 3. Code changes

| File | Change |
|------|--------|
| `05_GAS_RUNTIME/30_FINANCE_SERVICE.js` | `financeAssertOptionalDonViId_`, `financeAssertOptionalActiveUserId_`; guards on create/update/log/confirm |
| `05_GAS_RUNTIME/20_TASK_SERVICE.js` | `markChecklistDone` → `assertActiveUserId` for DONE_BY |
| `05_GAS_RUNTIME/10_HOSO_SERVICE.js` | `createHoSoRelation` RELATED_* + `HO_SO_ID` context validation |
| `09_AUDIT/scripts/runtimeGuardPhase05Checks.mjs` | **NEW** static verification |
| `09_AUDIT/PHASE_DATA_REL_05_RUNTIME_GUARD_AUDIT_REPORT.md` | **NEW** this report |

---

## 4. Findings fixed

| Finding | Action |
|---------|--------|
| Finance could write invalid `DON_VI_ID` (e.g. `VP54`) | Block on create/update when non-empty |
| `logFinance` could append orphan `FIN_ID` | Parent row required |
| Checklist could set `DONE_BY` to unregistered id | Assert when internal id mapped |
| `createHoSoRelation` optional RELATED_* unchecked | Validate when both provided |
| `HO_SO_ID` context not verified on master–master create | Assert master exists |

---

## 5. Findings deferred

| Finding | Reason |
|---------|--------|
| `ACTOR_ID` / `system` / email in logs | PHASE 02 policy; needs `UD_SYSTEM` seed first |
| `IS_SYSTEM` user not assignable | No `IS_SYSTEM` column enforcement in `assertActiveUserId` yet |
| Finance audit in `96_TASK_SYSTEM_AUDIT_REPAIR` | Not extended; use dedicated finance audit later |
| Satellite `RELATED_TABLE` values | Requires `CBV_CONFIG.SHEETS` + whitelist (M-HO-3) |
| Worker/Workboard local user ids | Dev-only; GAS blocks prod writes |

---

## 6. Static inspection

```bash
node 09_AUDIT/scripts/runtimeGuardPhase05Checks.mjs
```

---

## 7. Tests run

| Command | Result |
|---------|--------|
| `node 09_AUDIT/scripts/runtimeGuardPhase05Checks.mjs` | **GO** (11/11) |
| `npm run typecheck` in `workers/api` | **Fail** — pre-existing errors in `router.ts`, `workInbox*` (unchanged by this phase) |
| `npm run typecheck` in `apps/workboard` | **Pass** (no TS changes) |
| GAS unit tests | Not run (no harness in CI for clasp) |

---

## 8. Risks / rollback

| Risk | Mitigation |
|------|------------|
| Confirm fails when user not in USER_DIRECTORY | CONFIRMED_BY only asserted when non-empty after email map |
| Checklist done fails without directory user | DONE_BY may remain empty if map returns null (unchanged) |
| Legacy finance rows with bad DON_VI_ID cannot be patched via API | Fix data via migration F1 (PHASE 03) then edit |

**Rollback:** Revert commit on `30_FINANCE_SERVICE.js`, `20_TASK_SERVICE.js`, `10_HOSO_SERVICE.js`.

---

## 9. Data-relationship program status

| Phase | Status |
|-------|--------|
| 01 Task key contract | GO_WITH_WARNINGS |
| 02 User reference plan | PLAN_ONLY |
| 03 Finance relation plan | PLAN_ONLY |
| 04 HO_SO relation authority | DECISION_LOCKED |
| 05 Runtime guards | **GO_WITH_WARNINGS** (this phase) |

**Next:** Execute workbook migrations (02–04 plans) with admin sign-off; optional `UD_SYSTEM` seed; extend finance/HO_SO audit functions.

---

## 10. Files changed (summary)

See §3. Registry: `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md`.
