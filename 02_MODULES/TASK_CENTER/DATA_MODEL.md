# DATA MODEL - TASK_CENTER

**Model:** Task belongs to DON_VI; users are shared across the system.  
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
| 18 | SHARED_WITH | Text | | List USER_DIRECTORY; ADMIN only |
| 19 | IS_PRIVATE | Yes/No | | Default FALSE; ADMIN only |
| 20 | PENDING_ACTION | Text | | CMD:xxx; AppSheet writes; GAS reads & clears |
| 21 | IS_STARRED | Yes/No | | AppSheet editable |
| 22 | IS_PINNED | Yes/No | | AppSheet editable |
| 23 | CREATED_AT | DateTime | | |
| 24 | CREATED_BY | Text | | |
| 25 | UPDATED_AT | DateTime | | |
| 26 | UPDATED_BY | Text | | |
| 27 | IS_DELETED | Yes/No | | Soft delete |

---

## TASK_CHECKLIST

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_ID | Text | → TASK_MAIN | Child of task |
| 3 | ITEM_NO | Number | | Item number |
| 4 | TITLE | Text | | Required |
| 5 | IS_REQUIRED | Yes/No | | Required for completion |
| 6 | IS_DONE | Yes/No | | GAS or action |
| 7 | DONE_AT | DateTime | | GAS set |
| 8 | DONE_BY | Text | → ACTIVE_USERS | Who completed |
| 9 | NOTE | Text | | |
| 10 | CREATED_AT | DateTime | | |
| 11 | CREATED_BY | Text | | |
| 12 | UPDATED_AT | DateTime | | |
| 13 | UPDATED_BY | Text | | |
| 14 | IS_DELETED | Yes/No | | Soft delete |

---

## TASK_ATTACHMENT

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_ID | Text | → TASK_MAIN | Child of task |
| 3 | SOURCE_MODE | Enum | | UPLOAD \| LINK \| DRIVE |
| 4 | ATTACHMENT_TYPE | Enum | | TASK_ATTACHMENT_TYPE |
| 5 | TITLE | Text | | |
| 6 | FILE_NAME | Text | | Original filename |
| 7 | UPLOAD_FILE | File | | AppSheet file upload |
| 8 | FILE_URL | Text/File | | URL or legacy file column |
| 9 | FILE_EXT | Text | | Extension; GAS set |
| 10 | DRIVE_FILE_ID | Text | | Internal |
| 11 | LINK_DOMAIN | Text | | Domain when SOURCE_MODE=LINK; GAS set |
| 12 | SORT_ORDER | Number | | Display order |
| 13 | STATUS | Enum | | ACTIVE \| ARCHIVED |
| 14 | NOTE | Text | | |
| 15 | CREATED_AT | DateTime | | |
| 16 | CREATED_BY | Text | | |
| 17 | UPDATED_AT | DateTime | | |
| 18 | UPDATED_BY | Text | | |
| 19 | IS_DELETED | Yes/No | | Soft delete |

---

## TASK_UPDATE_LOG

| # | Column | Type | Ref | Notes |
|---|--------|------|-----|-------|
| 1 | ID | Text | Key | System key |
| 2 | TASK_ID | Text | → TASK_MAIN | Child of task |
| 3 | UPDATE_TYPE | Enum | | NOTE \| QUESTION \| ANSWER \| STATUS_CHANGE |
| 4 | ACTION | Text | | Action code (e.g. taskStart, taskComplete) |
| 5 | OLD_STATUS | Text | | Trạng thái trước khi đổi |
| 6 | NEW_STATUS | Text | | Trạng thái sau khi đổi |
| 7 | NOTE | Text | | Ghi chú thêm |
| 8 | ACTOR_ID | Text | → ACTIVE_USERS | Who performed |
| 9 | CREATED_AT | DateTime | | |
| 10 | CREATED_BY | Text | | |
| 11 | UPDATED_AT | DateTime | | |
| 12 | UPDATED_BY | Text | | |
| 13 | IS_DELETED | Yes/No | | Soft delete |

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
