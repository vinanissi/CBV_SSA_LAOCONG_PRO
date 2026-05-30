# Screen Map

**Contract:** CBV_WORK_INBOX_V3

---

## Public / Operator Screens

```text
/inbox
/task/:id
/ho-so/:id
/finance/:id
/docs/:id
/invoice/:id
/search
```

---

## Admin Screens

```text
/admin
/admin/queue
/admin/health
/admin/audit
/admin/test-console
/admin/settings
```

---

## Default Route

```text
/ -> /inbox
```

---

## Route Rule

Operator không được bị đưa vào admin/runtime screen trừ khi có quyền.

---

## Screen inventory

| Screen ID | Route | Audience |
|-----------|-------|----------|
| `WI_V3_INBOX` | `/inbox` | Operator, User |
| `WI_V3_TASK_DETAIL` | `/task/:id` | Operator, User |
| `WI_V3_HOSO_DETAIL` | `/ho-so/:id` | Operator (scoped) |
| `WI_V3_FINANCE_DETAIL` | `/finance/:id` | Operator (scoped) |
| `WI_V3_DOCS_DETAIL` | `/docs/:id` | Operator (scoped) |
| `WI_V3_INVOICE_DETAIL` | `/invoice/:id` | Operator (scoped) |
| `WI_V3_SEARCH` | `/search` | All authenticated |
| `WI_V3_ADMIN_*` | `/admin/*` | Admin only |

---

## Screen states (Inbox)

| State | UX |
|-------|-----|
| loading | Status summary skeleton + group skeleton |
| ready | Groups populated |
| empty | EmptyState per group |
| error | ErrorState + retry |
| focus_mode | Single-task surface (see `010_FOCUS_MODE_SPEC.md`) |

---

## Legacy routes (reference — do not delete without migration)

| Legacy | Target V3 |
|--------|-----------|
| `/tasks` | `/inbox` (alias redirect during migration) |
| `/tasks/:id` | `/task/:id` |
| `/hoso` | `/ho-so` list or deep link only |
| `/finance` | module list |
| `/observation` | `/admin/health` (admin) |

Ghi chú: xem `_archive_runtime_baseline_20260529/008_ROUTING_CONTRACT.md` cho contract runtime hiện tại.
