# Layout Spec

**Contract:** CBV_WORK_INBOX_V3

---

## Desktop Layout

```text
┌──────────────┬──────────────────────────────┬────────────────┐
│ Left Nav     │ Work Inbox                    │ Right Panel    │
│              │                              │                │
│ Inbox        │ Dashboard Cards               │ Advanced Filter│
│ Hồ sơ        │ Tabs                          │ Context Panel  │
│ Tài chính    │ Task Groups                   │                │
│ Tài liệu     │ Task Cards                    │                │
│ Điều hành    │                              │                │
└──────────────┴──────────────────────────────┴────────────────┘
```

| Zone | Width (guideline) | Content |
|------|-------------------|---------|
| Left Nav | 240px | Top-level modules |
| Work Inbox | flex-1 | Primary operator surface |
| Right Panel | 320–400px | Advanced filter + context (optional, collapsible) |

---

## Tablet Layout

```text
┌──────────────────────────────┐
│ Top Bar                      │
├──────────────────────────────┤
│ Dashboard Cards              │
├──────────────────────────────┤
│ Task Groups                  │
└──────────────────────────────┘
```

- Right panel → drawer overlay
- Left nav → icon rail hoặc bottom sheet (implementation choice — không đổi IA)

---

## Mobile Layout

```text
┌────────────────────┐
│ Header + Search    │
├────────────────────┤
│ Status Summary     │
├────────────────────┤
│ Need Action        │
├────────────────────┤
│ Waiting            │
├────────────────────┤
│ Bottom Navigation  │
└────────────────────┘
```

- Bottom nav: Inbox | Hồ sơ | Tài chính | Tài liệu | More
- Task detail → full screen route `/task/:id`

---

## Main Screen Sections (Inbox)

1. **Header** — module title, user, notifications
2. **Search** — global search entry (shortcut to `/search`)
3. **Primary action** — e.g. Tạo việc (nếu có quyền)
4. **Status summary** — cards: Quá hạn, Cần làm, Chờ xử lý, Hoàn thành
5. **Simple tabs** — tối đa 5 tab/filter chính (acceptance)
6. **Need Action group**
7. **Waiting group**
8. **Follow Up group**
9. **Completed group** (collapsed default)
10. **Optional Advanced Filter panel** — right panel, không mặc định mở

---

## Layout rules

- Operator không thấy cognition/group-by-status mặc định
- Advanced filter là secondary — không chiếm main canvas
- Primary action luôn visible trên card (Mở xử lý)
- Max 3 click: Inbox → card → task detail (acceptance)

---

## Focus Mode layout override

Khi Focus Mode ON — thay layout Inbox bằng single-task surface (xem `wireframes/focus-mode.md`).
