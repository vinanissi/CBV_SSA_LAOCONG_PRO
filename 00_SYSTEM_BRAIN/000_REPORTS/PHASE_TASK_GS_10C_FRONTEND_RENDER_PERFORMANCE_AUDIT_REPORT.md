# PHASE_TASK_GS_10C — Frontend Render Performance Audit — Report

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~6.3s)  
**Audit:** [`003_AUDIT/TASK_FRONTEND_RENDER_PERFORMANCE_AUDIT.md`](../003_AUDIT/TASK_FRONTEND_RENDER_PERFORMANCE_AUDIT.md)

---

## 1. Executive summary

With Worker/GAS metrics healthy (734ms GAS, worker cache hit, 97 rows, 87KB), this phase **audit-first** mapped where React spends time after snapshot arrival. Primary FE costs are:

1. **Initial mount of ~97 TaskCards** (no virtualization; all groups expanded by default)
2. **DetailProvider cascade** — `setDetail` / `showPanel` re-renders entire App subtree including TasksPage
3. **TaskRuntimeTelemetryProvider** — telemetry publish on snapshot/refresh re-renders all provider children
4. **OperationalContextPanel rebuild** on `inlineExec` and `taskFeedback.feedbackMap` changes

Grouping/filter chain is **already memoized** (`useMemo` + `measureRender`). Footer clock is **isolated** in RuntimeStatusBar (30s interval does not touch TasksPage).

Low-risk fixes applied: perf instrumentation utility, TaskControlSurface memoization, lazy RuntimeFooterDrawer chunk.

**Core answer:** Data arrival is fast; **turning snapshot into 97 DOM cards + context panel** is the remaining FE bottleneck — not Google Sheets.

---

## 2. Measured FE timings

Instrumentation is env-gated (`VITE_CBV_RENDER_PERF_DEBUG=true`). This report does **not** include fake browser numbers.

| Metric | How to collect | Notes |
|--------|----------------|-------|
| FE shell mount | `app-shell-mount` mark | `main.tsx` rAF end |
| TasksPage first render | `tasks-page-first-render` mark | First TasksPage paint |
| Snapshot → queue visible | `snapshot-to-queue` mark | setSnapshot → rAF after flatTasks |
| Task grouping | `taskGrouping` measureRender | Inside useMemo |
| TaskCard renders | `useRenderCount('TaskCard')` | Aggregate counter |
| Context panel renders | `useRenderCount('OperationalContextPanel')` | Per panel mount |
| TasksPage renders | `useRenderCount('TasksPage')` | Includes cascades |

**Runtime console (when debug on):** Runtime Footer → **Frontend render** section shows collected summary + last traceId.

---

## 3. Render count findings (static + architecture)

| Component | Expected cold `/tasks` behavior | Risk |
|-----------|--------------------------------|------|
| TaskCard | ~97× mount (StrictMode ~194 in dev) | High DOM cost |
| TasksPage | 3–8+ renders (snapshot, telemetry, alert defer, optional detail) | Cascade amplifies |
| OperationalContextPanel | 1+ per task select; +1 per feedbackMap change | showPanel effect |
| TaskGroupSection | 1 per group per parent render | memo limits if props stable |
| RuntimeStatusBar | 1 + telemetry updates + 30s clock | Isolated |

---

## 4. Component bottleneck table

See full table in audit file. Top issues:

| Priority | Area | Issue |
|----------|------|-------|
| P1 | TaskCard × 97 | All cards mount synchronously post-snapshot |
| P1 | DetailProvider | Panel updates re-render TasksPage |
| P2 | showPanel + feedbackMap | Full panel JSX rebuild on inline feedback |
| P2 | Telemetry provider | Publish triggers AppShell child re-render |
| P3 | TaskControlSurface | Was redundant sync reads — **fixed** |
| P3 | Bundle | 406KB main JS — no route split |

---

## 5. Grouping/filter analysis

**Chain (all memoized):**

```
snapshot.tasks
  → applyClientFilter(filter)
  → filterTasksByRhythm(rhythmMode)
  → filterTasksByCoordinationQueue(coordinationMode)
  → groupOperationalTasks | groupCognitionTasks
  → flattenTaskGroups → buildSignalCollapseContext
```

- Dependencies stable when filter/quickFocus/groupMode unchanged  
- `measureRender('taskGrouping')` added for debug timing  
- **Duplicate** grouping inside `loadWorkspace().then()` for `recordQueueSize` only — redundant CPU, not user-visible  
- Filter tab change: synchronous full chain recompute — acceptable at 97 rows  

---

## 6. TaskCard analysis

- Already wrapped in `React.memo`  
- No custom `arePropsEqual` — any parent re-render re-evaluates all cards in expanded groups  
- `selectedIndex` keyboard nav sets `selected` on one card; parent TasksPage still re-renders all sections  
- `getTaskFeedback(taskId)` called per card — returns stable reference unless that task's feedback changed  
- `inlineHandlers` stable via `useMemo`  
- **97 cards < 150** — virtualization not implemented (see §12)

---

## 7. Right panel analysis

- Detail loaded lazily via `loadTaskDetail` + 45s client cache (GS_10B)  
- **OperationalContextPanel** mounts TimelineList, FileList, HandoffChain, forms immediately on open — no section lazy  
- `showPanel` creates new `<OperationalContextPanel … />` element and passes to `setDetail`  
- Effect deps: `[inlineExec, detail, initialLoading, showPanel, taskFeedback.feedbackMap]` — feedback on any task rebuilds panel  

---

## 8. Runtime footer analysis

- **Clock:** `RuntimeStatusBar` local `clockTick` every 30s — **does not** live in TasksPage ✓  
- **Telemetry:** TasksPage publishes; provider re-render affects footer + all children (documented)  
- **Drawer:** lazy-loaded chunk `RuntimeFooterDrawer-*.js` (4.20 KB / 0.90 KB gzip) — loads only when Console opened  
- FE perf rows appear in drawer when debug flag enabled and marks collected  

---

## 9. Search/filter analysis

- **Queue filter:** URL `filter` + client `applyClientFilter` — no server round-trip  
- **Quick focus:** local state + memo chain — synchronous  
- **TopBar search:** navigates to `/search?q=` on submit — does not block TasksPage  
- **SearchPage:** API search on `q` change — separate route  
- No debounce needed on TopBar (submit-driven); SearchPage re-fetches on URL change only  

---

## 10. CSS/layout observations

- Fixed runtime footer (`operational-status-bar`) — stable viewport; main scroll in `.operational-main-scroll`  
- `scrollIntoView` on focused task card — can trigger layout on keyboard nav  
- Mobile detail sheet (`xl:hidden` fixed bottom) duplicates panel content — double DOM when narrow  
- No evidence of layout thrash loop; defer `contain: content` on queue until profiling confirms  

---

## 11. Low-risk fixes applied

| Fix | File |
|-----|------|
| Render perf utility (env-gated) | `shared/utils/renderPerf.ts` |
| Shell / TasksPage / grouping marks | `main.tsx`, `TasksPage.tsx` |
| TaskCard + panel render counts | `TaskCard.tsx`, `OperationalContextPanel.tsx` |
| TaskControlSurface memo + useMemo | `TaskControlSurface.tsx` |
| Lazy RuntimeFooterDrawer | `RuntimeStatusBar.tsx` |
| FE section in runtime console | `RuntimeFooterDrawer.tsx` |
| Validation suite | `taskFrontendRenderPerformanceChecks.ts` |
| Env example | `.env.example` |

---

## 12. Recommended next phases

| Phase | Scope |
|-------|-------|
| **PHASE_TASK_GS_10D_QUEUE_VIRTUALIZATION_OPTIONAL** | Only if manual profiling shows jank at 150+ cards or TaskCard render count >300 on common actions |
| **PHASE_TASK_GS_10E_DETAIL_PROVIDER_ISOLATION** | Split DetailProvider so panel state does not re-render TasksPage |
| **PHASE_TASK_GS_10F_TELEMETRY_CONTEXT_SPLIT** | Separate publisher/subscriber contexts to stop telemetry-driven page re-renders |
| **PHASE_TASK_GS_10G_ROUTE_CODE_SPLIT** | `React.lazy` for Finance/HoSo/Coordination modules — shrink initial `/tasks` bundle |

---

## 13. Build result

```
dist/assets/index-e3Igyfww.js                406.10 kB │ gzip: 123.50 kB
dist/assets/RuntimeFooterDrawer-CnQFnFiP.js    4.20 kB │ gzip:   0.90 kB
dist/assets/index-mmu-OzW-.css               105.13 kB │ gzip:  13.21 kB
✓ built in 6.30s
```

`tsc --noEmit` — PASS  
Validation suite: `runTaskFrontendRenderPerformanceChecks()` — 10/10 checks PASS

---

## 14. Known limits

- No headless browser profiling in CI — timings require manual run with `VITE_CBV_RENDER_PERF_DEBUG=true`  
- StrictMode doubles render counts in development  
- Audit does not profile GAS/Worker (covered by GS_10B)  
- Virtualization explicitly deferred  
- DetailProvider / telemetry cascade documented but not refactored (out of scope for low-risk fixes)  

---

## Appendix — validation

```typescript
import { runTaskFrontendRenderPerformanceChecks } from '@/modules/task/taskFrontendRenderPerformanceChecks';
runTaskFrontendRenderPerformanceChecks();
// suite: PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT, status: GO
```
