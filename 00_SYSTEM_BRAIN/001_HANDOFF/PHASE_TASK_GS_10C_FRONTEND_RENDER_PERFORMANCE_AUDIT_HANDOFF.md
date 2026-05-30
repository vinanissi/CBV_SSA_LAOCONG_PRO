# PHASE_TASK_GS_10C — Frontend Render Performance Audit — Handoff

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT`  
**Status:** GO  
**Report:** [`000_REPORTS/PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT_REPORT.md`](../000_REPORTS/PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT_REPORT.md)  
**Audit:** [`003_AUDIT/TASK_FRONTEND_RENDER_PERFORMANCE_AUDIT.md`](../003_AUDIT/TASK_FRONTEND_RENDER_PERFORMANCE_AUDIT.md)

---

## Bottlenecks found

| # | Bottleneck | Severity | Location |
|---|------------|----------|----------|
| 1 | ~97 TaskCards mount synchronously after snapshot | **High** | `TaskGroupSection` → `TaskCard` |
| 2 | `DetailProvider.setDetail` re-renders TasksPage + AppShell | **High** | `DetailPanel.tsx` / `showPanel` |
| 3 | `taskFeedback.feedbackMap` triggers full `showPanel` rebuild | **Med** | `TasksPage.tsx` effect |
| 4 | `publishRuntimeTelemetry` re-renders all telemetry provider children | **Med** | `TaskRuntimeTelemetryContext.tsx` |
| 5 | OperationalContextPanel mounts all sections (timeline/file/handoff) at once | **Med** | `OperationalContextPanel.tsx` |
| 6 | Main bundle 406KB — no route code-split | **Low** | `routes.tsx` |
| 7 | Duplicate grouping in `loadWorkspace().then()` | **Low** | `TasksPage.tsx` |

**Not bottlenecks (confirmed):**

- GAS/Worker latency (734ms, cache hit) — GS_10B  
- Footer 30s clock — isolated in `RuntimeStatusBar`  
- Task grouping memo chain — sub-ms at 97 rows  
- Search — off critical `/tasks` path  

---

## What was safely fixed

1. **`shared/utils/renderPerf.ts`** — `markRenderStart/End`, `measureRender`, `useRenderCount`, `usePerfMark`; gated by `VITE_CBV_RENDER_PERF_DEBUG`
2. **Instrumentation** — `main.tsx`, `TasksPage`, `TaskCard`, `OperationalContextPanel`
3. **`TaskControlSurface`** — `React.memo` + `useMemo` for execution memory / resume / recent reads
4. **`RuntimeFooterDrawer`** — lazy-loaded (4.2KB separate chunk)
5. **Runtime console** — Frontend render diagnostics when debug metrics exist
6. **Validation** — `taskFrontendRenderPerformanceChecks.ts` (10 checks)
7. **Build** — PASS

---

## What must not be changed yet

- Do **not** virtualize queue without profiling + `PHASE_TASK_GS_10D` decision gate (97 < 150 cards)
- Do **not** refactor DetailProvider / layout tree without dedicated isolation phase
- Do **not** remove `showPanel` pattern or task feedback UX to chase perf
- Do **not** alter TASK_MAIN data contract or Worker snapshot shape
- Do **not** enable perf console logging in production default (flag off)
- Do **not** blame Google Sheets when runtime console shows worker cache hit + acceptable GAS latency

---

## How to measure (operator)

```powershell
cd apps/workboard
$env:VITE_CBV_RENDER_PERF_DEBUG="true"
npm run dev
```

Open `/tasks` cold → DevTools console → filter `[CBV renderPerf]`  
Open Runtime Console drawer → **Frontend render** section  

Record: shell mount, snapshot→queue, TaskCard render total, TasksPage render total.

---

## Next phase recommendation

**Priority 1:** `PHASE_TASK_GS_10E_DETAIL_PROVIDER_ISOLATION` — stop panel updates from re-rendering the full task queue (highest leverage, no virtualization needed).

**Priority 2:** `PHASE_TASK_GS_10F_TELEMETRY_CONTEXT_SPLIT` — decouple telemetry publish from TasksPage re-render.

**Conditional:** `PHASE_TASK_GS_10D_QUEUE_VIRTUALIZATION_OPTIONAL` — only if manual metrics show scroll jank or TaskCard renders >300 on typical session with row count approaching 150+.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/workboard/src/shared/utils/renderPerf.ts` | **New** |
| `apps/workboard/src/modules/task/taskFrontendRenderPerformanceChecks.ts` | **New** |
| `apps/workboard/src/main.tsx` | Shell mount marks |
| `apps/workboard/src/modules/task/TasksPage.tsx` | Perf hooks + grouping measure |
| `apps/workboard/src/components/ui/TaskCard.tsx` | Render count |
| `apps/workboard/src/components/ui/OperationalContextPanel.tsx` | Render count |
| `apps/workboard/src/components/ui/TaskControlSurface.tsx` | memo + useMemo |
| `apps/workboard/src/components/runtime/RuntimeStatusBar.tsx` | Lazy drawer |
| `apps/workboard/src/components/runtime/RuntimeFooterDrawer.tsx` | FE diagnostics section |
| `apps/workboard/.env.example` | Perf flag doc |

---

## Acceptance checklist

- [x] Audit file created  
- [x] Render perf instrumentation env-gated  
- [x] Major component render triggers documented  
- [x] Grouping/filter cost documented  
- [x] TaskCard behavior documented  
- [x] Right panel behavior documented  
- [x] Footer clock isolation reviewed  
- [x] No production console spam (flag off)  
- [x] Build PASS  
- [x] Report generated  
- [x] Handoff generated  
