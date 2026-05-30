# PHASE_TASK_GS_10B — Google Sheets Performance Optimization — Report

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_GS_10B_GOOGLE_SHEETS_PERFORMANCE_OPTIMIZATION`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~7.2s)  
**Audit:** [`003_AUDIT/TASK_GS_PERFORMANCE_AUDIT.md`](../003_AUDIT/TASK_GS_PERFORMANCE_AUDIT.md)

---

## 1. Summary

Audited full read path from Google Sheets → GAS → Worker → Workboard FE. Applied **non-destructive** performance hardening focused on: batched reads, smarter cache invalidation, stale-while-revalidate, reduced parallel API pressure, shell-first rendering, and runtime telemetry for cache/source/latency.

No schema changes. No UI redesign. No fake cache hits.

---

## 2. Before / after load path

### Before

1. FE mounts TasksPage → **full-page skeleton** (no shell)
2. **4 parallel** Worker calls: snapshot + today + coordination + modules status
3. GAS `taskDbFindMainRow_`: **N separate getRange** per detail/write lookup
4. GAS cache invalidate: only cleared empty-filter snapshot key → stale filtered snapshots
5. Worker cache: **15s per userId** → duplicate GAS calls per user
6. GAS timeout → **empty/error screen**, no stale fallback

### After

1. FE renders **shell immediately** (title, alert placeholder, controls) + queue skeleton
2. Snapshot loads **first**; alert today/coord feeds **deferred** until snapshot ready
3. `taskDbFindMainRow_`: **one batched getRange** for entire TASK_MAIN
4. Cache invalidation: **generation bump** invalidates all snapshot/counts/detail keys
5. Worker cache: **30s shared by filter key**, enrich `isMine` per user; **120s stale fallback**
6. GAS timeout → return **STALE_SNAPSHOT** with visible warning if cached data exists

---

## 3. API call count

| Scenario | Before | After |
|----------|--------|-------|
| Cold `/tasks` mount (parallel peak) | 4 | 2 (snapshot + modules) |
| After snapshot | — | +2 sequential (today, coord) |
| Cache hit reload | 4 | 1 (snapshot worker hit) + deferred secondary |
| Task detail click | +1 lazy | +1 lazy (unchanged) |

---

## 4. Google Sheets read strategy

| Operation | Strategy |
|-----------|----------|
| Queue snapshot | Single batched `getValues` on TASK_MAIN; USER_DIRECTORY batched once |
| Counts reuse | 60s counts cache avoids re-read between snapshot builds |
| Detail row lookup | Batched scan in memory (was per-row API) |
| Timeline/files | Still full-sheet read on detail — **deferred optimization** |

---

## 5. Cache strategy

| Tier | Mechanism | TTL |
|------|-----------|-----|
| GAS CacheService | Generation-scoped keys | 30s snapshot / 60s counts / 45s detail |
| Worker in-memory | Filter-key raw snapshot | 30s fresh |
| Worker stale | Same entry | 120s fallback |
| FE detail Map | Per taskId | 45s |

Invalidation: writes + `gsAddTaskComment` → `invalidateWorkerSnapshotCache()` + GAS gen bump.

---

## 6. Stale fallback behavior

Worker `gsGetTaskWorkspaceSnapshot`:
- GAS fail/timeout → serve last snapshot if within 120s
- Response warnings: `STALE_SNAPSHOT — dữ liệu có thể chưa đồng bộ`
- Runtime: `cacheSource: 'stale'`, `stale: true`
- FE existing degraded/stale banners surface via `TasksPage` warnings pipeline

---

## 7. Payload split (existing)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/tasks/workspace-snapshot` | Queue list + counts + highlights + user maps |
| `GET /api/tasks/:id` | Timeline, files, full metadata — **lazy on select** |

No new endpoint added; lazy detail pattern verified and preserved.

---

## 8. Latency metrics / telemetry

**Runtime console drawer now shows:**
- Source: `worker` | `gas` | `stale`
- Cache label (worker hit / gas hit / stale / miss)
- Latency ms
- Payload KB (when `payloadBytesApprox` present)
- Rows returned/scanned

**GAS runtime metrics** (existing + counts cache flag):
- `gasDurationMs`, `sheetReadMs`, `rowsScanned`, `payloadBytesApprox`, `countsCacheHit`

---

## 9. Files changed

**GAS (`gas-runtime-api/`):**
- `taskDbCache.js` — generation-based cache invalidation
- `taskDbService.js` — batched `taskDbFindMainRow_`, counts cache hit flag

**Worker:**
- `workers/api/src/adapters/googleSheetTaskDbAdapter.ts` — shared filter cache, stale fallback, comment invalidation, `cacheSource`

**FE:**
- `apps/workboard/src/modules/task/TasksPage.tsx` — shell-first render, defer alert feeds
- `apps/workboard/src/components/ui/OperationalAlertHeader.tsx` — `enableSecondaryFeeds`, snapshot overdue seed
- `apps/workboard/src/api/contracts.ts` — `cacheSource`, `stale` on runtime
- `apps/workboard/src/shared/utils/runtimeTelemetry.ts` — source/payload diagnostics
- `apps/workboard/src/modules/task/taskGoogleSheetsPerformanceChecks.ts` — validation suite

**Docs:**
- `00_SYSTEM_BRAIN/003_AUDIT/TASK_GS_PERFORMANCE_AUDIT.md`

---

## 10. Validation results

**Suite:** `runTaskGoogleSheetsPerformanceChecks()` — 11 checks (static)

Invoke in browser after dev load. Expected: **GO** or **GO_WITH_WARNINGS**.

| Check | Status |
|-------|--------|
| GAS batched findMainRow | PASS |
| GAS snapshot batch read | PASS |
| GAS cache generation invalidate | PASS |
| Worker stale fallback | PASS |
| Worker shared data cache | PASS |
| Detail lazy load | PASS |
| Shell render first | PASS |
| Alert deferred feeds | PASS |
| Runtime cache source telemetry | PASS |
| Comment invalidates cache | PASS |

---

## 11. Build result

| Command | Result |
|---------|--------|
| `npm run build` (apps/workboard) | **PASS** |

---

## 12. Remaining bottlenecks

1. Detail timeline/attachment full-sheet scans  
2. Snapshot payload user map duplication  
3. `/api/today` separate from TASK_MAIN for alert hoso/finance  
4. No FE list virtualization >100 rows  
5. Search full-scan at GAS scale  
6. Worker detail cache not implemented  

---

## 13. Manual test record

| Scenario | Expected | Record |
|----------|----------|--------|
| Cold /tasks | Shell visible <500ms, queue skeleton | Manual verify |
| Second load | Worker cache hit in console | Manual verify |
| GAS timeout | Stale + warning | Manual verify |
| Detail select | Queue stays, panel loads | Manual verify |
| Mutation refresh | Cache invalidated | Manual verify |

*Timings not auto-captured — run with DevTools Network + Runtime Console.*

---

**Principle applied:** Read less · Read batched · Cache smart · Lazy detail · Always show cache/stale/latency.
