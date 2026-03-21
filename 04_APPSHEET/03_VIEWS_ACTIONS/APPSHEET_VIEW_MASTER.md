# AppSheet View Master — CBV_SSA_LAOCONG_PRO

Canonical view design: list/detail/form/inline by module.

---

## View Architecture Principles

1. **LIST/TABLE** — Browsing; slice-filtered
2. **DETAIL** — Record context; inline children
3. **FORM** — Create/edit; controlled field exposure
4. **INLINE** — Child records under parent; 3–5 columns
5. **Log tables** — Read-only; no Add

---

## HO_SO Module

| View | Type | Table | Slice | Purpose |
|------|------|-------|-------|---------|
| HO_SO_LIST | Table | HO_SO_MASTER | HO_SO_ALL | Browse |
| HO_SO_DETAIL | Detail | HO_SO_MASTER | HO_SO_ALL | Record + inline |
| HO_SO_FORM | Form | HO_SO_MASTER | — | Create/edit |
| HO_SO_FILE_INLINE | Inline | HO_SO_FILE | — | Under HO_SO_DETAIL |
| HO_SO_RELATION_INLINE | Inline | HO_SO_RELATION | — | Under HO_SO_DETAIL |
| HO_SO_FILE_FORM | Form | HO_SO_FILE | — | Child add |
| HO_SO_RELATION_FORM | Form | HO_SO_RELATION | — | Child add |

---

## TASK Module

| View | Type | Table | Slice | Purpose |
|------|------|-------|-------|---------|
| TASK_LIST | Table | TASK_MAIN | TASK_OPEN | Browse |
| TASK_DETAIL | Detail | TASK_MAIN | — | Task + inline |
| TASK_FORM | Form | TASK_MAIN | — | Create/edit |
| TASK_CHECKLIST_INLINE | Inline | TASK_CHECKLIST | — | Under TASK_DETAIL |
| TASK_ATTACHMENT_INLINE | Inline | TASK_ATTACHMENT | — | Under TASK_DETAIL |
| TASK_LOG_INLINE | Inline | TASK_UPDATE_LOG | — | Under TASK_DETAIL (read-only) |
| TASK_CHECKLIST_FORM | Form | TASK_CHECKLIST | — | Child add |
| TASK_ATTACHMENT_FORM | Form | TASK_ATTACHMENT | — | Child add |

---

## FINANCE Module

| View | Type | Table | Slice | Purpose |
|------|------|-------|-------|---------|
| FINANCE_LIST | Table | FINANCE_TRANSACTION | FIN_DRAFT or FIN_CONFIRMED | Browse |
| FINANCE_DETAIL | Detail | FINANCE_TRANSACTION | — | Transaction + inline |
| FINANCE_FORM | Form | FINANCE_TRANSACTION | — | Create/edit |
| FIN_ATTACHMENT_INLINE | Inline | FINANCE_ATTACHMENT | — | Under FINANCE_DETAIL |
| FIN_LOG_INLINE | Inline | FINANCE_LOG | — | Under FINANCE_DETAIL (read-only) |
| FINANCE_ATTACHMENT_FORM | Form | FINANCE_ATTACHMENT | — | Child add |

---

## Admin (Separate App)

| View | Type | Table | Purpose |
|------|------|-------|---------|
| ENUM_LIST, ENUM_DETAIL, ENUM_FORM | Table, Detail, Form | ENUM_DICTIONARY | Enum management |
| MASTER_CODE_LIST, MASTER_CODE_DETAIL, MASTER_CODE_FORM | Table, Detail, Form | MASTER_CODE | Master code management |
| ADMIN_AUDIT_LOG_LIST, ADMIN_AUDIT_LOG_DETAIL | Table, Detail | ADMIN_AUDIT_LOG | Read-only audit |

---

## Inline Filters

| Inline | Filter |
|--------|--------|
| HO_SO_FILE | [HO_SO_ID] = [HO_SO_MASTER].[ID] |
| HO_SO_RELATION | OR([FROM_HO_SO_ID]=current, [TO_HO_SO_ID]=current) |
| TASK_CHECKLIST | [TASK_ID] = [TASK_MAIN].[ID] |
| TASK_ATTACHMENT | [TASK_ID] = [TASK_MAIN].[ID] |
| TASK_UPDATE_LOG | [TASK_ID] = [TASK_MAIN].[ID] |
| FINANCE_ATTACHMENT | [FINANCE_ID] = [FINANCE_TRANSACTION].[ID] |
| FINANCE_LOG | [FIN_ID] = [FINANCE_TRANSACTION].[ID] |

---

## What to Hide from Users

- ID, CREATED_*, UPDATED_*, IS_DELETED
- DRIVE_FILE_ID, BEFORE_JSON, AFTER_JSON
- Parent ref when inline (auto-linked)
