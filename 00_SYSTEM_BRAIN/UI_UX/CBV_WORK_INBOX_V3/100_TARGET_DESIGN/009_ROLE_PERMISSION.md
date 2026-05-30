# Role Permission

**Contract:** CBV_WORK_INBOX_V3

---

## Roles

```yaml
Admin:
  canViewAllTasks: true
  canViewAdmin: true
  canViewRuntime: true
  canUseTestConsole: true
  canManageUsers: true

Operator:
  canViewInbox: true
  canViewAssignedTasks: true
  canOpenTaskDetail: true
  canOpenRelatedHoSo: true
  canOpenRelatedDocs: true
  canCompleteTask: true
  canForwardTask: true
  canPauseTask: true

User:
  canViewInbox: true
  canViewAssignedTasks: true
  canOpenTaskDetail: true
  canComment: true
```

---

## UI Rule

Operator / User **không thấy** (mặc định):

- Runtime internals
- Test Console
- Audit debug
- Queue admin
- System config
- Cognition grouping controls
- SLA technical breakdown (chỉ label operator-friendly)

Admin mới thấy **Điều hành** (`/admin/*`) trong Left Nav.

---

## Mapping to USER_DIRECTORY (runtime)

| Directory ROLE | V3 role |
|----------------|---------|
| ADMIN | Admin |
| OPERATOR / STAFF | Operator |
| VIEWER | User (read-heavy) |

FE gating là UX layer — API/GAS là authority cuối.

---

## Route guards

| Route | Admin | Operator | User |
|-------|-------|----------|------|
| `/inbox` | ✓ | ✓ | ✓ |
| `/task/:id` | ✓ | ✓ | ✓ |
| `/admin/*` | ✓ | ✗ | ✗ |
| Inline complete/forward | ✓ | ✓ | ✗ comment only |

---

## TASK_MAIN visibility (server)

IS_PRIVATE / SHARED_WITH rules unchanged (production baseline). Inbox chỉ hiển thị task đã được API lọc.
