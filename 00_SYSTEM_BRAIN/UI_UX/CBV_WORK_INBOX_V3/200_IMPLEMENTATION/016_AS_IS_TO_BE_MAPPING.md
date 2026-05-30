# As-Is / To-Be Mapping

## Purpose

Prevent confusion between current runtime and target design.

---

## Route Mapping

| As-Is | To-Be | Note |
|-------|-------|------|
| `/` → OperationalHome | `/` → `/inbox` | Launchpad may remain secondary link |
| `/tasks` | `/inbox` | `/tasks` remains compatibility alias |
| `/tasks/:taskId` | `/task/:id` | Alias during migration |
| `/hoso` | `/ho-so` or list + detail | Phase decision |
| `/observation` | `/admin/health` | Admin guard |
| Cognition grouping (`?group=cognition`) | Inbox groups | Need Action / Waiting / Follow Up / Completed |
| Focus queue dim mode (`focusQueueMode`) | Single-task Focus Mode | One task only |
| Runtime filters (`mine`, `pending`, …) | Simple tabs (≤5) | Advanced filters secondary |
| Desktop-only shell (`min-w 1366`) | Responsive shell | Mobile/tablet required |

---

## UI Language Mapping

| As-Is Term | To-Be Term |
|------------|------------|
| Task | Việc |
| Cognition | Bộ lọc nâng cao (admin/supervisor) |
| Queue | Hàng đợi xử lý |
| Evidence | Tài liệu xử lý |
| Reference board | Hồ sơ liên quan |

---

## Data mapping (snapshot → InboxItem)

| Runtime field | InboxItem field |
|---------------|-----------------|
| `taskId` | `id` |
| `title` | `title` |
| `urgency.isOverdue` | `status: overdue`, `group: need_action` |
| `owner.displayName` | `ownerName` |
| `getTaskNextAction()` | `primaryActionLabel` |

Full adapter logic — Phase B implementation + decision note.

---

## Migration Principle

Do not remove working runtime in one step.

Add target UI layer first, then migrate progressively.

See `015_FRONTEND_IMPLEMENTATION_ROADMAP.md`.
