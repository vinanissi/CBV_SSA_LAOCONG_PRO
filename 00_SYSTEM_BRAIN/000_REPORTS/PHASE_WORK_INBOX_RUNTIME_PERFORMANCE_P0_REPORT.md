# PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0 — Report

**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Base commit (uncommitted):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`

---

## 1. Summary

Implemented all three P0 fixes from the Performance Audit to reduce Work Inbox action latency before pilot:

| Fix | Status |
|-----|--------|
| P0-1 TASK_MAIN row index cache | DONE |
| P0-2 Selective FE refresh | DONE |
| P0-3 Combined GAS action `wiOpRecordAction` | DONE |

No UI redesign, no TASK_MAIN schema change, no business workflow change. Legacy endpoints preserved as fallback.

---

## 2. Files changed

### New
- `gas-runtime-api/taskDbRowIndex.js`
- `gas-runtime-api/workInboxCombinedAction.js`
- `workers/api/src/contracts/workInboxCombinedAction.ts`
- `workers/api/src/modules/workInboxCombinedAction.ts`
- `apps/workboard/src/modules/task/inbox/performance/workInboxRefreshPolicy.ts`
- `apps/workboard/src/modules/task/inbox/actionRuntime/workInboxCombinedActionClient.ts`
- `apps/workboard/src/modules/task/inbox/performance/workInboxRuntimePerformanceP0Checks.ts`

### Modified
- `gas-runtime-api/taskDbService.js` — fast find routing, skip second row scan on mutation
- `gas-runtime-api/taskDbConfig.js`, `workInboxOperationalConfig.js` — register `wiOpRecordAction`
- `gas-runtime-api/workInboxOperationalService.js` — dispatch combined action
- `gas-runtime-api/workInboxPerformanceTrace.js` — row index + combined trace fields
- `workers/api/src/router.ts` — `POST /api/work-inbox/record-action`
- `apps/workboard/.../workInboxActionExecutor.ts` — combined-first + selective refresh
- `apps/workboard/.../useWorkInboxActionRuntime.ts`, `WorkInboxFocusActionHost.tsx`, `WorkInboxGroupsPanel.tsx`
- `apps/workboard/.../workInboxPerformanceTrace.ts`, `workInboxActionTypes.ts`

---

## 3. P0-1 — Row index cache

- **Cache:** Apps Script `CacheService` + per-request in-memory map keyed by spreadsheet ID + cache generation.
- **Functions:** `taskDbBuildTaskRowIndex_`, `taskDbGetTaskRowByIdFast_`, `taskDbInvalidateTaskRowIndex_`, `taskDbFindMainRowFast_`.
- **Routing:** `taskDbFindMainRow_` → fast path; miss/stale ID → full scan + rebuild.
- **Mutation optimization:** Removed redundant second `taskDbFindMainRow_` after status/assign patch (reuse patched record).
- **Trace:** `rowIndexCacheHit`, `rowIndexCacheMiss`, `rowIndexFallbackScan`, `rowsScanned` merged into `performanceTrace`.

---

## 4. P0-2 — Selective FE refresh

- **`WorkInboxRefreshPolicy`:** `SELECTIVE`, `SNAPSHOT`, `BUNDLE_ONLY`, `NONE`.
- **Default after Start/Pause/Handoff/Complete:** `BUNDLE_ONLY` — patch local task + refresh operational bundle only.
- **Navigation / call / message:** `NONE` — no snapshot, no bundle.
- **Full snapshot:** only via explicit `onSnapshotRefresh` (manual refresh, filter change, hard recovery).
- **Removed:** `onRefresh` → full `loadWorkspace` after every focus action.

---

## 5. P0-3 — Combined action

- **GAS:** `wiOpRecordAction` — mutation + timeline + audit in one POST.
- **Worker:** `POST /api/work-inbox/record-action` → GAS `wiOpRecordAction`.
- **FE:** `recordWorkInboxCombinedAction()` preferred; legacy multi-request path if combined unavailable.
- **Supported:** START_PROCESSING, PAUSE_TASK, HANDOFF_TASK, COMPLETE_TASK, SAVE_NOTE, CREATE_APPOINTMENT.
- **Response:** `taskPatch`, `timelineEvent`, `auditEvent`, `refreshPolicy`, `combinedActionUsed`.

---

## 6. Before/after request fan-out

| Action | Before (est.) | After combined (est.) | After fallback (est.) |
|--------|---------------|------------------------|-------------------------|
| Start Processing | 4–6 requests + snapshot | **1** request | 3 requests, no snapshot |
| Pause | 4–7 requests + snapshot | **1** request | 3–4 requests, no snapshot |
| Handoff | 4–6 requests + snapshot | **1** request | 3 requests, no snapshot |
| Save Note | 2–4 requests | **1** request | 1–2 requests, bundle only |
| Navigate | 1 request | 1 request | unchanged |

---

## 7. Trace fields added

`rowIndexCacheHit`, `rowIndexCacheMiss`, `rowIndexFallbackScan`, `rowsScanned`, `refreshPolicy`, `snapshotRefreshSkipped`, `bundleRefreshTriggered`, `combinedActionUsed`, `fallbackEndpointUsed`, `requestCountBefore`, `requestCountAfter`.

Phase tag: `WORK_INBOX_RUNTIME_PERFORMANCE_P0`.

---

## 8. Test result table

| Check | Result |
|-------|--------|
| `runWorkInboxRuntimePerformanceP0Checks()` | 21/21 PASS (after report) |
| `npm run build` | PASS |
| Live GAS benchmark | NOT RUN — requires clasp deploy |

---

## 9. Risk impact for pilot

| Area | Before | After |
|------|--------|-------|
| Action latency | HIGH risk | **MEDIUM** — combined + cache should cut 50–70% wall time |
| Stale inbox counts after handoff | Low | Low — local patch updates active task; group counts may lag until manual refresh |
| Cache correctness | N/A | Low — stale row verified by ID read; fallback scan on mismatch |

**Pilot readiness:** Improved — deploy GAS + Worker before measuring live.

---

## 10. Manual benchmark checklist

After deploy, for each action record: total ms, request count, `combinedActionUsed`, `rowIndexCacheHit`, `rowsScanned`, `refreshPolicy`, `snapshotRefreshSkipped`, status.

| Action | Before Requests | After Requests | Total ms | Cache Hit | Rows Scanned | Refresh Policy | Combined Used | Status |
|--------|-----------------|----------------|----------|-----------|--------------|----------------|---------------|--------|
| Start Processing | 4–6 | 1 (target) | TBD | TBD | 1–2 (target) | BUNDLE_ONLY | true | pending deploy |
| Pause | 4–7 | 1 | TBD | TBD | 1–2 | BUNDLE_ONLY | true | pending deploy |
| Handoff | 4–6 | 1 | TBD | TBD | 1–2 | BUNDLE_ONLY | true | pending deploy |
| Save Note | 2–4 | 1 | TBD | TBD | 1+ | BUNDLE_ONLY | true | pending deploy |
| Create Appointment | 3–5 | 1 | TBD | TBD | 1+ | BUNDLE_ONLY | true | pending deploy |
| Navigate Next | 1 | 1 | TBD | — | 0 | NONE | false | pending deploy |
| Navigate Previous | 1 | 1 | TBD | — | 0 | NONE | false | pending deploy |

---

## 11. Known warnings

- Live GAS timing not validated until `clasp push` + Web App redeploy.
- Row index CacheService may be empty on first cold start (one build scan, then hits).
- Combined action falls back to legacy fan-out if route not deployed (404/UNKNOWN_ACTION).
- Group KPI counts may not update until manual snapshot refresh after handoff (by design P0-2).

---

## 12. Commit hash

Working tree **not committed**. Base: `a3e088b42f5c1141b3a220132377b308b8c5b01c`.
