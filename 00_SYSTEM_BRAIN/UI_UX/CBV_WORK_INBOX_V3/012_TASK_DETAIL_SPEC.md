# Task Detail Spec

**Contract:** CBV_WORK_INBOX_V3

---

## Required Sections

```text
Header
Meta
Tabs
Action Panel
Related Documents
Timeline
Comments
```

---

## Required Tabs

| Tab | Content |
|-----|---------|
| Thông tin | Title, code, status, priority, assignee, due |
| Hướng dẫn | Guided operation steps (operator language) |
| Tài liệu | Related files / uploads link |
| Lịch sử | Append-only timeline |
| Bình luận | Comments (manual-first) |

---

## Header Must Show

- Task title
- Task code
- Status (chip)
- Priority
- Assignee
- Due date

---

## Required Actions

- Mở xử lý
- Hoàn thành
- Chuyển tiếp
- Tạm dừng
- Thêm tài liệu
- Bình luận

Primary actions visible without scrolling on desktop.

---

## Related Module Links

- Hồ sơ liên quan → `/ho-so/:id`
- Tài chính liên quan → `/finance/:id`
- Tài liệu liên quan → `/docs/:id`
- Hóa đơn liên quan → `/invoice/:id`

---

## Forbidden

- Không để task detail chỉ là form dữ liệu
- Không bắt user hiểu runtime state
- Không ẩn hành động chính
- Không hiển thị traceId / raw JSON cho Operator mặc định

---

## Route

```text
/task/:id
```

Legacy alias: `/tasks/:id` during migration.

---

## Responsive

| Breakpoint | Layout |
|------------|--------|
| Desktop | Tabs + right action panel |
| Mobile | Full screen; tabs scroll horizontal |
| Tablet | Same as mobile or stacked tabs |
