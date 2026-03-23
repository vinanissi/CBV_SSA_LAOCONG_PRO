# TASK_MAIN Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Core task table. Non-hybrid final design. Links to DON_VI, MASTER_CODE (TASK_TYPE), and USER_DIRECTORY.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | TASK_CODE | Text | No | Display code |
| 3 | TITLE | Text | Yes | Task name |
| 4 | DESCRIPTION | Text | No | Task details |
| 5 | TASK_TYPE_ID | Text | Yes | Ref MASTER_CODE (MASTER_GROUP=TASK_TYPE) |
| 6 | STATUS | Text | Yes | NEW \| IN_PROGRESS \| DONE \| CANCELLED |
| 7 | PRIORITY | Text | Yes | CAO \| TRUNG_BINH \| THAP |
| 8 | OWNER_ID | Text | Yes | Ref USER_DIRECTORY |
| 9 | REPORTER_ID | Text | No | Ref USER_DIRECTORY |
| 10 | DON_VI_ID | Text | No | Ref DON_VI |
| 11 | RELATED_ENTITY_TYPE | Text | No | Polymorphic type |
| 12 | RELATED_ENTITY_ID | Text | No | Polymorphic ref |
| 13 | START_DATE | Date | No | |
| 14 | DUE_DATE | Date | No | |
| 15 | DONE_AT | Datetime | No | When completed |
| 16 | RESULT_SUMMARY | Text | No | Completion summary |
| 17 | PROGRESS_PERCENT | Number | No | Checklist-derived |
| 18 | CREATED_AT | Datetime | No | |
| 19 | CREATED_BY | Text | No | |
| 20 | UPDATED_AT | Datetime | No | |
| 21 | UPDATED_BY | Text | No | |
| 22 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Removed (Do Not Use)

- TASK_TYPE — use TASK_TYPE_ID
- HTX_ID — use DON_VI_ID
- RESULT_NOTE — use RESULT_SUMMARY

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| TASK_TYPE_ID | MASTER_CODE | MASTER_GROUP=TASK_TYPE |
| DON_VI_ID | DON_VI | Organizational ownership |
| OWNER_ID | USER_DIRECTORY | Assignee |
| REPORTER_ID | USER_DIRECTORY | Creator |
