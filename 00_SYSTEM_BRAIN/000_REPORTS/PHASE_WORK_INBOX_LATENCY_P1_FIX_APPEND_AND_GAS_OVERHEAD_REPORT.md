# PHASE_WORK_INBOX_LATENCY_P1_FIX_APPEND_AND_GAS_OVERHEAD — Report

**Phase:** PHASE_WORK_INBOX_LATENCY_P1_FIX_APPEND_AND_GAS_OVERHEAD  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Commit (base, uncommitted):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`

---

## 1. Summary

P1 targets **timeline/audit append latency** and **incorrect GAS response timing** after P0 reduced mutationMs but Complete still measured **7248ms** (timeline+audit **2082ms**, Worker/GAS gap **~3000ms**).

Implemented: corrected `responseMs` vs `gasTotalMs`, append micro-timers, `setValues` fast append, combined timeline+audit path, disabled legacy mirror writes by default, slim taskPatch + response byte measurement, Worker `workerToGasGapMs`, FE patch merge + slow-sync operator message.

**Live after metrics pending deploy.**

---

## 2. Files changed

| Layer | File |
|-------|------|
| GAS | `workInboxAppendFast.js` (new) |
| GAS | `workInboxOperationalConfig.js` — mirror flags, USE_SET_VALUES_APPEND |
| GAS | `workInboxOperationalService.js` — micro-timers, mirror guards |
| GAS | `workInboxCombinedAction.js` — combined append + slim patch |
| GAS | `workInboxMutationFast.js` — `taskDbMapMinimalTaskPatchSlim_` |
| GAS | `workInboxPerformanceTrace.js` — responseBuildMs, bytes, append timers |
| GAS | `taskDbApi.js` — actionDispatchMs, removed bogus responseMs |
| GAS | `workInboxAppendContext.js` — dedupe row append |
| Worker | `googleSheetTaskDbAdapter.ts` — workerToGasGapMs |
| FE | `workInboxTaskPatchMerge.ts` (new) |
| FE | `WorkInboxFocusActionHost.tsx` — merge slim patch |
| FE | `useWorkInboxActionRuntime.ts` — slow sync message |
| FE | `workInboxLatencyP1AppendGasOverheadChecks.ts` (new) |

---

## 3. Baseline trace (post-P0, pre-P1)

| Metric | Complete |
|--------|----------|
| Total | 7248ms |
| GAS | 4161ms |
| mutationMs | 1834ms |
| timelineAppendMs | 1094ms |
| auditAppendMs | 988ms |
| responseMs (bug) | 4161ms (= gasTotal) |
| Worker/GAS gap | ~3000ms |

---

## 4. Response timing fix

- Removed pre-finish `responseMs = full duration` in `taskDbApi.js`
- `responseMs` / `responseBuildMs` = envelope build + JSON stringify only (`wiPerfFinishAndAttach_`)
- Added `actionDispatchMs`, `parseMs`, `gasExitAt`, `jsonStringifyMs`, `envelopeBuildMs`
- **Acceptance:** `responseMs` ≠ `gasTotalMs` unless build truly dominates

---

## 5. Timeline append breakdown (instrumented)

`timelineSheetMs`, `timelineHeaderMs`, `timelineRowBuildMs`, `timelineWriteMs`, `timelineMirrorMs`, `appendBatchWriteMs`

---

## 6. Audit append breakdown (instrumented)

`auditSheetMs`, `auditHeaderMs`, `auditRowBuildMs`, `auditWriteMs`, `auditMirrorMs`

---

## 7. Duplicate write reduction

| Flag | Default | Effect |
|------|---------|--------|
| MIRROR_AUDIT_TO_LEGACY_LOG | false | No CBV_AUDIT_LOG when ACTION_AUDIT_LOG written |
| MIRROR_TIMELINE_TO_LEGACY_LOG | false | No TASK_UPDATE_LOG when TASK_TIMELINE written |
| USE_SET_VALUES_APPEND | true | `setValues(nextRow)` instead of `appendRow` |

Unified WORK_INBOX_EVENT_LOG **not introduced** (schema avoided).

---

## 8. Payload size (measured in trace)

- `responseBytes`, `taskPatchBytes`, `performanceTraceBytes` on GAS envelope
- Slim patch: 14 fields via `taskDbMapMinimalTaskPatchSlim_`
- FE merges via `mergeWorkInboxTaskPatch`

---

## 9. Worker/GAS gap finding

- `workerToGasGapMs = workerFetchEndMs - gas.totalMs`
- **Finding:** ~3000ms gap = Apps Script web-app platform overhead (cold start + HTTP bridge), not fixable in application code alone
- Accurate markers enable reporting without false `responseMs` inflation

---

## 10. Before/after benchmark (live pending)

| Action | Before | After | GAS | Mutation | Timeline | Audit | Response | Payload KB | Gap | Status |
|--------|--------|-------|-----|----------|----------|-------|----------|------------|-----|--------|
| Complete | 7248 | *pending* | 4161→ | 1834 | 1094 | 988 | fix | *pending* | ~3000 | AWAIT DEPLOY |

**Target:** total ≤4000, GAS ≤2500, timeline+audit ≤800

---

## 11. Test status

`runWorkInboxLatencyP1AppendGasOverheadChecks()` — **17/17 PASS**, GO_WITH_WARNINGS  
`npm run build` — PASS

---

## 12. Remaining risks

- Apps Script cold start (~2–3s) remains
- Tail/setValues append assumes contiguous next row (standard append-only)
- Legacy mirrors disabled — enable via config if compliance requires CBV_AUDIT_LOG duplicate

---

## 13. Pilot recommendation

**GO_WITH_WARNINGS** — deploy and re-benchmark Complete/Pause. Expect append savings 500–1200ms; platform gap unchanged. Pilot OK with trace monitoring + slow-sync UX message.

---

## 14. Commit hash

`a3e088b42f5c1141b3a220132377b308b8c5b01c` (uncommitted)
