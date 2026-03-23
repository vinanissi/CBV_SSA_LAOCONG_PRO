# TASK_UPDATE_LOG Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Audit log for task changes. GAS writes rows; AppSheet read-only.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | TASK_ID | Text | Yes | Ref TASK_MAIN |
| 3 | UPDATE_TYPE | Text | Yes | Type of update |
| 4 | ACTION | Text | Yes | Action code |
| 5 | OLD_STATUS | Text | No | Previous STATUS |
| 6 | NEW_STATUS | Text | No | New STATUS |
| 7 | NOTE | Text | No | Log note |
| 8 | ACTOR_ID | Text | Yes | Ref USER_DIRECTORY |
| 9 | CREATED_AT | Datetime | Yes | |
| 10 | CREATED_BY | Text | No | |
| 11 | UPDATED_AT | Datetime | No | |
| 12 | UPDATED_BY | Text | No | |
| 13 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Removed

- CONTENT
