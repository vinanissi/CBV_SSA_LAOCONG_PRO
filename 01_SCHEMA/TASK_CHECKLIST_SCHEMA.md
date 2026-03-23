# TASK_CHECKLIST Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Checklist items for tasks. Completion tracked via IS_DONE, DONE_AT, DONE_BY.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | TASK_ID | Text | Yes | Ref TASK_MAIN |
| 3 | ITEM_NO | Number | No | Display order |
| 4 | TITLE | Text | Yes | Checklist item |
| 5 | IS_REQUIRED | Yes/No | No | Required for completion |
| 6 | IS_DONE | Yes/No | No | Completion status |
| 7 | DONE_AT | Datetime | No | When done |
| 8 | DONE_BY | Text | No | Ref USER_DIRECTORY |
| 9 | NOTE | Text | No | |
| 10 | CREATED_AT | Datetime | No | |
| 11 | CREATED_BY | Text | No | |
| 12 | UPDATED_AT | Datetime | No | |
| 13 | UPDATED_BY | Text | No | |
| 14 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Removed

- DESCRIPTION

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| TASK_ID | TASK_MAIN | Parent task |
| DONE_BY | USER_DIRECTORY | Who marked done |
