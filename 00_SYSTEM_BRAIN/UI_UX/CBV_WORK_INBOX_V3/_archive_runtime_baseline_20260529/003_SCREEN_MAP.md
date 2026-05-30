# CBV_WORK_INBOX_V3 — Screen Map

**Version:** V3.0 · **Date:** 2026-05-29

---

## 1. Screen inventory

| Screen ID | Route | Component | Channel | Pilot |
|-----------|-------|-----------|---------|-------|
| `WI_V3_INBOX_LIST` | `/tasks` | `TasksPage` | WEBAPP | yes |
| `WI_V3_INBOX_FOCUSED` | `/tasks/:taskId` | `TasksPage` + selection | WEBAPP | yes |
| `WI_V3_INBOX_FILTERED` | `/tasks?filter=&group=` | `TasksPage` | WEBAPP | yes |
| `WI_V3_SEARCH` | `/search?q=` | `SearchPage` | WEBAPP | yes |
| `WI_V3_SHELL` | all AppShell routes | `AppShell` | WEBAPP | yes |

Related (out of scope but linked):

| Screen ID | Route | Notes |
|-----------|-------|-------|
| `WI_V3_HOME` | `/` | OperationalHome launchpad |
| `WI_V3_COORDINATION` | `/coordination` | Unassigned / handoff queue |
| `WI_V3_MODULE` | `/m/:slug` | iframe/runtime module container |

---

## 2. Work Inbox screen — zones

### WI_V3_INBOX_LIST (default)

```
┌─────────────────────────────────────────────────────────────┐
│ TopBar: module title · search · user · theme · logout        │
├──────┬──────────────────────────────────────────┬───────────┤
│ Side │ OperationalAlertHeader (conditional)        │           │
│ bar  │ TaskControlSurface (filters/group/focus)  │ Detail    │
│      │ TaskGroupedList (queue)                     │ Panel     │
│      │                                             │ (xl+)     │
├──────┴──────────────────────────────────────────┴───────────┤
│ RuntimeStatusBar                                            │
└─────────────────────────────────────────────────────────────┘
```

### WI_V3_INBOX_FOCUSED

Same layout; selected task:
- Highlighted card (`task-card-focused`)
- DetailPanel populated via `useDetailPanel`
- URL contains `:taskId`
- Keyboard: j/k or arrow nav between cards (if implemented)

### WI_V3_INBOX_FILTERED

Same as list; URL query drives:
- `filter` → active tab
- `group` → cognition | status

---

## 3. Screen states

| State | Visual | Trigger |
|-------|--------|---------|
| `loading_initial` | TaskListSkeleton | First snapshot fetch |
| `loading_refresh` | Subtle refresh indicator in status bar | Soft reload |
| `ready` | Full queue | `snapshot` populated |
| `empty_filter` | EmptyState | Zero visible after filter |
| `error` | ErrorState | `ok: false` envelope |
| `degraded` | Queue + warning banner | `GO_WITH_WARNINGS` |
| `focus_queue` | Compressed control strip + dimmed non-focus cards | `focusQueueMode=true` |
| `inline_exec` | Card pending state + feedback strip | Active inline action |

---

## 4. Responsive behavior

| Breakpoint | Layout |
|------------|--------|
| ≥ 1366px (min shell) | Full desktop — sidebar + list + detail panel |
| ≥ 1280px (xl) | Detail panel visible (`xl:flex`) |
| < 1280px | Detail panel → bottom sheet overlay |
| < 1366px | Horizontal scroll allowed (`min-w-[1366px]` on shell) — tablet/mobile are secondary |

See `wireframes/` for breakpoint-specific ASCII.

---

## 5. Screen ownership matrix

| Concern | Owner screen | Must not duplicate |
|---------|--------------|-------------------|
| Task CRUD form | AppSheet | WebApp detail |
| Inline status change | WI_V3_INBOX | — |
| Global search results | WI_V3_SEARCH | Inbox list |
| Module catalog | WI_V3_HOME / Sidebar | Inbox header |
| Runtime health | `/observation` | Status bar only shows task telemetry |

---

## 6. Screen → component map

| Zone | Primary components |
|------|-------------------|
| Alert | `OperationalAlertHeader`, `OperationalAlertStrip` |
| Controls | `TaskControlSurface`, `GroupModeSelect`, `QuickFocusFilters` |
| Queue | `TaskGroupedList`, `TaskGroupSection`, `TaskCard` |
| Context | `OperationalContextPanel`, `DetailPanel` |
| Feedback | `RuntimeFeedbackMessage`, `NextStepCompletionPrompt` |
| Status | `RuntimeStatusBar`, `RuntimeTelemetryInline` |
| States | `TaskListSkeleton`, `EmptyState`, `ErrorState` |

---

## 7. Future screens (document only — not V3 scope)

| Screen ID | Notes |
|-----------|-------|
| `WI_V3_KANBAN` | Advanced view — WEBAPP only, not pilot |
| `WI_V3_TIMELINE` | Cross-task timeline — observation module |
| `WI_V3_NOTIFICATIONS` | RF02 stub — not implemented in local FE |

Do not implement these under V3 without explicit phase prompt.
