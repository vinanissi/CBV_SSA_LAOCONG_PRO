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
| 6 | STATUS | Text | Yes | NEW \| ASSIGNED \| IN_PROGRESS \| WAITING \| DONE \| CANCELLED \| ARCHIVED; GAS only |
| 7 | PRIORITY | Text | Yes | CAO \| TRUNG_BINH \| THAP |
| 8 | DON_VI_ID | Text | No | Ref DON_VI |
| 9 | OWNER_ID | Text | Yes | Ref USER_DIRECTORY |
| 10 | REPORTER_ID | Text | No | Ref USER_DIRECTORY |
| 11 | SHARED_WITH | Text | No | List ref USER_DIRECTORY; ADMIN only |
| 12 | IS_PRIVATE | Yes/No | No | Default FALSE; ADMIN only |
| 13 | START_DATE | Date | No | |
| 14 | DUE_DATE | Date | No | |
| 15 | DONE_AT | Datetime | No | GAS set when STATUS→DONE |
| 16 | PROGRESS_PERCENT | Number | No | Checklist-derived; GAS set |
| 17 | RESULT_SUMMARY | Text | No | Completion summary |
| 18 | RELATED_ENTITY_TYPE | Text | No | Polymorphic type |
| 19 | RELATED_ENTITY_ID | Text | No | Polymorphic ref |
| 20 | PENDING_ACTION | Text | No | CMD:xxx; AppSheet writes, GAS reads & clears |
| 21 | IS_STARRED | Yes/No | No | AppSheet editable |
| 22 | IS_PINNED | Yes/No | No | AppSheet editable |
| 23 | CREATED_AT | Datetime | No | |
| 24 | CREATED_BY | Text | No | |
| 25 | UPDATED_AT | Datetime | No | |
| 26 | UPDATED_BY | Text | No | |
| 27 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Removed (Do Not Use)

- TASK_TYPE — use TASK_TYPE_ID
- HTX_ID — use DON_VI_ID
- RESULT_NOTE — use RESULT_SUMMARY
- CONTENT — use NOTE field in TASK_UPDATE_LOG

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| TASK_TYPE_ID | MASTER_CODE | MASTER_GROUP=TASK_TYPE |
| DON_VI_ID | DON_VI | Organizational ownership |
| OWNER_ID | USER_DIRECTORY | Assignee |
| REPORTER_ID | USER_DIRECTORY | Creator |
