# TASK — Operational Filter Runtime Audit

**Phase:** `PHASE_TASK_GS_10D_OPERATIONAL_FILTER_RUNTIME_FIX`  
**Date:** 2026-05-28  
**Scope:** Filter tabs · group mode · quick focus · focus toggle · queue derivation

---

## Root cause summary (pre-fix)

| Issue | Impact |
|-------|--------|
| Filter logic inline in TasksPage without single contract | Hard to verify semantics; approval overlapped pending (`WAITING` in both) |
| `isMine` relied on server flag only | Owner/reporter ID mismatch → “Việc của tôi” empty while other tabs show data |
| No operator-unknown handling for `mine` | Silent empty or confusing UX |
| `focusQueueMode` visual-only | Toggle changed card density but not queue rows — felt broken |
| No filter-change feedback | Active tab changed but operator couldn't see queue/count confirmation |
| Selected task not cleared when filtered out | Panel showed task not in list |
| Invalid URL filter values not normalized | Stale/invalid `?filter=` could noop |
| `setSearchParams({ filter, group })` replaced params | Lost other query keys (minor) |

---

## Audit table

| Control | File | State variable | Handler | Expected behavior | Actual issue (pre-fix) | Fix |
|---------|------|----------------|---------|-------------------|------------------------|-----|
| Việc của tôi | `TaskControlSurface` | URL `filter=mine` | `selectFilter('mine')` | Tasks owned/reported by current operator | `isMine` only; ID mismatch | `isTaskMineForOperator` + degraded warning if no operator |
| Chờ xử lý | `TaskControlSurface` | `filter=pending` | `selectFilter('pending')` | NEW/ASSIGNED/IN_PROGRESS/WAITING (not approval) | Overlap with approval tab | `isTaskPendingAction` excludes WAITING_APPROVAL |
| Quá hạn | `TaskControlSurface` | `filter=overdue` | `selectFilter('overdue')` | dueDate &lt; today OR urgency overdue | Only `isOverdue` flag | `isTaskOverdue` adds dueDate check |
| Chờ duyệt | `TaskControlSurface` | `filter=approval` | `selectFilter('approval')` | WAITING_APPROVAL only | Included WAITING | Approval = WAITING_APPROVAL only |
| Hiển thị theo / Cognition | `GroupModeSelect` | URL `group=cognition\|status` | `selectGroupMode` | Changes grouping lanes | Worked but no feedback | `groupTasksForMode` + feedback strip |
| Quick focus chips | `QuickFocusFilters` | `quickFocus` state | `selectQuickFocus` | Rhythm + coordination sub-filter | Worked but invisible when stacked | Centralized in `deriveVisibleTaskRuntime` + feedback |
| Focus toggle | `TaskControlSurface` | `focusQueueMode` | `toggleFocusQueue` | Hide passive noise | CSS-only, same row count | `applyFocusQueueFilter` + collapse passive groups |
| Queue list | `TasksPage` | `deriveVisibleTaskRuntime` | useMemo | Rows match filter | Fragmented useMemo chain | Single derivation utility |
| Count summary | `TaskGroupedList` header | `summaryText` | derived | “N việc · M nhóm” | Manual string in JSX | From `deriveVisibleTaskRuntime` |
| Empty state | `EmptyState` | `emptyTitle/Message` | derived | Per-filter honest message | Generic `EMPTY_COPY.tasks` | `emptyCopyForFilter` |
| Selected task | `TasksPage` effect | `taskId` route | auto on filter change | Clear panel if filtered out | Task stayed open | Navigate to `/tasks?…` + message |
| URL sync | `TasksPage` | `searchParams` | `updateSearchParams` | filter+group in URL | Replaced all params | Merge with existing params, `replace: true` |
| Debug | `taskFilterDebug.ts` | env flag | `logTaskFilterChange` | Structured log when enabled | None | `VITE_CBV_FILTER_DEBUG=true` |

---

## Filter semantics (verified mapping)

| Tab | Includes | Excludes |
|-----|----------|----------|
| **mine** | owner/reporter matches operator (ID/code/display fallback) or `isMine===true` | DONE/CANCELLED; all if operator unknown |
| **pending** | NEW, ASSIGNED, IN_PROGRESS, WAITING | DONE, CANCELLED, WAITING_APPROVAL |
| **overdue** | `isOverdue`, `urgency.isOverdue`, or `dueDate < today` | DONE, CANCELLED |
| **approval** | WAITING_APPROVAL | Other statuses |

**Cognition groups:** act_now · quick_win · waiting_response · waiting_approval · batchable · monitor · awareness (existing `taskCognitionGrouping.ts`).

**Focus mode:** keeps ACTION_NOW + HIGH_ATTENTION tasks; pins selected task if filtered would remove it; collapses awareness/monitor/upcoming groups.

---

## Queue derivation contract

See `shared/utils/taskFilterRuntime.ts`:

```
snapshot.tasks
  → applyTaskFilter(filter, operator)
  → filterTasksByRhythm(quickFocus)
  → filterTasksByCoordinationQueue(quickFocus)
  → applyFocusQueueFilter(focusMode)
  → groupTasksForMode(groupMode)
  → flatten → summaryText / counts / warnings
```

---

## Selected task decision

**When filtered out:** clear detail panel, navigate to `/tasks?<filter>&group=…`, show inline message  
“Việc đang chọn không thuộc bộ lọc hiện tại — đã đóng panel.”

No auto-select first task (avoids surprise navigation).

---

## Manual verification

```powershell
cd apps/workboard
$env:VITE_CBV_FILTER_DEBUG="true"
npm run dev
```

Test each tab, cognition/status, quick focus, focus toggle, filter-out selection.
