# ADR — Task Runtime Source of Truth

- **ID**: ADR_TASK_RUNTIME_SOURCE_OF_TRUTH
- **Date**: 2026-05-30
- **Status**: **DRAFT — PROPOSED** (audit evidence sufficient; not yet ratified by operator sign-off)
- **Context phase**: `PHASE_UI_RUNTIME_TRACE_AUDIT`
- **Related**: `PHASE_UI_DB_DESIGN_AUDIT_REPORT.md`, `PHASE_TASK_GS_01`, `PHASE_TASK_PERMISSION_AUDIT_REPORT`, `ADR_TASK_PERMISSION_MODEL.md`

---

## Context

Operator UI (`apps/workboard`) and backend expose **two parallel task runtimes**:

| Path | Sheet(s) | Timeline log | Used when |
|------|----------|--------------|-----------|
| **TASK_GS_01** (`taskDb*`) | `TASK_MAIN` read/write | `TASK_UPDATE_LOG` append | `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db` + Worker task-db routes |
| **RF_12** (`gas-runtime-api` legacy) | `TASKS` read/write | `TASK_TIMELINE` append | RF_12 POST actions when task-db router not matched; bootstrap in `gas-runtime-api/Config.js` |

`HOME_ALERT` is populated by GAS (`80_HOME_ALERT_RUNTIME.js`) from `TASK_MAIN`, finance, logs — and surfaced in UI via `/api/today` projection (currently **mock** on Worker) plus inbox snapshot labels.

UI Focus Mode and list quick actions target **TASK_GS_01** API when Worker connected; they do **not** write `HOME_ALERT` or RF_12 `TASKS`.

---

## Decision (proposed)

1. **`TASK_MAIN` = canonical task state runtime** for WebApp/Worker operator writes and reads in production.
2. **`TASKS` = legacy RF_12** — read-only for migration audit; no new operator UI writes after GS_01 cutover.
3. **`TASK_UPDATE_LOG` = canonical append-only task timeline** for WebApp task detail and GS_01 writes.
4. **`TASK_TIMELINE` = legacy RF_12 append log** — do not merge into UI until RF_12 path retired.
5. **`HOME_ALERT` = projection / alert queue** — derived from business sources; **not** primary task mutation target for Work Inbox list actions. Alert claim/resolve via dedicated GAS (`HomeAlert_claimAlert`, `HomeAlert_resolveOperational`) when exposed in UI.

---

## Evidence (audit 2026-05-30)

- GS_01: `taskDbService.js` — `taskDbUpdateTaskStatus_`, `taskDbCompleteTask_`, `taskDbAssignTask_` patch `TASK_MAIN` + `taskDbAppendUpdateLog_` → `TASK_UPDATE_LOG` + optional `CBV_AUDIT_LOG`.
- Worker: `router.ts` POST `/api/tasks/:id/{status|assign|comments|complete}` → `handleTaskDb*` when `isTaskDbRuntimeMode(env)`.
- RF_12: `Code.js` POST `create_task` / `update_task` → `Tasks.js` → `TASKS` + `appendTimeline_` → `TASK_TIMELINE` + `API_AUDIT_LOG`.
- UI: `useInlineExecution.ts` → `api.updateTaskStatus` / `completeTask` / `assignTask` — no HOME_ALERT endpoints.
- HOME_ALERT GAS exists (`HomeAlert_claimAlert`, `HomeAlert_resolveAlert`) — **no Worker route** wired to workboard FE today.

---

## Consequences

**Positive**

- Single operator mental model: inbox actions mutate one task table.
- Aligns with TASK_MAIN PRO baseline (`SHARED_WITH`, `IS_PRIVATE`).
- Append-only audit trail in `TASK_UPDATE_LOG`.

**Negative / migration work**

- Must stop RF_12 writes to `TASKS` in production Worker config.
- Historical rows in `TASK_TIMELINE` remain separate until ETL or read-only viewer.
- HOME_ALERT actions need new Worker routes before operator can claim/resolve alerts from React UI.

---

## Alternatives considered

| Alt | Verdict |
|-----|---------|
| Keep dual write (TASK_MAIN + TASKS) | ❌ CRITICAL data divergence |
| Use HOME_ALERT as primary task store | ❌ Projection-only by design (Phase 80A) |
| Merge TASK_TIMELINE into UI alongside TASK_UPDATE_LOG | ⚠️ Accept only as read-only legacy viewer |

---

## Rollout (manual-first)

1. Feature flag: disable RF_12 POST fallback when task-db action registered.
2. Shadow-compare `TASKS` vs `TASK_MAIN` row counts (read-only report).
3. Wire HOME_ALERT operator actions as separate API phase (not task status POST).
4. Ratify ADR after one production write test on GS_01 path only.

---

*Draft — append-only. Do not delete `ADR_TASK_PERMISSION_MODEL.md`.*

---

## Ratification Note — PHASE_SECURITY_RUNTIME_FIX

**Date:** 2026-05-30  
**Phase:** `PHASE_SECURITY_RUNTIME_FIX`  
**Status update:** DRAFT retained for operator sign-off; **security implementation aligned with proposed decision**.

### What was ratified in code (Worker layer)

1. **TASK_MAIN remains canonical write target** when `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`.
2. **TASK_UPDATE_LOG** remains append-only audit path for GS_01 writes (unchanged GAS contract).
3. **TASKS / TASK_TIMELINE (RF_12)** — operator writes blocked at Worker router when task-db mode active; no silent fallback.
4. **HOME_ALERT** — unchanged; not used as task mutation target for inbox actions.
5. **Row-level visibility** — Worker enforces `IS_PRIVATE` / `SHARED_WITH` rules consistent with GAS `canUserSeeTask` before read/write responses.

### Evidence

- `workers/api/src/auth/taskPermissions.ts` — permission functions
- `workers/api/src/modules/taskGsDb.ts` — snapshot filter + write pre-checks
- `workers/api/src/router.ts` — legacy write guards
- Report: `PHASE_SECURITY_RUNTIME_FIX_REPORT.md`

### Outstanding before full ADR ratification

- Operator production sign-off after live 403/snapshot tests against deployed GAS.
- GAS snapshot should include privacy fields on list rows to close summary-row ambiguity.
- RF_12 read paths may remain for audit until explicit retirement phase.

### Next phase

`PHASE_FOCUS_RUNTIME_FIX` — UI/runtime wiring; security layer treated as baseline unless regression.

