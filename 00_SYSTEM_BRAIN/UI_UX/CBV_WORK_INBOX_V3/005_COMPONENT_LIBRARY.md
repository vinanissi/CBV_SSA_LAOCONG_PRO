# Component Library

**Contract:** CBV_WORK_INBOX_V3

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Shell: nav + main + optional right panel |
| `LeftNav` | Top-level module navigation |
| `TopBar` | Search, create, notification, user |
| `GlobalSearch` | Search input → `/search` |
| `StatusSummaryCard` | Quá hạn / Cần làm / Chờ / Hoàn thành counts |
| `InboxTabs` | Simple tabs (≤5) |
| `InboxGroup` | Need Action, Waiting, Follow Up, Completed |
| `TaskCard` | Single actionable row |
| `StatusChip` | Operator-facing status |
| `PrimaryActionButton` | Mở xử lý |
| `SecondaryActionButton` | Xem chi tiết, Chuyển tiếp, … |
| `AdvancedFilterPanel` | Optional right panel |
| `TaskDetailPanel` | Full task detail surface |
| `FocusModePanel` | Single-task focus UI |
| `EmptyState` | Zero results |
| `LoadingState` | Skeleton |
| `ErrorState` | Error + retry |

---

## TaskCard Contract

```ts
export interface TaskCardModel {
  id: string;
  code?: string;
  title: string;
  status: 'overdue' | 'today' | 'waiting' | 'follow_up' | 'completed';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  assigneeName?: string;
  ownerName?: string;
  dueLabel?: string;
  dueDate?: string;
  module?: 'TASK' | 'HO_SO' | 'FINANCE' | 'DOCS' | 'INVOICE';
  relatedEntityId?: string;
  primaryActionLabel: string;
  primaryActionHref: string;
}
```

### Mapping from runtime (`TaskItem`)

| TaskCardModel | Runtime source |
|---------------|----------------|
| `id` | `taskId` |
| `code` | optional display code (not USER_CODE as title) |
| `title` | `title` |
| `status` | derived from `urgency` + `status` |
| `assigneeName` / `ownerName` | `UserRef.displayName` |
| `primaryActionLabel` | `getTaskNextAction()` label |
| `primaryActionHref` | `/task/:id` or guided operation route |

---

## Status Chips

| Chip | Meaning |
|------|---------|
| 🔴 Quá hạn | `overdue` |
| 🟠 Cần làm hôm nay | `today` |
| 🟡 Chờ xử lý | `waiting` |
| 🔵 Theo dõi | `follow_up` |
| 🟢 Hoàn thành | `completed` |
| ⚪ Trung tính | neutral / low urgency |

---

## Inbox Groups

| Group | Icon | Label |
|-------|------|-------|
| Need Action | 🔥 | Cần làm ngay |
| Waiting | 🟡 | Chờ xử lý |
| Follow Up | 👀 | Theo dõi |
| Missing profile | 📁 | Hồ sơ thiếu (cross-link HO_SO) |
| Completed | ✅ | Đã hoàn thành gần đây |

---

## Action Buttons

**Primary:**

- Mở xử lý

**Secondary:**

- Xem chi tiết
- Chuyển tiếp
- Tạm dừng
- Hoàn thành

---

## Implementation note

Existing `apps/workboard` components (`TaskCard`, `TaskControlSurface`, …) may be adapted — rename/wrap toward this contract in implementation phase. Do not break current runtime until migration gate passes.
