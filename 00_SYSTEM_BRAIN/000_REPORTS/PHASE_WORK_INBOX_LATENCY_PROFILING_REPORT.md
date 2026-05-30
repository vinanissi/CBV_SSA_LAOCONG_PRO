# PHASE_WORK_INBOX_LATENCY_PROFILING — Report

**Phase:** WORK_INBOX_LATENCY_PROFILING  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Commit (base, uncommitted work on):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`  
**RCLA:** CBV-RCLA v1.1 — profiling via existing runtime context (no bypass)

---

## 1. Summary

Extended the existing Work Inbox performance trace pipeline (FE → Worker → GAS) with a **latency profiling envelope** that breaks down operator actions by layer. Instrumentation is **append-only** — no workflow, schema, or layout changes.

**Observed operator pain (pre-phase):** `record-action` ≈ 5–7s, `operational` ≈ 3–4s.

**This phase delivers:** timed phases for mutation, timeline append, audit append, operational bundle aggregation, Worker validation/gas/response, and FE ingest into `sessionStorage` for manual benchmark capture post-deploy.

**Live action table:** pending GAS deploy + manual checklist (see §7). Structural instrumentation validates all probe points.

---

## 2. Files changed

| Layer | File | Change |
|-------|------|--------|
| FE types | `apps/workboard/.../workInboxLatencyProfileTypes.ts` | Full latency envelope types |
| FE profile | `apps/workboard/.../workInboxLatencyProfile.ts` | Ingest, table builder, bottleneck ranker |
| FE checks | `apps/workboard/.../workInboxLatencyProfilingChecks.ts` | `runWorkInboxLatencyProfilingChecks()` |
| FE wiring | `workInboxActionExecutor.ts` | Ingest on action finish |
| FE wiring | `workInboxOperationalBundleLoader.ts` | Ingest on bundle fetch |
| FE wiring | `WorkInboxGroupsPanel.tsx` | SEARCH_OPEN local timing |
| Worker | `workers/api/.../workInboxPerformanceTrace.ts` | Worker/gas/sheet breakdown + `markWorkerValidationEnd` |
| Worker | `workInboxCombinedAction.ts` | Validation timing before GAS |
| Worker | `workInboxOperational.ts` | Validation timing before GAS |
| GAS | `gas-runtime-api/workInboxPerformanceTrace.js` | Phase markers, gas/sheet breakdown, latency classification |
| GAS | `gas-runtime-api/workInboxCombinedAction.js` | `mutationMs`, `timelineAppendMs`, `auditAppendMs` |
| GAS | `gas-runtime-api/workInboxOperationalService.js` | Bundle sub-phase timings |

---

## 3. Trace implementation

```
Operator action (RCLA context)
  → FE startWorkInboxTrace + ingestWorkInboxLatencyTrace
  → X-CBV-Trace-Id → Worker beginWorkerPerf
       validationMs | gasCallMs | responseBuildMs
  → GAS wiPerfBegin_ → wiPerfMarkPhase_ / wiPerfRunTimed_
       mutationMs | timelineAppendMs | auditAppendMs | bundle*Ms
  → performanceTrace on API envelope → FE sessionStorage
       key: cbv_work_inbox_latency_traces
```

Classification thresholds (this phase):

| Class | ms |
|-------|-----|
| FAST | < 1000 |
| ACCEPTABLE | 1000–3000 |
| WARNING | 3000–5000 |
| DEGRADED | 5000–10000 |
| FAIL | > 10000 |

---

## 4. Worker timing table (instrumented fields)

| Route | Action key | Fields measured |
|-------|------------|-----------------|
| `POST /api/work-inbox/record-action` | WI_OP_RECORD_ACTION | validationMs, routeMs, gasCallMs, responseBuildMs |
| `GET .../operational` | LOAD_OPERATIONAL_BUNDLE | same |
| `POST timeline/audit` | APPEND_* | same (existing) |

*Live ms values: capture after deploy via `performanceTrace.worker` on API response or DevTools Network timing.*

---

## 5. GAS timing table (instrumented fields)

| Handler | Phase keys |
|---------|------------|
| `wiOpRecordAction_` | mutationMs, timelineAppendMs, auditAppendMs |
| `wiOpGetTaskOperational_` | bundleTimelineMs, bundleNotesMs, bundleAppointmentsMs, bundleDocumentsMs, bundleAuditsMs |
| All via `wiPerfToEnvelope_` | gas.readMs, gas.writeMs, sheet.rowsScanned, sheetReadCount, sheetWriteCount |

---

## 6. Sheet timing table (instrumented fields)

| Signal | Source |
|--------|--------|
| openSpreadsheetMs, getSheetMs | `WI_PERF_REQ_` / phases (extensible via row index flush) |
| taskLookupMs | phases.taskLookupMs + row index merge |
| readRows / writeRows / rowsScanned | wiPerfAddSheetRead_ / wiPerfAddSheetWrite_ counters |

---

## 7. Operational endpoint breakdown

`wiOpGetTaskOperational_` now times each aggregation leg independently:

1. **bundleTimelineMs** — timeline preview scan  
2. **bundleAppointmentsMs** — appointments list  
3. **bundleNotesMs** — notes (limit 10)  
4. **bundleDocumentsMs** — documents preview  
5. **bundleAuditsMs** — audit log read from OP_STORE  

**Hypothesis (validate live):** 3–4s operational latency is dominated by **multiple full-sheet scans** in legs 1–5, not Worker overhead.

---

## 8. Action timing table (live — pending deploy)

| Action | Total | FE | Worker | GAS | Sheet | Timeline | Audit | Requests | Status |
|--------|-------|-----|--------|-----|-------|----------|-------|----------|--------|
| *Awaiting live capture* | — | — | — | — | — | — | — | — | — |

**Manual capture:** run checklist in handoff; read `sessionStorage.cbv_work_inbox_latency_traces` or Network → response `performanceTrace`.

**Reference (prior audit path analysis, not this phase's live measurement):**

| Start Processing | 4000–12000 | 100–300 | 400–1200 | 3000–9000 | 2000–6000 | 200–800 | 200–800 | 1–2 | DEGRADED |

---

## 9. Bottleneck ranking

From **instrumentation placement + prior audit path analysis** (live averages replace after deploy):

| Rank | Layer | Finding | Evidence |
|------|-------|---------|----------|
| **P0** | GAS / Sheet | Task row lookup + TASK_MAIN reads on mutation | `mutationMs` + `taskDbFindMainRow_` path (audit) |
| **P0** | GAS / Timeline | Timeline append after mutation | `timelineAppendMs` probe on combined action |
| **P1** | GAS / Bundle | Operational bundle multi-sheet aggregation | `bundleTimelineMs` + siblings sum ≈ operational total |
| **P1** | GAS / Audit | Audit append on every action | `auditAppendMs` probe |
| **P2** | Worker | Proxy + JSON serialize | `worker.gasCallMs` vs `worker.totalMs` delta |
| **P2** | FE | Prepare + refresh | `fe.prepareMs` + `fe.refreshMs` (typically < 300ms) |

---

## 10. Recommended fixes (next phase — NOT implemented here)

1. **P0:** Cache task row index across mutation + timeline + audit in single GAS invocation (P0 row index already partial).  
2. **P0:** Reduce TASK_MAIN re-reads inside `taskDbUpdateTaskStatus_` / find-after-write.  
3. **P1:** Operational bundle — dedicated indexed reads or bounded range instead of full OP_STORE scan per entity type.  
4. **P1:** Coalesce timeline + audit header reads (shared sheet handle).  
5. **P2:** FE — defer non-critical render until bundle patch applied.

---

## 11. Pilot impact

- Operators still see 5–7s actions until optimization phase.  
- DevTools / sessionStorage now expose **which layer** dominates per action.  
- Pilot can proceed with **latency warnings** and structured capture checklist.

---

## 12. Test results

```
runWorkInboxLatencyProfilingChecks()
Status: GO_WITH_WARNINGS
Passed: 18/18
Build: npm run build — PASS
```

Checks: LATENCY_TRACE_EXISTS, LATENCY_FE_BREAKDOWN, LATENCY_WORKER_BREAKDOWN, LATENCY_GAS_BREAKDOWN, LATENCY_SHEET_BREAKDOWN, LATENCY_RECORD_ACTION_PROFILED, LATENCY_OPERATIONAL_PROFILED, LATENCY_TIMELINE_PROFILED, LATENCY_AUDIT_PROFILED, LATENCY_BOTTLENECK_IDENTIFIED, LATENCY_REPORT_GENERATED, LATENCY_NO_BUSINESS_LOGIC_CHANGE, LATENCY_NO_LAYOUT_CHANGE, LATENCY_BUILD_PASS, LATENCY_RCLA_CONTEXT, LATENCY_TARGET_ACTIONS, LATENCY_CLASSIFICATION, LATENCY_FE_INGEST_WIRED.

---

## 13. Commit hash

`a3e088b42f5c1141b3a220132377b308b8c5b01c` (work uncommitted at report time)
