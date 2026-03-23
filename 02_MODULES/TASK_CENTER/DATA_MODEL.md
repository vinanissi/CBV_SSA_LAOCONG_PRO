# DATA MODEL - TASK_CENTER

**Model:** Task belongs to HTX; users are shared across the system.  
**Consolidated reference:** 02_MODULES/TASK_CENTER/TASK_SYSTEM_REFERENCE.md

---

## TASK_MAIN

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_CODE | Text | | Business code; GAS may generate |
| 3 | TITLE | Text | | Required |
| 4 | DESCRIPTION | Text | | |
| 5 | TASK_TYPE_ID | Text | Ref MASTER_CODE | MASTER_GROUP=TASK_TYPE |
| 6 | STATUS | Enum | | TASK_STATUS; GAS action only |
| 7 | PRIORITY | Enum | | TASK_PRIORITY |
| 8 | DON_VI_ID | Text | → ACTIVE_DON_VI | Task organizational unit |
| 9 | OWNER_ID | Text | → ACTIVE_USERS | Assignee |
| 10 | REPORTER_ID | Text | → ACTIVE_USERS | Creator |
| 11 | START_DATE | Date | | |
| 12 | DUE_DATE | Date | | |
| 13 | DONE_AT | DateTime | | GAS set |
| 14 | PROGRESS_PERCENT | Number | | Checklist-derived |
| 15 | RESULT_SUMMARY | Text | | Completion summary |
| 16 | RELATED_ENTITY_TYPE | Enum | | RELATED_ENTITY_TYPE |
| 17 | RELATED_ENTITY_ID | Text | Polymorphic | By type |
| 18 | CREATED_AT | DateTime | | |
| 19 | CREATED_BY | Text | | |
| 20 | UPDATED_AT | DateTime | | |
| 21 | UPDATED_BY | Text | | |
| 22 | IS_DELETED | Yes/No | | Soft delete |

---

## TASK_CHECKLIST

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_ID | Text | → TASK_MAIN | Child of task |
| 3 | ITEM_NO | Number | | Item number |
| 4 | TITLE | Text | | Required |
| 5 | DESCRIPTION | Text | | |
| 6 | IS_REQUIRED | Yes/No | | Required for completion |
| 7 | IS_DONE | Yes/No | | GAS or action |
| 8 | DONE_AT | DateTime | | GAS set |
| 9 | DONE_BY | Text | → ACTIVE_USERS | Who completed |
| 10 | NOTE | Text | | |
| 11 | CREATED_AT | DateTime | | |
| 12 | CREATED_BY | Text | | |
| 13 | UPDATED_AT | DateTime | | |
| 14 | UPDATED_BY | Text | | |
| 15 | IS_DELETED | Yes/No | | Soft delete |

---

## TASK_ATTACHMENT

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_ID | Text | → TASK_MAIN | Child of task |
| 3 | ATTACHMENT_TYPE | Enum | | TASK_ATTACHMENT_TYPE |
| 4 | TITLE | Text | | |
| 5 | FILE_URL | Text/File | | AppSheet Type = File |
| 6 | DRIVE_FILE_ID | Text | | Internal |
| 7 | NOTE | Text | | |
| 8 | CREATED_AT | DateTime | | |
| 9 | CREATED_BY | Text | | |
| 10 | UPDATED_AT | DateTime | | |
| 11 | UPDATED_BY | Text | | |
| 12 | IS_DELETED | Yes/No | | Soft delete |

---

## TASK_UPDATE_LOG

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_ID | Text | → TASK_MAIN | Child of task |
| 3 | UPDATE_TYPE | Enum | | NOTE, QUESTION, ANSWER, STATUS_CHANGE |
| 4 | CONTENT | Text | | Log content |
| 5 | ACTOR_ID | Text | → ACTIVE_USERS | Who performed |
| 6 | CREATED_AT | DateTime | | |
| 7 | CREATED_BY | Text | | |
| 8 | UPDATED_AT | DateTime | | |
| 9 | UPDATED_BY | Text | | |
| 10 | IS_DELETED | Yes/No | | Soft delete |

---

## Ref Summary

| From | Column | To |
|------|--------|-----|
| TASK_MAIN | DON_VI_ID | DON_VI (ACTIVE_DON_VI) |
| TASK_MAIN | OWNER_ID | USER_DIRECTORY (ACTIVE_USERS) |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY (ACTIVE_USERS) |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY (ACTIVE_USERS) |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY (ACTIVE_USERS) |
