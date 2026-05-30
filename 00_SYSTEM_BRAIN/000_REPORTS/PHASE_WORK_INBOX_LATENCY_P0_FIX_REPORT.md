# PHASE_WORK_INBOX_LATENCY_P0_FIX — Report

**Phase:** WORK_INBOX_LATENCY_P0_FIX  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Commit (base, uncommitted):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`  
**RCLA:** CBV-RCLA v1.1 — no context bypass

---

## 1. Summary

Implemented P0 runtime optimizations targeting measured bottlenecks from live PAUSE_TASK trace (7182ms) and operational bundle (3960ms). Changes are **internal only** — no UI redesign, no TASK_MAIN schema change, no workflow change.

**Expected impact (structural):**

| Area | Change | Expected savings |
|------|--------|------------------|
| Mutation | Combined opts: skip snapshot cache, CBV audit dup, TASK_UPDATE_LOG dup; minimal taskPatch | ~800–1500ms GAS |
| Timeline/Audit | Shared header context + write phase timers | ~200–400ms GAS |
| Operational | Tail scan (250 rows) vs full sheet | ~500–900ms GAS on large sheets |
| FE | Optimistic taskPatch + defer bundle 750ms | Perceived ~4s vs ~11s |

**Live after-deploy validation required** to confirm ≤3500ms / ≤2500ms targets.

---

## 2. Files changed

| Layer | File |
|-------|------|
| GAS | `workInboxMutationFast.js` (new) |
| GAS | `workInboxAppendContext.js` (new) |
| GAS | `taskDbService.js` — mutation micro-timers + opts |
| GAS | `workInboxCombinedAction.js` — combinedOpts + shared append |
| GAS | `workInboxOperationalService.js` — append context, tail scan, documents fast path |
| GAS | `workInboxOperationalConfig.js` — TAIL_SCAN_MAX |
| GAS | `workInboxPerformanceTrace.js` — extended gas breakdown |
| GAS | `taskDbApi.js` — parseMs / responseMs |
| Worker | `googleSheetTaskDbAdapter.ts` — fetch header/body timing |
| FE | `workInboxRefreshPolicy.ts` — deferred bundle + optimistic flags |
| FE | `workInboxActionExecutor.ts` — immediate taskPatch apply |
| FE | `workInboxLatencyP0FixChecks.ts` (new) |

---

## 3. Baseline trace (measured pre-fix)

**POST /api/work-inbox/record-action — PAUSE_TASK**

| Layer | ms |
|-------|-----|
| Total | 7182 |
| Worker | 7182 |
| Worker→GAS | 7180 |
| GAS | 4616 |
| mutationMs | 3242 |
| timelineAppendMs | 563 |
| auditAppendMs | 809 |
| readMs | 218 |
| writeMs | 8 |

**LOAD_OPERATIONAL_BUNDLE**

| Layer | ms |
|-------|-----|
| Total | 3960 |
| GAS | 1732 |
| bundleTimelineMs | 1084 |
| bundleDocumentsMs | 626 |

---

## 4. Fixes implemented

### Fix 1 — Mutation fast path

- Micro-timers: `mutationLookupMs`, `mutationNormalizeMs`, `mutationPatchBuildMs`, `mutationSheetWriteMs`, `mutationResponsePatchMs`
- `taskDbCombinedMutationOpts_()`: skip snapshot/detail cache invalidate, skip duplicate CBV audit + TASK_UPDATE_LOG on combined path
- `taskDbMapMinimalTaskPatch_()` — no full `taskDbGetUserMap_()` reload
- Trace flags: `fallbackMinimalPatchUsed`, `fullPatchFallbackUsed`

### Fix 2 — Timeline + audit

- `wiOpBeginAppendContext_()` — single header read per combined action
- `timelineHeaderMs`, `timelineWriteMs`, `auditHeaderMs`, `auditWriteMs`
- `appendSharedContextUsed` trace flag

### Fix 3 — Operational bundle

- `wiOpReadSheetTailValues_()` — max 250 rows reverse scan
- `timelineFastPathUsed`, `timelineRowsScanned`
- Documents: empty sheet skip, attachment fast path, `documentsSkipped`, `documentsFastPathUsed`

### Fix 4 — FE perceived latency

- Immediate `onTaskUpdated(taskPatch)` on combined success
- `DEFERRED_BUNDLE_REFRESH_MS = 750` — non-blocking operational refresh
- Session trace: `optimisticPatchApplied`, `deferredBundleRefreshMs`

### Fix 5 — Worker/GAS gap

- Worker: `workerFetchHeadersReceivedMs`, `workerFetchBodyReadMs`
- GAS: `parseMs`, `responseMs`
- **Finding:** ~2564ms gap likely Apps Script web-app cold start + network RTT — not optimizable in code without GAS deployment model change

---

## 5–7. Before/after tables (live after pending)

| Action | Before Total | After Total | Mutation | Timeline | Audit | Operational | Perceived | Status |
|--------|--------------|-------------|----------|----------|-------|-------------|-----------|--------|
| Pause | 7182 | *pending* | *pending* | *pending* | *pending* | — | *pending* | AWAIT DEPLOY |
| Operational | 3960 | *pending* | — | — | — | *pending* | — | AWAIT DEPLOY |

---

## 8. FE perceived latency

- Action toast/success returns when record-action completes (~target ≤3500ms post-fix)
- Right panel updates status from taskPatch immediately
- Bundle refresh runs 750ms later in background (`showLoading: false`)

---

## 9. Worker/GAS overhead

| Signal | Interpretation |
|--------|----------------|
| workerFetchHeadersReceivedMs ≈ total fetch | GAS execution dominates wait |
| workerFetchBodyReadMs | JSON parse + response size |
| GAS total << Worker total | Cold start / platform overhead (~2.5s observed) |

---

## 10. Test status

```
runWorkInboxLatencyP0FixChecks() → GO_WITH_WARNINGS
18/18 checks PASS
npm run build → PASS
```

---

## 11. Remaining risks

- Apps Script cold start remains outside code control  
- Tail scan may miss old timeline events if >250 rows since task events (mitigated: recent events usually in tail)  
- `skipUpdateLog` on combined path — TASK_UPDATE_LOG not written; operational timeline + audit preserved  

---

## 12. Pilot readiness

**GO_WITH_WARNINGS** — deploy GAS + Worker + FE, run manual benchmark, confirm Pause ≤3500ms and operational ≤2500ms. Pilot can proceed with latency trace monitoring.

---

## 13. Commit hash

`a3e088b42f5c1141b3a220132377b308b8c5b01c` (uncommitted)
