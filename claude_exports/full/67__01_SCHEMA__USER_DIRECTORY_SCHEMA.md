# USER_DIRECTORY Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Canonical user table. Users are global; they do NOT depend on HTX or DON_VI.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key; UD_YYYYMMDD_<6-8 chars> |
| 2 | USER_CODE | Text | Yes | Machine-safe |
| 3 | FULL_NAME | Text | Yes | Canonical human name |
| 4 | DISPLAY_NAME | Text | No | UI override |
| 5 | EMAIL | Text | No | Contact |
| 6 | PHONE | Text | No | Contact |
| 7 | ROLE | Text | Yes | ADMIN \| OPERATOR \| VIEWER |
| 8 | POSITION | Text | No | Job title |
| 9 | STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| 10 | IS_SYSTEM | Yes/No | No | System-seeded |
| 11 | ALLOW_LOGIN | Yes/No | No | Can sign in |
| 12 | NOTE | Text | No | Admin note |
| 13 | CREATED_AT | Datetime | No | |
| 14 | CREATED_BY | Text | No | |
| 15 | UPDATED_AT | Datetime | No | |
| 16 | UPDATED_BY | Text | No | |
| 17 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Independence

- USER_DIRECTORY has no DON_VI_ID or HTX_ID.
- Users are system-wide.
- Organizational assignment is via TASK_MAIN.DON_VI_ID, DON_VI.MANAGER_USER_ID, etc.

---

## References (Inbound)

| Ref Field | Table | Notes |
|-----------|-------|-------|
| TASK_MAIN.OWNER_ID | USER_DIRECTORY | Assignee |
| TASK_MAIN.REPORTER_ID | USER_DIRECTORY | Creator |
| TASK_CHECKLIST.DONE_BY | USER_DIRECTORY | Who marked done |
| FINANCE_TRANSACTION.CONFIRMED_BY | USER_DIRECTORY | Who confirmed |
| DON_VI.MANAGER_USER_ID | USER_DIRECTORY | Unit manager |
| HO_SO_MASTER.OWNER_ID | USER_DIRECTORY | File owner |

---

## ACTIVE_USERS View

Filter: `STATUS = "ACTIVE" AND IS_DELETED = FALSE`

Used for Valid_If on OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY, MANAGER_USER_ID.
