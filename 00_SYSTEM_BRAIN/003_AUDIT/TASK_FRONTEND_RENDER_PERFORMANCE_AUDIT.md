# TASK — Frontend Render Performance Audit

**Phase:** `PHASE_TASK_GS_10C_FRONTEND_RENDER_PERFORMANCE_AUDIT`  
**Date:** 2026-05-28  
**Scope:** `apps/workboard/` — React render path after Worker/GAS snapshot arrives  
**Baseline runtime (console):** GAS ~734ms · worker cache hit · 97 rows · 87KB payload · health warning

---

## Core question

> Sau khi data đã về, React mất bao lâu để biến snapshot thành UI vận hành?

Backend path (GS_10B) is no longer the primary bottleneck. This audit maps **FE render triggers, cost, and evidence** so the next phase optimizes the right layer.

---

## Render path (post-snapshot)

```
Worker snapshot JSON arrives
  → TasksPage setSnapshot
  → enrichTasksUserFieldsFromDirectory (4 task arrays)
  → useMemo chain: filter → rhythm → coordination → group → flat → signalContext
  → TaskGroupedList → TaskGroupSection (memo) → TaskCard × N (memo)
  → publishRuntimeTelemetry → TaskRuntimeTelemetryProvider re-render (all children)
  → (parallel) OperationalAlertHeader secondary feeds
  → (lazy) loadTaskDetail on route param
  → showPanel → DetailProvider setDetail → OperationalContextPanel + Timeline/File/Handoff
```

---

## Audit table

| Area | Component/File | Render trigger | Estimated cost | Evidence | Issue | Recommendation |
|------|----------------|----------------|----------------|----------|-------|----------------|
| App shell | `App.tsx` / `main.tsx` | Auth resolve, user load | Low (~50–150ms) | Single mount; StrictMode doubles dev renders | No perf marks before GS_10C | **Done** — `app-shell-mount` mark in `main.tsx` when debug on |
| AppShell | `components/layout/AppShell.tsx` | Parent (DetailProvider / telemetry provider) state | Low–Med | Static layout; children include TasksPage + DetailPanel + footer | Re-renders when sibling DetailProvider updates | **Defer** — split DetailProvider to isolate panel subtree (GS_10D+) |
| TasksPage | `modules/task/TasksPage.tsx` | snapshot, filter, quickFocus, inlineExec, detail, telemetry publish, showPanel effect | **High** | 15+ state hooks; `useRenderCount('TasksPage')` | Telemetry publish + DetailProvider cascade re-render full page | **Partial** — instrumentation added; isolate telemetry consumer (defer) |
| TaskControlSurface | `components/ui/TaskControlSurface.tsx` | Parent TasksPage; execMemoryTick | Med (was High) | Was: sync reads every parent render | `getExecutionMemorySummary`, `buildResumeFlowSnapshot`, `getRecentTasks` on every TasksPage render | **Fixed** — `memo` + `useMemo` keyed on `execMemoryTick` |
| OperationalAlertHeader | `components/ui/OperationalAlertHeader.tsx` | API today/coordination, snapshotOverdueCount, expand strip | Med | Deferred until snapshot (GS_10B) | Expand/collapse is local — does not re-render queue | OK — keep deferred feeds |
| TaskGroupSection | `components/ui/TaskGroupSection.tsx` | group prop, focusedTaskId, inlineExec, collapsed toggle | Med per section | `memo()` wrapper | All expanded groups map full task list | OK at 97 rows; monitor >150 |
| TaskCard | `components/ui/TaskCard.tsx` | task prop, selected/focused, inlineExec, actionFeedback | **High × N** | `memo()` without custom comparator; 97 cards mount at once | `selectedIndex` keyboard nav updates `selected` on one card but parent re-render touches all sections; `getTaskFeedback()` per card | **Done** — render count instrumented; **Defer** custom memo compare / virtualization |
| OperationalContextPanel | `components/ui/OperationalContextPanel.tsx` | showPanel rebuild, detail, inlineExec, feedbackMap | **High** | Many runtime utils per render; Timeline + File + Handoff always mounted | `useEffect` in TasksPage re-calls `showPanel` on `taskFeedback.feedbackMap` → new React element tree | **Defer** — panel feedback subscription without full showPanel rebuild |
| TimelineList | `components/ui/TimelineList.tsx` | detail.timeline, showAllTimeline | Med | Renders up to 8 default items | No memo; re-renders with panel | **Defer** — memo when panel split |
| HandoffChain | `components/ui/HandoffChain.tsx` | detail handoff chain build | Low–Med | Built in panel render | Collapsed sections still in DOM | **Defer** — lazy section mount |
| FileList | `components/ui/FileList.tsx` | detail.attachments | Low–Med | List map | Always rendered in panel | OK for typical attachment count |
| RuntimeStatusBar | `components/runtime/RuntimeStatusBar.tsx` | telemetry context, clockTick 30s, drawerOpen | Low | Clock `setInterval` 30s local only | Does **not** force TasksPage re-render | **Done** — clock isolated; drawer lazy-loaded |
| RuntimeFooterDrawer | `components/runtime/RuntimeFooterDrawer.tsx` | open=true, telemetry | Low | Separate chunk 4.2KB gzip 0.9KB | Only loads when console opened | **Done** — `React.lazy` + Suspense |
| SearchPage | `modules/task/SearchPage.tsx` | URL `q` param, API search | Low (off /tasks path) | Server search on mount/query change | No debounce on URL (TopBar submits on Enter) | OK — separate route |
| TopBar | `components/layout/TopBar.tsx` | location, module registry, search input | Low | Local query state | Search navigates away — no queue filter recompute | OK |
| Sidebar | `components/layout/Sidebar.tsx` | user, location | Low | Static nav links | No task list coupling | OK |
| DetailProvider | `components/layout/DetailPanel.tsx` | setDetail / clearDetail | **High cascade** | New context value object every provider render | `setDetail` re-renders **all** DetailProvider children including TasksPage | **Defer** — portal or panel-only provider (GS_10D+) |
| Task grouping | `shared/utils/taskGrouping.ts` + TasksPage useMemo | filter, quickFocus, groupMode, snapshot | Low–Med (~1–5ms @97) | `measureRender('taskGrouping')` when debug on | Duplicate grouping in `loadWorkspace().then()` for metrics only | **Done** — useMemo chain; remove duplicate in future cleanup |
| Filter/search | TasksPage URL params + TopBar | filter tab, quickFocus, group | Med on change | Full useMemo chain recomputes | No `useDeferredValue`; synchronous on tab click | OK at 97 rows; consider defer if >150 |
| Bundle | `app/routes.tsx` | Initial load | Med | Main chunk **406KB** (123KB gzip); no route lazy | TasksPage + all modules in one bundle | **Defer** — route-based code split (separate phase) |
| CSS/layout | `styles/index.css` | focus scrollIntoView, footer fixed | Low–Med | `scrollIntoView` on focus; fixed footer padding | Possible layout shift on mobile detail sheet | **Defer** — `contain` on queue column |

---

## Instrumentation (GS_10C)

| Tool | Location | Flag |
|------|----------|------|
| `renderPerf.ts` | `shared/utils/renderPerf.ts` | `VITE_CBV_RENDER_PERF_DEBUG=true` |
| Shell mount | `main.tsx` | same |
| TasksPage / grouping / snapshot→queue | `TasksPage.tsx` | same |
| TaskCard / Context panel counts | respective components | same |
| Runtime console FE section | `RuntimeFooterDrawer.tsx` | same (when metrics collected) |

When flag **off**: zero console output, counters not incremented, no runtime impact.

---

## Virtualization decision

| Criterion | Value | Action |
|-----------|-------|--------|
| TaskCard count | 97 | Below 150 threshold |
| Scroll jank | Not confirmed in automated run | Manual verify with perf flag |
| Render cost | Dominated by initial mount of ~97 cards, not grouping | Monitor |

**Recommendation:** Do **not** virtualize in GS_10C. If manual testing shows jank at 150+ rows, open **`PHASE_TASK_GS_10D_QUEUE_VIRTUALIZATION_OPTIONAL`**.

---

## Low-risk fixes applied (GS_10C)

1. `renderPerf.ts` — env-gated instrumentation API  
2. `TaskControlSurface` — `memo` + `useMemo` for context chip reads  
3. `RuntimeFooterDrawer` — lazy import (separate Vite chunk)  
4. Runtime console — Frontend render diagnostics section (when debug enabled)

---

## Must not change yet

- DetailProvider architecture (wide re-render cascade)  
- TaskRuntimeTelemetryProvider placement (telemetry update re-renders AppShell children)  
- showPanel / feedbackMap effect pattern  
- Task data contract / API shapes  
- Queue virtualization  
- UI layout / feature removal  

---

## Manual measurement checklist

```bash
VITE_CBV_RENDER_PERF_DEBUG=true npm run dev
```

1. Cold open `/tasks` — record shell + queue marks in console.debug  
2. Select 5 tasks — watch `OperationalContextPanel` render count  
3. Toggle Focus / filter tabs — watch `TasksPage:filters` marks  
4. Expand alert strip — confirm queue render count stable  
5. Open runtime console — FE render section populated  
6. `npm run build` — PASS

---

## Related phases

| Phase | Focus |
|-------|-------|
| GS_10B | GAS/Worker/shell-first (done) |
| **GS_10C** | FE render audit (this) |
| GS_10D (proposed) | DetailProvider isolation + optional queue virtualization |
| GS_10E (proposed) | Route lazy loading + panel section memo |
