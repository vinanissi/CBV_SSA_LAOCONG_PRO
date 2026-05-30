# Information Architecture

**Contract:** CBV_WORK_INBOX_V3

---

## Primary Entry

Default entry must be:

```text
/inbox
```

Không vào thẳng TASK, FINANCE, HO_SO hay DOCS.

---

## Top-level Navigation

```text
📥 Inbox
👥 Hồ sơ
💰 Tài chính
📚 Tài liệu
⚙️ Điều hành
```

---

## Module Positioning

| Module | Vai trò |
|--------|---------|
| **Inbox** | Cửa trước vận hành |
| **Task** | Đơn vị xử lý |
| **HO_SO** | Dữ liệu hồ sơ |
| **FINANCE** | Dữ liệu tài chính |
| **DOCS** | Tài liệu |
| **INVOICE** | Hóa đơn |
| **ADMIN** | Runtime / control / audit / test |

---

## Main IA

```text
CBV Workspace
│
├── Inbox
│   ├── Need Action
│   ├── Waiting
│   ├── Follow Up
│   └── Completed
│
├── Task Detail
│   ├── Information
│   ├── Guided Operation
│   ├── Related Documents
│   ├── Timeline
│   └── Comments
│
├── Ho So
├── Finance
├── Docs
├── Invoice
└── Admin
```

---

## Inbox grouping semantics

| Group | Operator meaning |
|-------|------------------|
| **Need Action** | Việc cần xử lý ngay (quá hạn, hôm nay, actionable) |
| **Waiting** | Chờ phản hồi / chờ duyệt / blocked phía ngoài |
| **Follow Up** | Theo dõi — chưa cần hành động ngay |
| **Completed** | Hoàn thành gần đây (collapsed mặc định) |

---

## Relationship to current runtime

Repo hiện tại (`apps/workboard`) dùng `/tasks` và filter `mine|pending|overdue|approval`.  
Migration sang IA trên là **target V3** — map trong phase implementation:

| V3 group | Gợi ý map từ runtime hiện tại |
|----------|-------------------------------|
| Need Action | overdue + pending actionable |
| Waiting | pending waiting / approval |
| Follow Up | follow-up slice (derived) |
| Completed | terminal statuses |

---

## Cross-module deep links

Task Detail → HO_SO / FINANCE / DOCS / INVOICE qua `relatedEntityId` + module type — không nhúng form module trong Inbox.
