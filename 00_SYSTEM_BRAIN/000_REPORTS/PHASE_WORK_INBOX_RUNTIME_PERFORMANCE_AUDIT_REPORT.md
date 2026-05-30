# PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT — Report

**Phase:** WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Commit (uncommitted work on):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`  
**RCLA:** CBV-RCLA v1.1 — context via `WorkInboxRuntimeContextProvider` / registry (no bypass)

---

## 1. Summary

Work Inbox V3 shows **"Google Sheet runtime phản hồi chậm — thử lại sau"** when Worker→GAS calls exceed **5–8s** abort thresholds. This phase added **lightweight trace instrumentation** (FE → Worker → GAS) without changing business logic, layout, or TASK_MAIN schema.

**Primary bottleneck hypothesis:** **GAS + Google Sheet** — full TASK_MAIN row scans on every mutation (`taskDbFindMainRow_`) plus full snapshot reload after each action, compounded by **4–6 HTTP requests per operator action**.

---

## 2. Runtime path audited

```
FE (Work Inbox Focus / Action / Operational)
  → api.client / workInboxOperationalApi  [X-CBV-Trace-Id]
  → Worker /api/tasks/* + /api/work-inbox/*
  → callTaskDbGas → GAS Web App taskDbDoPost_
  → TASK_MAIN / TASK_UPDATE_LOG / CBV_AUDIT_LOG / operational sheets
  → Worker response (+ performanceTrace in audit routes)
  → FE loadWorkspace + operational bundle refresh
```

Context loaded exclusively through RCLA: active task, operator, focus session, API base URL, permissions — no ad-hoc context paths added.

---

## 3. Trace implementation summary

| Layer | Module | Behavior |
|-------|--------|----------|
| FE | `workInboxPerformanceTrace.ts` | Per-action traceId, request/refresh counts, layer timings, sessionStorage ring buffer |
| FE | `workInboxActionExecutor.ts` | Wraps actions with `startWorkInboxTrace`, propagates traceId |
| FE | `api/client.ts`, operational API/service | `X-CBV-Trace-Id` header |
| Worker | `workInboxPerformanceTrace.ts` | Route timing envelope, GAS merge |
| Worker | `googleSheetTaskDbAdapter.ts` | Forwards traceId to GAS; surfaces `performanceTrace` |
| Worker | `workInboxOperational.ts` | `beginWorkerPerf` on bundle/audit/timeline routes |
| GAS | `workInboxPerformanceTrace.js` | Sheet read/write counters, duration classification, optional `WORK_INBOX_PERFORMANCE_TRACE` append |

Trace envelope matches spec: `traceId`, `phase`, `action`, `layerTimings`, `requestCount`, `sheetReadCount`, `sheetWriteCount`, `refreshCount`, `status`, `warnings`, `errors`.

---

## 4. Action benchmark table (static path analysis — live GAS not deployed this session)

| Action | Total ms (est.) | FE ms | Worker ms | GAS ms | Sheet read ms | Sheet write ms | Requests | Reads | Writes | Status | Bottleneck |
|--------|-----------------|-------|-----------|--------|---------------|----------------|----------|-------|--------|--------|------------|
| Load Inbox | 2000–6000 | 50–150 | 100–300 | 1500–5000 | 1200–4500 | 0 | 1–2 | 1 (full TASK_MAIN) | 0 | WARNING–DEGRADED | GAS snapshot read |
| Open Focus / task detail | 800–3000 | 30–80 | 80–200 | 600–2500 | 500–2000 | 0 | 1–2 | 1–3 | 0 | WARNING | GAS detail + timeline reads |
| Load operational bundle | 1000–4000 | 20–60 | 80–200 | 800–3500 | 600–3000 | 0 | 1 | 2–5 | 0 | WARNING–DEGRADED | GAS wiOp multi-sheet |
| Start processing | 4000–12000 | 100–300 | 400–1200 | 3000–9000 | 2000–6000 | 200–800 | 4–6 | 3–6 | 2–4 | DEGRADED–FAIL | GAS find+write+refresh fan-out |
| Pause | 4000–12000 | 100–300 | 400–1500 | 3000–9000 | 2000–6000 | 2–5 | 4–7 | 3–7 | 2–5 | DEGRADED–FAIL | Same as start (+ fallback status) |
| Handoff | 4000–12000 | 100–300 | 400–1200 | 3000–9000 | 2000–6000 | 2–5 | 4–6 | 3–6 | 3–5 | DEGRADED–FAIL | GAS assign + audit chain |
| Save note | 2000–6000 | 50–150 | 200–600 | 1500–5000 | 1000–4000 | 1–3 | 2–4 | 2–4 | 2–3 | WARNING–DEGRADED | GAS wiOp writes |
| Create appointment | 2500–7000 | 50–150 | 200–700 | 1800–5500 | 1200–4000 | 2–4 | 3–5 | 2–5 | 3–5 | DEGRADED | Multi GAS wiOp calls |
| Navigate next/prev | 300–1500 | 20–80 | 100–400 | 200–800 | 0–500 | 0–1 | 1 | 0–1 | 0–1 | OK–WARNING | Audit-only (no full refresh) |
| Refresh after action | 2000–6000 | 50–200 | 100–300 | 1500–5000 | full TASK_MAIN | 0 | 1 | 1 | 0 | WARNING–DEGRADED | Full snapshot reload |

*Estimates from code-path analysis + existing `runtime.gasDurationMs` patterns. Live capture requires GAS deploy + manual checklist.*

---

## 5. Request fan-out analysis

**Start processing (representative mutation):**

1. `POST /api/tasks/:id/status` → GAS `updateTaskStatus` (find row + patch + update log + audit)
2. `POST /api/work-inbox/timeline` → GAS `wiOpAppendTimeline`
3. `POST /api/work-inbox/audit` → GAS `wiOpAppendActionAudit`
4. Optional fallback: `POST addTaskComment` if timeline fails
5. `onRefresh` → `GET workspace-snapshot` (full TASK_MAIN read)
6. `onOperationalRefresh` → `GET /api/work-inbox/tasks/:id/operational`

**Navigate next/previous:** 1 audit request only (no snapshot refresh) — lowest latency path.

**Worker timeouts:** snapshot 8s, detail 5s, write 8s — abort triggers user-visible slow warning.

---

## 6. Sheet read/write analysis

| Operation | Reads | Writes | Notes |
|-----------|-------|--------|-------|
| `getTaskWorkspaceSnapshot` | 1 full TASK_MAIN | 0 | `taskDbReadMainSummaries_` — all rows from row 2 |
| `updateTaskStatus` | 1–2 full TASK_MAIN scans | 1 main patch + 1 update log + 1 audit | `taskDbFindMainRow_` called before and after patch |
| `getTaskDetail` | 1 find + timeline/attachment scans | 0 | Row scans on auxiliary sheets |
| `wiOpGetTaskOperational` | 2–5 sheet scans | 0 | Timeline, notes, appointments, documents |
| Each audit/timeline append | 0–1 header read | 1 appendRow | Operational + CBV audit sheets |

---

## 7. getDataRange / full-scan findings

- **No `getDataRange().getValues()`** in `gas-runtime-api` (static grep).
- **Equivalent full scans:** `getRange(2, 1, lastRow, lastCol).getValues()` in:
  - `taskDbReadMainSummaries_` (every snapshot)
  - `taskDbFindMainRow_` (every mutation — **O(n) per call**, often 2× per status update)
- **Repeated openById:** mitigated by `taskDbGetSpreadsheetOnce_` per request.
- **Repeated getSheetByName:** header maps cached per request context.

---

## 8. Bottleneck layer

**Primary:** GAS / Google Sheet (read latency + quota + serial mutations)  
**Secondary:** FE refresh fan-out (`loadWorkspace` full snapshot after every mutation)  
**Tertiary:** Worker timeout/retry (no duplicate retry loop found; single abort → slow message)

FE render is not the bottleneck (recent flicker fixes reduced unnecessary re-fetch UI churn).

---

## 9. Risk rating for pilot

| Risk | Level | Rationale |
|------|-------|-----------|
| Operator waits on mutations | **HIGH** | 4–6 sequential network+sheet ops per click |
| Timeout message during peak | **MEDIUM–HIGH** | 5–8s thresholds reachable with >500 TASK_MAIN rows |
| Data correctness | **LOW** | No business logic changed |
| Layout/UX regression | **LOW** | Instrumentation only |

**Pilot readiness:** **GO_WITH_WARNINGS** — functional but expect slow warnings under real sheet load until P0 fixes land.

---

## 10. Recommended fixes (ranked)

### P0 — before pilot

1. **Index TASK_MAIN by ID** — cache row number map or use Script Cache keyed by taskId to avoid full scan on `taskDbFindMainRow_`.
2. **Stop full snapshot refresh after every action** — patch local task in FE + invalidate snapshot cache selectively.
3. **Batch operational side-effects** — single GAS action `wiOpRecordAction` (status + timeline + audit) instead of 3 Worker round-trips.
4. **Raise or tier timeouts** only after (1–3) — not as first fix.

### P1 — during pilot

5. Worker snapshot SWR: extend stale TTL when mutation in flight.
6. Operational bundle: delta refresh (timeline tail only).
7. Deploy `WORK_INBOX_PERFORMANCE_TRACE` sheet for production telemetry.

### P2 — later

8. Snapshot pagination / filtered slices for inbox groups.
9. Background prefetch next/previous task detail.
10. Apps Script execution time dashboard from trace sheet.

---

## 11. Test status

| Check | Result |
|-------|--------|
| `runWorkInboxRuntimePerformanceAuditChecks()` | 16/16 static checks pass (after report generated) |
| `npm run build` (workboard) | PASS |
| Live GAS benchmark | NOT RUN — requires clasp deploy |
| TraceId FE→Worker→GAS | Wired in code; live propagation pending deploy |

---

## 12–14. Artifact paths

- **Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_REPORT.md`
- **Handoff:** `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_HANDOFF.md`
- **Test evidence:** `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_TEST_EVIDENCE.md`

---

## 15. Commit hash

Working tree **not committed**. Base HEAD: `a3e088b42f5c1141b3a220132377b308b8c5b01c`.
