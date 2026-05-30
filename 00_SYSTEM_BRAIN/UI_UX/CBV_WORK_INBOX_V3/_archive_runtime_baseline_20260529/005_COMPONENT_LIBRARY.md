# CBV_WORK_INBOX_V3 — Component Library

**Version:** V3.0 · **Date:** 2026-05-29  
**Source tree:** `apps/workboard/src/components/`

---

## 1. Layout components

### AppShell

| Prop | Type | Notes |
|------|------|-------|
| `user` | `UserContext` | Required |
| `children` | `ReactNode` | Page content |
| `onLogout` | `() => void` | Optional |

Wraps TopBar, Sidebar, main scroll, DetailPanel, RuntimeStatusBar.

### TopBar

Search form, module title, ThemeToggle, user chip, logout.  
`onSearchNavigate(q)` → `/search?q=` or clear.

### Sidebar

Module launchpad from `useModuleRegistry`. Quick link: Quá hạn → `/tasks?filter=overdue`.

### DetailPanel + DetailProvider

Context API: `setDetail(title, content)`, `clearDetail()`.  
Must wrap routes using detail (TasksPage).

### RuntimeStatusBar

Publishes/consumes task runtime telemetry. Fixed footer.

---

## 2. Work Inbox — control components

### TaskControlSurface

| Prop | Type | Required |
|------|------|----------|
| `activeFilter` | `TaskFilter` | yes |
| `groupMode` | `GroupMode` | yes |
| `quickFocus` | `QuickFocusFilter` | yes |
| `focusQueueMode` | `boolean` | no |
| `teamPressure` | `OwnerPressure[]` | no |
| `currentTaskId` | `string \| null` | no |
| `filterFeedback` | `string \| null` | no |
| `queueSummary` | `string` | no |
| `onFilterChange` | `(f) => void` | yes |
| `onGroupModeChange` | `(m) => void` | yes |
| `onQuickFocusChange` | `(f) => void` | yes |
| `onFocusQueueModeChange` | `(b) => void` | no |
| `onResumeTask` | `(id) => void` | no |

**CSS classes:** `operational-control-strip`, `task-filter-tab`, `task-filter-tab-active`

### GroupModeSelect

Toggle `cognition` | `status`.

### QuickFocusFilters

Chip group for quick focus filters. Shows team pressure badge when overloaded owners detected.

### OperationalAlertHeader

Conditional banner for stale/degraded/runtime warnings on task workspace.

---

## 3. Work Inbox — queue components

### TaskGroupedList / TaskGroupSection

Renders grouped tasks with section headers. Supports inline execution state per card.

### TaskCard

| State class | Meaning |
|-------------|---------|
| `task-card-focused` | Selected task |
| `task-card-dimmed` | Non-focus in focus queue mode |
| `task-card-pending-exec` | Inline action in flight |
| `task-card-focus-mode` | Focus queue styling |
| `task-signal-*` | Left border signal (hot, overdue, waiting, blocked) |
| `signal-pattern-*` | Collapsed signal patterns |

**Key props:** task item, `isFocused`, `focusQueueMode`, `inlineExec`, handlers.

### TaskListSkeleton

Initial load placeholder — matches card scan row height.

---

## 4. Work Inbox — context components

### OperationalContextPanel

Detail panel body: next step, SLA, people, timeline, files.

### InlineQuickActions

Quick action buttons filtered by `filterQuickActionsByIdentity`.

### MicroUpdateStrip / HandoffChain / InlineHandoffStrip

Coordination and micro-update flows — append-only UI feedback.

### NextStepCompletionPrompt

Post-action prompt for next operator step.

### ExecutionMemoryStrip

Shows recent execution context in control strip.

---

## 5. Shared UI primitives

| Component | Use in inbox |
|-----------|--------------|
| `StatusBadge` | Status/priority chips |
| `RuntimeFeedbackMessage` | API error/success with retry |
| `WorkQueue` | Search results wrapper |
| `FileList` | Attachments in detail |
| `CompactRuntimeCounters` | Status bar metrics |
| `ThemeToggle` | Light/dark in TopBar |
| `EmptyState` | Zero results |
| `ErrorState` | Fatal load error |
| `LoadingState` | Search loading |

---

## 6. Button tiers

| Class | Use |
|-------|-----|
| `btn-primary` | Primary page actions |
| `btn-ghost` | Secondary / close |
| `btn-card-action` | Passive card actions |
| `inline-action-primary` | Card primary exec (accept/complete) |
| `focus-chip-active` / `focus-chip-muted` | Quick focus chips |

---

## 7. Component composition — TasksPage

```
TasksPage
├── OperationalAlertHeader
├── TaskControlSurface
├── [TaskListSkeleton | ErrorState | EmptyState | TaskGroupedList]
├── RuntimeFeedbackMessage (inline exec feedback)
└── (DetailPanel via context — OperationalContextPanel)
```

---

## 8. Component rules

1. **Memoization:** `TaskControlSurface`, `TaskCard` use `memo` — preserve referential stability for handlers.
2. **No new top-level panels** without layout spec update.
3. **Display names:** always via `userDisplay` / `resolveRuntimeUser` — never hardcode USER_CODE in JSX.
4. **Accessibility:** filter tabs use `role="tablist"`; feedback uses `aria-live="polite"`.
5. **Markers:** preserve `data-filter` attributes on filter tabs for test probes.

---

## 9. File path index

| Component | Path |
|-----------|------|
| AppShell | `components/layout/AppShell.tsx` |
| TasksPage | `modules/task/TasksPage.tsx` |
| TaskCard | `components/ui/TaskCard.tsx` |
| TaskControlSurface | `components/ui/TaskControlSurface.tsx` |
| OperationalContextPanel | `components/ui/OperationalContextPanel.tsx` |
| FocusStrip | `components/ui/FocusStrip.tsx` |
| RuntimeStatusBar | `components/runtime/RuntimeStatusBar.tsx` |

---

## 10. Out of scope components

Do not introduce in V3 inbox without phase approval:

- Kanban board column
- Calendar view
- Bulk select checkbox column
- Chat/comments thread
