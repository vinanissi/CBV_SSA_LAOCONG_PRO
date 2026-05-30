# PHASE_TASK_GS_03 — Runtime Performance Hardening (Prompt)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_TASK_GS_03_RUNTIME_PERFORMANCE_HARDENING`  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Baseline:** PHASE_TASK_GS_02 operational runtime (~4950ms snapshot latency observed)

## Goal

Reduce snapshot latency, payload size, and rate-limit risk without changing architecture (FE → Worker → GAS → Google Sheet TASK_MAIN).

## Targets

| Metric | Target |
|--------|--------|
| Snapshot cache hit | < 500ms |
| Snapshot cache miss (<200 tasks) | < 1500ms |
| Task detail | < 1000ms |
| Write action | < 1200ms |
| FE first useful render | < 1000ms (stale cache OK) |

## Priorities

1. Lightweight workspace snapshot (summary fields only, limit 100/200)
2. Two-level data: snapshot vs lazy detail
3. Cache hardening (GAS 30s, Worker 15s, stale-while-refresh FE)
4. Precomputed counts cache (GAS CacheService)
5. Lazy detail panel + FE session cache
6. Runtime metrics in GAS + Worker responses
7. Observation log (SNAPSHOT_SLOW, CACHE_MISS_SLOW, DETAIL_SLOW, PAYLOAD_TOO_LARGE)

## Constraints

- No DB change, no Supabase, no websocket, no fan-out detail
- No TASK module rewrite, no UI redesign
- Append-only observation; no destructive sheet ops
- GO only when targets met locally; else GO_WITH_WARNINGS

## Test Suite

`CBV_TCS_GS_03_runAll()` in `gas-runtime-api/taskDbTestConsoleGs03.js`

## Artifacts

- Report: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_GS_03_RUNTIME_PERFORMANCE_HARDENING_REPORT.md`
- Handoff: `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_TASK_GS_03_RUNTIME_PERFORMANCE_HARDENING_HANDOFF.md`
