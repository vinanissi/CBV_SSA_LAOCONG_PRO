# PHASE_TASK_GS_03 — Handoff

**From:** PHASE_TASK_GS_03 runtime performance hardening  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO_WITH_WARNINGS (pending live GAS latency verification)

## Delivered

1. Lightweight workspace snapshot (summary fields, limit 100 default / 200 max)
2. Two-level load: snapshot list vs lazy `getTaskDetail`
3. GAS cache: snapshot 30s, counts 60s, detail 45s
4. Worker in-memory snapshot cache 15s + per-action timeouts (8s/5s/8s)
5. FE stale-while-refresh + detail session cache (45s)
6. Runtime metrics bar (latency, cache, rows, mode)
7. Observation: SNAPSHOT_SLOW, CACHE_MISS_SLOW, DETAIL_SLOW, PAYLOAD_TOO_LARGE
8. Test console: `CBV_TCS_GS_03_runAll()`

## Operator Setup

Unchanged from GS_02 — ensure Worker + FE env point to GAS Web App:

**Worker** (`workers/api/.dev.vars`):
```
GAS_TASK_API_URL=<GAS Web App URL>
CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
CBV_TASK_SHEET_ID=1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE
CBV_TASK_WRITE_MODE=gas
```

**Workboard** (`apps/workboard/.env`):
```
VITE_CBV_API_BASE_URL=http://localhost:8787
VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
```

## Deploy GAS

```bash
cd gas-runtime-api
clasp push --force
# Manual Web App deploy if clasp deploy blocked
```

Run in GAS editor:
```javascript
CBV_TCS_GS_03_runAll()
```

## Verify performance

1. Open `/tasks` — first load = cache miss (check runtime bar latency)
2. Refresh within 30s — GAS cache hit; within 15s — Worker cache hit
3. Select task — detail loads once; re-select same task within 45s = FE cache
4. Accept/Complete — list patches locally; soft snapshot refresh

## Targets

- Cache hit snapshot: < 500ms
- Cache miss snapshot (<200 tasks): < 1500ms (was ~4950ms)
- No per-task fan-out on list load

## Do NOT

- Poll faster than cache TTL
- Force full page reload after writes
- Re-add description/timeline to snapshot response
- Deploy production without measuring live latency

## Next phase hints

- Column-scoped sheet read if row count grows
- Sheet revision in cache key for multi-editor safety
