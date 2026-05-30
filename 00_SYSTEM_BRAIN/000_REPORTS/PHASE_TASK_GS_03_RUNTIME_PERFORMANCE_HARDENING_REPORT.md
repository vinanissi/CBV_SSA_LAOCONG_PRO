# PHASE_TASK_GS_03 — Runtime Performance Hardening — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO_WITH_WARNINGS

---

## Summary

Phase hardening runtime TASK_MAIN: lightweight snapshot, two-level load, multi-tier cache, runtime metrics, observation events. Không đổi kiến trúc FE → Worker → GAS → Sheet.

## Latency (before → after design)

| Scenario | Before (GS_02) | After (GS_03 code) | Target |
|----------|----------------|---------------------|--------|
| Snapshot cache miss | ~4950ms | TBD live (expected material improvement) | < 1500ms |
| Snapshot cache hit | N/A (no worker cache) | TBD live | < 500ms |
| Detail (lazy) | Per-select GAS call | Cached 45s GAS + FE session | < 1000ms |

**Note:** Live GAS deploy required for measured numbers. Local Worker/FE builds PASS.

## Root causes addressed

1. Removed per-snapshot `taskDbBuildSchemaReport_()` on hot path
2. Summary-only mapping (`taskDbMapTaskSummaryRow_`) — no DESCRIPTION in list
3. Bulk sheet read once per request (`taskDbReadMainSummaries_`)
4. Separate counts cache (60s) reused across filter variants
5. GAS snapshot cache TTL 30s; detail cache 45s
6. Worker in-memory snapshot cache 15s
7. Timeline/attachments bulk read with limits 20/10 (detail only)

## Payload reduction

- Snapshot excludes: description, full timeline, attachments, raw row
- Default limit 100, max 200
- Runtime reports `payloadBytesApprox`, `rowsScanned`, `rowsReturned`

## Runtime metrics added

**GAS `runtime` object:**
- `cacheHit`, `cacheTtlSec`, `gasDurationMs`, `sheetReadMs`, `mappingMs`
- `rowsScanned`, `rowsReturned`, `payloadBytesApprox`, `generatedAt`

**Worker adds:**
- `workerLatencyMs`, `workerCacheHit`, `traceId`

**FE `TaskRuntimeBar`:**
- Connected / Degraded / Disconnected
- Cache hit/miss/stale/worker hit
- Latency, rows returned/scanned, mode, sync time

## Cache strategy

| Layer | TTL | Key |
|-------|-----|-----|
| GAS snapshot | 30s | action + filters + v3 |
| GAS counts | 60s | summaries precompute |
| GAS detail | 45s | taskId |
| Worker snapshot | 15s | filters + userId |
| FE detail session | 45s | taskId in-memory |

## FE behavior

- Stale-while-refresh: keep list on soft refresh
- Initial load message: "Đang đồng bộ dữ liệu TASK_MAIN…"
- Detail lazy with session cache; no reload on same task within TTL
- `React.memo` on TaskCard
- Rate-limit message preserved via Worker error mapping

## Observation events

When `TASK_OPERATOR_OBSERVATION` exists or `CBV_OBSERVATION_DEV=1`:
- SNAPSHOT_SLOW (>2000ms)
- CACHE_MISS_SLOW (>1500ms)
- DETAIL_SLOW (>1500ms)
- PAYLOAD_TOO_LARGE (>400KB approx)

## Files changed

| Area | Files |
|------|-------|
| GAS | `taskDbConfig.js`, `taskDbCache.js`, `taskDbService.js`, `taskDbObservation.js`, `taskDbTestConsoleGs03.js` |
| Worker | `googleSheetTaskDbAdapter.ts`, `taskGsDb.ts` |
| FE | `contracts.ts`, `TasksPage.tsx`, `TaskRuntimeBar.tsx`, `TaskCard.tsx`, `OperationalContextPanel.tsx` |
| Docs | prompt, report, handoff (this file) |

## Tests run

| Check | Result |
|-------|--------|
| Worker typecheck | PASS |
| FE build | PASS |
| `clasp push --force` | PASS (20 files) |
| Worker cache hit (local) | PASS — 2nd request ~0ms `workerCacheHit: true` |
| GAS Web App deploy | PENDING — live response still includes `description` (old deployment) |
| Live GAS metrics (`gasDurationMs`, `rowsScanned`) | PENDING — requires Web App redeploy |
| Live cache miss vs ~4950ms | PENDING — redeploy GAS then remeasure |

## Live probe (2026-05-25, Worker localhost:8787)

- **1st request:** ~5000–7300ms end-to-end; GAS still returns full row fields (pre-GS_03 Web App)
- **2nd request (Worker cache):** `workerLatencyMs: 0`, `workerCacheHit: true` — Worker layer OK
- **Action:** Deploy Web App version mới sau `clasp push` (Deploy → Manage deployments → New version)

## Limitations

- GAS still reads full TASK_MAIN column range on cache miss (acceptable for ~96–200 rows)
- Worker cache is in-memory (per isolate; dev/single worker instance)
- `clasp deploy` may require manual Web App deploy (domain restriction)
- GO withheld until live latency verified

## Next recommendations

1. `clasp push --force` + manual Web App deploy
2. Measure cache hit/miss with browser Network tab + runtime bar
3. If miss still >1500ms at scale: column-scoped read using SUMMARY_FIELDS indices
4. Consider ETag/sheet revision in cache key if concurrent editors increase
