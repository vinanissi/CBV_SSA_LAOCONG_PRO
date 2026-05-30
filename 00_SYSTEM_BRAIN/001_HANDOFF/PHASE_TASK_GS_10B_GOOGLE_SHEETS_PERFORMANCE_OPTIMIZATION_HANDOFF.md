# PHASE_TASK_GS_10B — Google Sheets Performance — Handoff

**Date:** 2026-05-28  
**Status:** GO  
**Report:** [`PHASE_TASK_GS_10B_GOOGLE_SHEETS_PERFORMANCE_OPTIMIZATION_REPORT.md`](../000_REPORTS/PHASE_TASK_GS_10B_GOOGLE_SHEETS_PERFORMANCE_OPTIMIZATION_REPORT.md)  
**Audit:** [`003_AUDIT/TASK_GS_PERFORMANCE_AUDIT.md`](../003_AUDIT/TASK_GS_PERFORMANCE_AUDIT.md)

---

## What was optimized

### GAS
- **Cache invalidation:** generation bump — all snapshot filter keys invalidated on write
- **Detail lookup:** `taskDbFindMainRow_` — N per-row reads → 1 batched read
- **Counts cache hit** flagged on snapshot runtime metrics

### Worker
- **Snapshot cache:** 30s TTL, keyed by filters (not per-user)
- **Stale fallback:** 120s — returns cached snapshot on GAS fail with `STALE_SNAPSHOT` warning
- **Comment writes:** invalidate worker snapshot cache

### Frontend
- **Shell-first:** title + controls render before snapshot; skeleton only in queue
- **Alert deferral:** `/today` + `/coordination` wait until snapshot loaded (reduces parallel GAS load)
- **Snapshot overdue:** seeds alert strip while secondary feeds load
- **Telemetry:** Runtime console shows Source, Cache, Latency, Payload KB

---

## What remains slow

| Bottleneck | Impact | Suggested phase |
|------------|--------|-----------------|
| Full-sheet TASK_UPDATE_LOG read on detail | Detail panel slow on large logs | GS_10C_DETAIL_INDEX |
| Full-sheet TASK_ATTACHMENT read | Same | GS_10C_DETAIL_INDEX |
| Snapshot payload user maps (3×) | Large JSON, >400KB warn | GS_10D_PAYLOAD_SLIM |
| `/api/today` for hoso/finance alerts | Extra call vs snapshot | GS_10E_ALERT_FROM_SNAPSHOT |
| Search GAS full scan | Slow at scale | GS_10F_SEARCH_INDEX |
| No list virtualization | DOM heavy >100 rows | GS_10G_LIST_VIRTUALIZE |

---

## How to test speed

```bash
cd apps/workboard && npm run dev
```

1. **Cold load** — Open `/tasks`, Network tab: snapshot should fire before today/coord
2. **Shell** — Title "Việc vận hành" + filter tabs visible while queue skeleton shows
3. **Cache hit** — Reload within 30s → Console drawer Source = `worker`
4. **Stale** — Simulate GAS timeout (disconnect or throttle) → stale warning + queue still visible
5. **Detail** — Click task → `/api/tasks/:id` only after select
6. **Validation** — `runTaskGoogleSheetsPerformanceChecks()` in browser console

**Deploy note:** GAS changes in `gas-runtime-api/` require `clasp push` / redeploy for production effect.

---

## Next recommended phase

**`PHASE_TASK_GS_10C_DETAIL_READ_INDEX`**
- Index TASK_UPDATE_LOG by TASK_ID (PropertiesService or auxiliary sheet)
- Stop full-sheet scan on every detail open
- Optional Worker detail cache 30s

---

## Constraints preserved

- TASK_MAIN PRO schema baseline untouched
- No fake cache/latency metrics
- Stale data always warned, never hidden
- Runtime feedback system (GS_10A) intact

---

**Handoff complete.**
