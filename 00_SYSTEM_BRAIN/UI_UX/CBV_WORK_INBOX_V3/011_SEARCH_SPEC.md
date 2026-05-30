# Search Spec

**Contract:** CBV_WORK_INBOX_V3

---

## Purpose

Global Search giúp tìm nhanh:

- Task
- Hồ sơ
- Tài chính
- Tài liệu
- Hóa đơn
- Xã viên
- Phương tiện

---

## Search Placeholder

```text
Tìm kiếm toàn cục...
```

---

## Search Result Groups

| Group | Module |
|-------|--------|
| Công việc | TASK → `/task/:id` |
| Hồ sơ | HO_SO → `/ho-so/:id` |
| Tài chính | FINANCE → `/finance/:id` |
| Tài liệu | DOCS → `/docs/:id` |
| Hóa đơn | INVOICE → `/invoice/:id` |

---

## Result Item Must Include

- Title
- Type (chip)
- Status
- Primary action
- Related module link

---

## Search Rules

- Search **không thay thế** Inbox
- Search là **công cụ phụ**
- Search result phải **deep-link** được
- Route: `/search?q={encodedQuery}`

---

## API

Envelope `{ ok, data: { results[] }, warnings, errors, traceId }` — runtime-first.  
FE không filter quyền client-side thay server.

---

## Empty / error

| Case | UX |
|------|-----|
| No query | Hint: nhập từ khóa |
| Zero results | EmptyState |
| API error | ErrorState + retry |
