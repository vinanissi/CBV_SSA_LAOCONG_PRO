# User Flow

**Contract:** CBV_WORK_INBOX_V3

---

## Main Flow

```text
Login
  ↓
Inbox
  ↓
Need Action
  ↓
Task Detail
  ↓
Guided Operation
  ↓
Complete / Forward / Pause
  ↓
Back to Inbox
```

**Target:** ≤ 3 clicks từ Inbox tới Task Detail (acceptance).

---

## Deep Link Flow

```text
Task Detail
  ↓
Related Entity
  ↓
HO_SO / FINANCE / DOCS / INVOICE
  ↓
Back to Task
```

Related links dùng route contract (`008_ROUTING_CONTRACT.md`) — không hardcode URL rải rác.

---

## Focus Flow

```text
Inbox
  ↓
Focus Mode
  ↓
One Task Only
  ↓
Complete / Forward / Pause
  ↓
Next Task
```

Progress indicator: `1 / N`  
Exit: quay lại Inbox (không auto-complete).

---

## Search Flow (secondary)

```text
Inbox / TopBar
  ↓
Search (/search)
  ↓
Result group (Công việc, Hồ sơ, …)
  ↓
Deep link module
```

Search **không thay thế** Inbox — công cụ phụ.

---

## Admin Flow

```text
Admin
  ↓
Queue / Health / Audit / Test Console
  ↓
Report / Handoff
```

Operator/User **không** vào flow này mặc định.

---

## Error / degraded flow

```text
Inbox load fail
  ↓
ErrorState + retry
  ↓
(nếu có cache) giữ last good snapshot + warning banner
```

Runtime-first: không blank inbox khi `GO_WITH_WARNINGS` nếu đã có dữ liệu.
