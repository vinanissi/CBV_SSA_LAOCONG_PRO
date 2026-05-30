# TASK — Google Sheets Performance Audit

**Phase:** `PHASE_TASK_GS_10B_GOOGLE_SHEETS_PERFORMANCE_OPTIMIZATION`  
**Date:** 2026-05-28  
**Scope:** `gas-runtime-api/` · `workers/api/` · `apps/workboard` · legacy `05_GAS_RUNTIME/` RF12

---

## Architecture (production path)

```
FE TasksPage
  → GET /api/tasks/workspace-snapshot?limit=100   [Worker 30s cache + GAS 30/60s cache]
  → (deferred) GET /api/today + /api/coordination  [alert secondary feeds]
  → GET /api/modules/status                        [footer]
  → (lazy) GET /api/tasks/:id                      [detail on select only]

Worker googleSheetTaskDbAdapter
  → POST GAS getTaskWorkspaceSnapshot

GAS taskDbService
  → batched TASK_MAIN read + USER_DIRECTORY read
  → CacheService snapshot 30s / counts 60s / detail 45s
```

---

## Audit table

| Layer | Function/API | Reads Sheet | Range | Rows | Cache | Avg Latency | Issue | Recommendation |
|-------|--------------|-------------|-------|------|-------|-------------|-------|----------------|
| GAS | `taskDbReadMainSummaries_` | TASK_MAIN | `2:1:lastRow:lastCol` batch | all active | counts 60s | cold 1–3s | OK batched | **Done** — keep |
| GAS | `taskDbGetWorkspaceSnapshot_` | via summaries | filtered slice | limit 100 | snapshot 30s + counts 60s | hit <500ms | Was: invalidate only `{}` key | **Fixed** — generation bump |
| GAS | `taskDbFindMainRow_` | TASK_MAIN | was per-row `getRange(r,…,r,…)` | 1 per scan | none | O(n) API calls | **High** detail slow | **Fixed** — single batch read |
| GAS | `taskDbGetTimelineForTask_` | TASK_UPDATE_LOG | full sheet batch + filter | all logs | none | slow on large log | Full scan per detail | **Deferred** — index by TASK_ID |
| GAS | `taskDbGetAttachmentsForTask_` | TASK_ATTACHMENT | full sheet batch + filter | all files | none | slow | Full scan per detail | **Deferred** — index |
| GAS | `taskDbLoadUserDirectory_` | USER_DIRECTORY | batch | all users | per-request | ~200ms | Duplicated in payload 3× | **Deferred** — slim payload |
| Worker | `gsGetTaskWorkspaceSnapshot` | via GAS POST | — | — | was 15s per-user | hit <50ms | Per-user duplicate cache | **Fixed** — filter-key cache + enrich |
| Worker | `gsGetTaskWorkspaceSnapshot` stale | — | — | — | stale 120s | — | No fallback on timeout | **Fixed** — STALE_SNAPSHOT |
| Worker | `gsGetTaskDetail` | via GAS | — | — | GAS 45s only | 0.5–2s | No worker cache | **Deferred** |
| Worker | `gsAddTaskComment` | write path | — | — | was no invalidate | — | Stale list after comment | **Fixed** — invalidate worker cache |
| FE | `TasksPage.loadWorkspace` | API only | — | 100 tasks | client detail 45s | blocks queue until snapshot | Full-page skeleton | **Fixed** — shell first |
| FE | `OperationalAlertHeader` | `/today` + `/coordination` | mock projection | — | none | parallel with snapshot | 2 extra calls on mount | **Fixed** — defer until snapshot |
| FE | `loadTaskDetail` | `/tasks/:id` | — | 1 task | 45s Map | lazy | OK pattern | **Done** |
| FE | `RuntimeStatusBar` | `/modules/status` | — | — | none | ~100ms | Extra parallel call | **Deferred** — dedupe |
| FE | `SearchPage` | `/api/search` | GAS search | varies | none | on demand | Does not block queue | OK |
| RF12 legacy | `getTasks_` / `rowToObject_` | TASK_MAIN | **per-row** | N | none | very slow | N+1 reads | Avoid — use taskDb mode only |
| RF12 legacy | `getTimelineForTask_` | timeline sheet | per-row | N | none | slow | Legacy path | Not production workboard |

---

## API call count — before vs after (cold `/tasks` mount)

| Call | Before | After GS_10B |
|------|--------|----------------|
| workspace-snapshot | 1 (parallel) | 1 (priority) |
| /api/today | 1 (parallel) | 0 until snapshot done, then 1 |
| /api/coordination | 1 (parallel) | 0 until snapshot done, then 1 |
| /api/modules/status | 1 | 1 |
| /api/tasks/:id | 0–1 if URL | 0–1 lazy (unchanged) |
| **Total parallel GAS pressure** | **4+ simultaneous** | **2 then +2 sequential** |

---

## Cache TTL (effective)

| Layer | Key | TTL |
|-------|-----|-----|
| GAS snapshot | `taskDb:v3:g{gen}:snapshot:…` | 30s |
| GAS counts | `taskDb:v3:g{gen}:counts` | 60s |
| GAS detail | per taskId | 45s |
| Worker snapshot | filter JSON | 30s fresh / 120s stale |
| FE detail | per taskId | 45s |

---

## Remaining bottlenecks (not fixed this phase)

1. Full-sheet TASK_UPDATE_LOG / TASK_ATTACHMENT scan on every detail miss  
2. Snapshot payload size (~user directory triple map) — warn at 400KB  
3. `/api/today` mock projection still separate from TASK_MAIN snapshot  
4. RF12 legacy path still in repo if runtime mode misconfigured  
5. No list virtualization above 100 rows  
6. Search still full scan on GAS for large datasets  

---

## Manual verification checklist

- [ ] Cold load `/tasks` — shell (title + controls) visible before queue  
- [ ] Second load within 30s — Worker cache hit in console (Source: worker)  
- [ ] GAS slow/timeout — stale snapshot + warning banner  
- [ ] Select task — detail loads after queue visible  
- [ ] Accept/complete — snapshot refresh, cache invalidated  
- [ ] Runtime drawer — Source, Cache, Latency, Payload KB, Rows  

---

**Audit complete — optimizations applied per GS_10B report.**
