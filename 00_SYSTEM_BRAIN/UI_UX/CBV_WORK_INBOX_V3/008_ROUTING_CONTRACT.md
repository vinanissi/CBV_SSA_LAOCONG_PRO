# Routing Contract

**Contract:** CBV_WORK_INBOX_V3

---

## Required Routes

```ts
export const ROUTES = {
  home: '/',
  inbox: '/inbox',
  taskDetail: '/task/:id',
  hoSoDetail: '/ho-so/:id',
  financeDetail: '/finance/:id',
  docsDetail: '/docs/:id',
  invoiceDetail: '/invoice/:id',
  search: '/search',
  admin: '/admin',
  adminQueue: '/admin/queue',
  adminHealth: '/admin/health',
  adminAudit: '/admin/audit',
  adminTestConsole: '/admin/test-console',
};
```

---

## Redirect

```text
/ -> /inbox
```

---

## Deep Link Rules

Task detail must support links to:

- HO_SO → `/ho-so/:id`
- FINANCE → `/finance/:id`
- DOCS → `/docs/:id`
- INVOICE → `/invoice/:id`

Use `relatedEntityId` + `module` from `TaskCardModel` — build via central link builder (no scattered hardcode).

---

## Forbidden

- Không hardcode module URL rải rác
- Không tạo route mới ngoài contract nếu chưa có decision note
- Không đưa Operator vào Admin route khi thiếu quyền

---

## Migration aliases (transitional)

During `PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION`:

| Alias | Canonical |
|-------|-----------|
| `/tasks` | `/inbox` (301/redirect) |
| `/tasks/:id` | `/task/:id` |
| `/hoso/:id` | `/ho-so/:id` |

Remove aliases only after Test Console + UAT sign-off.

---

## Search route

```text
/search?q={query}
```

Placeholder TopBar: `Tìm kiếm toàn cục...`

---

## Guard rules

| Route prefix | Guard |
|--------------|-------|
| `/admin` | `canViewAdmin` |
| `/inbox`, `/task` | `canViewInbox` |
| `/search` | authenticated |

See `009_ROLE_PERMISSION.md`.
