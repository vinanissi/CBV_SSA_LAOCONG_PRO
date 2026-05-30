# PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT — Test Evidence

**Date:** 2026-05-30  
**Verdict:** GO_WITH_WARNINGS

## Static audit suite

**Command:**
```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxRuntimePerformanceAuditChecks } from './src/modules/task/inbox/performance/workInboxPerformanceAuditChecks.ts'; console.log(JSON.stringify(runWorkInboxRuntimePerformanceAuditChecks(), null, 2));"
```

**Expected:** 16/16 checks pass, status `GO` or `GO_WITH_WARNINGS` (warnings for live GAS not deployed).

### Checks covered

| ID | Description |
|----|-------------|
| PERF_RCLA_CONTEXT_LOADED | RCLA provider + registry |
| PERF_TRACE_ID_CREATED | FE trace per action |
| PERF_TRACE_ID_PROPAGATED_FE_TO_WORKER | X-CBV-Trace-Id header |
| PERF_TRACE_ID_PROPAGATED_WORKER_TO_GAS | traceId in GAS POST body |
| PERF_LAYER_TIMING_ENVELOPE | layerTimings schema |
| PERF_ACTION_REQUEST_COUNT_TRACKED | markApiStart/End |
| PERF_REFRESH_COUNT_TRACKED | incrementRefresh |
| PERF_SHEET_READ_COUNT_TRACKED | wiPerfAddSheetRead_ |
| PERF_SHEET_WRITE_COUNT_TRACKED | wiPerfAddSheetWrite_ |
| PERF_GETDATARANGE_SCAN_DETECTED | no getDataRange; batched getRange noted |
| PERF_WORKER_ROUTE_TIMING | beginWorkerPerf on work-inbox routes |
| PERF_GAS_ROUTE_TIMING | wiPerfBegin_/Finish in taskDbDoPost_ |
| PERF_SLOW_RUNTIME_WARNING | timeout message preserved |
| PERF_NO_BUSINESS_LOGIC_CHANGE | no new business actions |
| PERF_NO_DB_SCHEMA_CHANGE_REQUIRED | optional trace sheet only |
| PERF_REPORT_GENERATED | report artifact exists |

## Build

**Command:** `npm run build` in `apps/workboard`  
**Result:** PASS (tsc + vite build)

## Live benchmark

**Status:** NOT RUN  
**Reason:** GAS `workInboxPerformanceTrace.js` requires clasp push + Web App redeploy before live layer timings are returned.

## Manual verification (post-deploy)

1. Open Work Inbox Focus, trigger Start Processing.
2. DevTools → Network: confirm 4–6 requests share same `X-CBV-Trace-Id`.
3. Inspect response JSON for `performanceTrace` on `/api/work-inbox/*` routes.
4. `sessionStorage.getItem('cbv_work_inbox_perf_traces')` — verify envelope with `requestCount`, `refreshCount`, `status`.

## Slow warning reproduction path

Worker `callTaskDbGas` abort at 5000–8000ms → message `"Google Sheet runtime phản hồi chậm — thử lại sau"`. Reproduce with large TASK_MAIN + Start Processing action chain.
