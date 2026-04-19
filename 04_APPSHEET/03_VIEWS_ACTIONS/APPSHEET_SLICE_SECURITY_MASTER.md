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
| TASK_MY_OPEN | TASK_MAIN | AND(OR(USERROLE() = "ADMIN", [OWNER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), [REPORTER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))), IN([STATUS], LIST("NEW","ASSIGNED","IN_PROGRESS","WAITING"))) |
| TASK_MY_TASKS | TASK_MAIN | OR([OWNER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), [REPORTER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))) |
| FIN_DRAFT | FINANCE_TRANSACTION | [STATUS] = "NEW" |
| FIN_CONFIRMED | FINANCE_TRANSACTION | [STATUS] = "CONFIRMED" |

---

## Security Filters (Phase 1)

### HO_SO_MASTER
- ADMIN: `TRUE`
- OPERATOR: `OR([OWNER_ID] = USEREMAIL(), ISBLANK([OWNER_ID]))`
- VIEWER: `TRUE`

### TASK_MAIN
- ADMIN: `TRUE` (override — ADMIN thấy tất cả)
- ALL ROLES (single filter):
  `OR(
    USERROLE() = "ADMIN",
    NOT([IS_PRIVATE]),
    AND(
      [IS_PRIVATE],
      OR(
        [OWNER_ID]    = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
        [REPORTER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
        CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))
      )
    )
  )`

Note: Dùng `ANY()` thay `FIRST()`. Dùng `CONTAINS([SHARED_WITH], …)` cho List column. `IS_PRIVATE=FALSE` → mọi user thấy; `IS_PRIVATE=TRUE` → chỉ ADMIN + OWNER + REPORTER + SHARED_WITH.

### FINANCE_TRANSACTION
- ADMIN: `TRUE`
- OPERATOR: `TRUE`
- VIEWER: `TRUE`

**Note:** Filter by organizational unit using **DON_VI_ID** (DON_VI), not generic master-code “unit” columns.

---

## AppSheet Formula Syntax — Validated

- `ANY(SELECT(...))` — dùng thay `FIRST(SELECT(...))` trong filter/security context
- `CONTAINS(list_col, value)` — dùng cho List column, không dùng `IN(value, list_col)`
- `IN(value, LIST(...))` — hợp lệ với List literal

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
