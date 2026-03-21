# AppSheet Slice & Security Master — CBV_SSA_LAOCONG_PRO

Slices, security filters, role-based visibility.

---

## Slice Definitions

| Slice | Table | Condition |
|-------|-------|-----------|
| HO_SO_ALL | HO_SO_MASTER | [IS_DELETED] = FALSE |
| HO_SO_ACTIVE | HO_SO_MASTER | [STATUS] = "ACTIVE" |
| TASK_OPEN | TASK_MAIN | IN([STATUS], LIST("NEW","ASSIGNED","IN_PROGRESS","WAITING")) |
| TASK_DONE | TASK_MAIN | [STATUS] = "DONE" |
| FIN_DRAFT | FINANCE_TRANSACTION | [STATUS] = "NEW" |
| FIN_CONFIRMED | FINANCE_TRANSACTION | [STATUS] = "CONFIRMED" |

---

## Security Filters (Phase 1)

### HO_SO_MASTER
- ADMIN: `TRUE`
- OPERATOR: `OR([OWNER_ID] = USEREMAIL(), ISBLANK([OWNER_ID]))`
- VIEWER: `TRUE`

### TASK_MAIN
- ADMIN: `TRUE`
- OPERATOR: `OR([OWNER_ID] = USEREMAIL(), [REPORTER_ID] = USEREMAIL())`
- VIEWER: `TRUE`

### FINANCE_TRANSACTION
- ADMIN: `TRUE`
- OPERATOR: `TRUE`
- VIEWER: `TRUE`

**Note:** If UNIT_ID is standardized later, filter by unit.

---

## Admin Security

- **Separate app** for Admin Panel; share only with ADMIN_EMAILS
- Admin tables: ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG
- If same app: slice ADMIN_PANEL_VISIBLE restricts to ADMIN role
- ADMIN_AUDIT_LOG: read-only; no add/edit/delete

---

## Phase 1 Safety Defaults

- ADMIN: full access
- OPERATOR: filter by OWNER_ID or unit where applicable
- VIEWER: read-only
- No role automation beyond AppSheet Account list
