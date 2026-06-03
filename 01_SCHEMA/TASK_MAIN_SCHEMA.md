# TASK_MAIN Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Core task table. Non-hybrid final design. Links to DON_VI, MASTER_CODE (TASK_TYPE), and USER_DIRECTORY.

---

## Key contract (locked)

| Role | Column | Notes |
|------|--------|-------|
| **Physical primary key** | `ID` | Canonical parent key for all child `TASK_ID` FKs |
| Display / business code | `TASK_CODE` | Not a foreign-key target |
| Runtime DTO | `taskId` | API/GAS/FE field name; **value = `ID`** |

**There is no `TASK_MAIN.TASK_ID` column.** Child tables store the parent id in their own `TASK_ID` column referencing `TASK_MAIN.ID`. See `03_SHARED/TASK_KEY_CONTRACT.md` and `03_SHARED/DATA_REL_AUTHORITY_INDEX.md`.

**Column order:** matches `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` → `TASK_MAIN` (production baseline includes visibility columns).

---

## Columns (Canonical Order — manifest-aligned)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Physical PK; runtime `taskId` |
| 2 | TASK_CODE | Text | No | Display code |
| 3 | TITLE | Text | Yes | Task name |
| 4 | DESCRIPTION | Text | No | Task details |
| 5 | TASK_TYPE_ID | Text | Yes | Ref MASTER_CODE (MASTER_GROUP=TASK_TYPE) |
| 6 | STATUS | Text | Yes | NEW \| ASSIGNED \| IN_PROGRESS \| DONE \| CANCELLED \| ARCHIVED |
| 7 | PRIORITY | Text | Yes | CAO \| TRUNG_BINH \| THAP |
| 8 | DON_VI_ID | Text | Yes (create) | Ref DON_VI — `assertActiveDonViId` on GAS write |
| 9 | OWNER_ID | Text | Yes | Ref USER_DIRECTORY — `assertActiveUserId` |
| 10 | REPORTER_ID | Text | No | Ref USER_DIRECTORY |
| 11 | SHARED_WITH | Text (list) | No | Comma-separated USER_DIRECTORY.ID; AppSheet security |
| 12 | IS_PRIVATE | Yes/No | No | Default false/blank; see `04_APPSHEET/APPSHEET_SECURITY_FILTERS.md` |
| 13 | START_DATE | Date | No | |
| 14 | DUE_DATE | Date | No | |
| 15 | DONE_AT | Datetime | No | When completed |
| 16 | PROGRESS_PERCENT | Number | No | Checklist-derived |
| 17 | RESULT_SUMMARY | Text | No | Completion summary |
| 18 | RELATED_ENTITY_TYPE | Text | No | Polymorphic type |
| 19 | RELATED_ENTITY_ID | Text | No | Polymorphic ref |
| 20 | CREATED_AT | Datetime | No | |
| 21 | CREATED_BY | Text | No | |
| 22 | UPDATED_AT | Datetime | No | |
| 23 | UPDATED_BY | Text | No | |
| 24 | IS_STARRED | Yes/No | No | |
| 25 | IS_PINNED | Yes/No | No | |
| 26 | IS_DELETED | Yes/No | Yes | Soft delete |
| 27 | PENDING_ACTION | Text | No | Operator queue hint |

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
| SHARED_WITH | USER_DIRECTORY | List of IDs; visibility — `05_GAS_RUNTIME/45_SHARED_WITH_SERVICE.js` |

See also: `03_SHARED/USER_TASK_FINANCE_MAPPING.md`, `03_SHARED/DATA_REL_AUTHORITY_INDEX.md`.
