# PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT — Handoff

## Verdict

**GO_WITH_WARNINGS**

Trace instrumentation is in place; bottleneck analysis complete. Live GAS timing validation pending deploy.

## What was done

- Added performance trace modules: FE, Worker, GAS (append-only, no business logic change).
- Wired traceId propagation `X-CBV-Trace-Id` FE → Worker → GAS body `traceId`.
- Action executor counts requests/refreshes per operator click.
- Static audit suite `runWorkInboxRuntimePerformanceAuditChecks()` (16 checks).
- Report with benchmark table (static estimates) and ranked fix list.

## What was NOT done (by design)

- No optimization / caching of find-row.
- No TASK_MAIN schema change.
- No layout or operational feature changes.
- No live benchmark against production GAS (needs clasp push + deploy).

## Key finding

**"Google Sheet runtime phản hồi chậm"** is triggered by Worker abort (`googleSheetTaskDbAdapter.ts` 5–8s) when GAS chain exceeds threshold. Root cause is **full TASK_MAIN scan on every mutation** + **full snapshot reload** + **multi-request fan-out** (4–6 calls per Start/Pause/Handoff).

## Files touched

### New
- `apps/workboard/src/modules/task/inbox/performance/workInboxPerformanceTrace.ts`
- `apps/workboard/src/modules/task/inbox/performance/workInboxPerformanceAuditChecks.ts`
- `workers/api/src/modules/workInboxPerformanceTrace.ts`
- `gas-runtime-api/workInboxPerformanceTrace.js`
- `00_SYSTEM_BRAIN/000_PROMPTS/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_HANDOFF.md`
- `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_TEST_EVIDENCE.md`

### Modified
- `apps/workboard/src/modules/task/inbox/actionRuntime/workInboxActionExecutor.ts`
- `apps/workboard/src/api/client.ts`
- `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalApi.ts`
- `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalService.ts`
- `workers/api/src/adapters/googleSheetTaskDbAdapter.ts`
- `workers/api/src/modules/workInboxOperational.ts`
- `gas-runtime-api/taskDbApi.js`
- `gas-runtime-api/taskDbService.js`
- `gas-runtime-api/taskDbAudit.js`

## Next phase (recommended)

**PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0** — implement P0 fixes from report:

1. Task row index cache / avoid full `taskDbFindMainRow_` scan
2. Selective FE refresh (no full snapshot on every action)
3. Combined GAS action for mutation + timeline + audit

## Manual benchmark checklist

After GAS deploy, for each action capture from DevTools Network + `sessionStorage` key `cbv_work_inbox_perf_traces`:

- [ ] Load Inbox
- [ ] Open Focus Task
- [ ] Start Processing
- [ ] Pause
- [ ] Handoff
- [ ] Save Note
- [ ] Create Appointment
- [ ] Navigate Next
- [ ] Navigate Previous

Record: total ms, request count, `performanceTrace.sheetReadCount`, `sheetWriteCount`, status, bottleneck layer.

## RCLA compliance

- Context via `WorkInboxRuntimeContextProvider` / registry — unchanged.
- No new action routes outside existing registry.
- `003_RUNTIME_STATE.md` remains NOT_WIRED per v1.1 addendum.

## Base commit

`a3e088b42f5c1141b3a220132377b308b8c5b01c` (changes uncommitted)
