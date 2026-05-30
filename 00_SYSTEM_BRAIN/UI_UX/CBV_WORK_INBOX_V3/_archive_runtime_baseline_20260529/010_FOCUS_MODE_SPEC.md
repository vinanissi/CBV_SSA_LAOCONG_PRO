# CBV_WORK_INBOX_V3 — Focus Mode Specification

**Version:** V3.0 · **Date:** 2026-05-29  
**Implementation:** `focusQueueMode.ts`, `TaskControlSurface`, `quickFocusFilters.ts`, `deriveVisibleTaskRuntime`

---

## 1. Terminology

| Term | Meaning |
|------|---------|
| **Focus Queue Mode** | Session toggle that dims non-active cards and compresses control strip |
| **Quick Focus** | Client filter chips (actionable, blocked, team, resume, all) |
| **Focused task** | Currently selected task (`task-card-focused`) |
| **Pinned task** | Task in URL `/tasks/:taskId` — stays visible in focus queue |

These are **distinct** mechanisms that compose together.

---

## 2. Focus Queue Mode

### Activation

- Toggle button in `TaskControlSurface`
- `aria-pressed={focusQueueMode}`
- Title: *"Focus queue — ẩn việc nền, giữ signal thực thi"*

### Persistence

| Key | Storage | Values |
|-----|---------|--------|
| `cbv_focus_queue_mode` | sessionStorage | `'1'` enabled, `'0'` disabled |

Also saved in working context: `saveTaskWorkingContext({ focusQueueMode })`.

### Visual behavior

| Element | Normal | Focus queue ON |
|---------|--------|----------------|
| Control strip | Full | `operational-control-focus` — compressed |
| Context row (resume/recent) | Visible | **Hidden** |
| Non-focused cards | Normal | `task-card-dimmed` |
| Focused/pinned card | `task-card-focused` | Full opacity + `task-card-focus-mode` |
| Card operational line | sm | sm (unchanged) |

### Runtime logic

`deriveVisibleTaskRuntime({ focusQueueMode, pinnedTaskId })`:
- Pinned task always in visible set
- Dimming is CSS-only — tasks remain in DOM for keyboard nav
- Queue summary may update to reflect focus context

---

## 3. Quick Focus filters

### Values (`QuickFocusFilter`)

| Value | Label (approx) | Narrows to |
|-------|----------------|------------|
| `all` | Tất cả | No quick filter |
| `actionable` | Cần xử lý | Tasks with next action for operator |
| `blocked` | Bị chặn | `urgency.isBlocked` |
| `team` | Nhóm | Team/supervisor scope |
| `resume` | Tiếp tục | Interrupted / resume flow tasks |

### Persistence

Stored in working context (`loadTaskWorkingContext` / `saveTaskWorkingContext`), not URL.

### UI

Component: `QuickFocusFilters`  
Container: `role="group" aria-label="Quick focus"`  
Active chip: `focus-chip-active`; inactive: `focus-chip-muted`

### Team pressure integration

When `computeTeamPressure()` detects overloaded owners:
- Pressure indicator on team chip
- Does not auto-switch filter — operator must click

---

## 4. Focus Strip (global — non-task routes)

`FocusStrip` on routes **other than** `/tasks`:
- Shows cross-module attention counts (overdue, GPLX, finance, unassigned)
- Hidden on task workspace to avoid duplicate with inbox filters

**Do not** show FocusStrip on `/tasks` — inbox has its own control surface.

---

## 5. Focused task selection

### Selection sources (priority)

1. URL param `:taskId`
2. Detail panel open task
3. Keyboard selection index
4. `selectedTaskIdRef` internal

### Card classes

```
task-card-focused     — selected
task-card-dimmed      — focus queue mode, not selected
task-card-focus-mode  — focus queue styling on card
```

---

## 6. Group mode interaction

| Group mode | Focus queue behavior |
|------------|---------------------|
| `cognition` | Groups preserved; dimming within groups |
| `status` | Same — focus mode does not change grouping |

Quick focus intersects with active filter before grouping.

---

## 7. Operator flows (focus)

### Enter focus queue during execution

1. Select task → open detail
2. Enable focus queue toggle
3. Execute inline action on focused card
4. Complete → optionally disable focus queue or move to next

### Supervisor team focus

1. Set quick focus = `team`
2. Filter = `pending` (default landing)
3. Review overloaded owners via pressure chips
4. Optional: focus queue for single-task drill-down

---

## 8. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Toggle state | `aria-pressed` on focus queue button |
| Filter tabs | `role="tablist"`, `aria-selected` |
| Dimmed cards | Still focusable via keyboard |
| Live updates | Filter feedback via `aria-live="polite"` |

---

## 9. Anti-patterns

- Auto-enabling focus queue on task select (must be explicit toggle)
- Hiding filtered-out tasks in focus queue (use dim, not remove)
- Persisting focus queue to URL (session only in V3)
- Replacing primary filter tabs with quick focus chips

---

## 10. Acceptance checks

| # | Criterion |
|---|-----------|
| 1 | Toggle survives page refresh within same tab session |
| 2 | Toggle clears on new browser session |
| 3 | Pinned task visible when focus queue ON |
| 4 | Context row hidden when focus queue ON |
| 5 | Quick focus + filter = intersection not union |
| 6 | FocusStrip absent on `/tasks` route |

---

## 11. Related utilities

| File | Purpose |
|------|---------|
| `shared/utils/focusQueueMode.ts` | Session load/save/toggle |
| `shared/utils/quickFocusFilters.ts` | Quick focus types + legacy mapping |
| `shared/utils/workingContext.ts` | Persist operator rhythm |
| `shared/utils/taskFilterRuntime.ts` | `deriveVisibleTaskRuntime` |
| `shared/utils/flowResume.ts` | Resume snapshot for resume quick focus |
