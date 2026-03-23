# TASK_MAIN Schema

**Canonical:** See 01_SCHEMA/TASK_MAIN_SCHEMA.md for final spec. Final design uses TASK_TYPE_ID and DON_VI_ID; no TASK_TYPE, no HTX_ID.

## Sheet
TASK_MAIN

## Design Source
- 06_DATABASE/DON_VI_SCHEMA.md
- 06_DATABASE/USER_DIRECTORY_SCHEMA.md
- 03_SHARED/ENUM_DICTIONARY_STANDARD.md

## Purpose
Core task table. Links to organizational unit (DON_VI), task type (MASTER_CODE), and owner (USER_DIRECTORY). Supports workflow states NEW → IN_PROGRESS → DONE | CANCELLED.

---

## Business Fields

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| TITLE | Text | Yes | Task name |
| TASK_TYPE_ID | Text | Yes | Ref MASTER_CODE (MASTER_GROUP=TASK_TYPE) |
| PRIORITY | Text | Yes | CAO, TRUNG_BINH, THAP |
| OWNER_ID | Text | Yes | Ref USER_DIRECTORY (assignee) |
| DON_VI_ID | Text | No | Ref DON_VI (organizational ownership) |
| START_DATE | Date | No | Planned start |
| DUE_DATE | Date | No | Deadline |
| DESCRIPTION | Text | No | Task details |

---

## System Fields

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key, TASK_YYYYMMDD_<6-8 chars> |
| STATUS | Text | Yes | NEW, IN_PROGRESS, DONE, CANCELLED |
| REPORTER_ID | Text | No | Ref USER_DIRECTORY (creator) |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| DONE_AT | Datetime | No | Completed at (when STATUS=DONE) |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| TASK_MAIN.TASK_TYPE_ID | MASTER_CODE | MASTER_GROUP = TASK_TYPE |
| TASK_MAIN.DON_VI_ID | DON_VI | Organizational unit |
| TASK_MAIN.OWNER_ID | USER_DIRECTORY | Assignee; ACTIVE_USERS |
| TASK_MAIN.REPORTER_ID | USER_DIRECTORY | Creator; ACTIVE_USERS |

---

## PRIORITY Enum

| Value | Display |
|-------|---------|
| CAO | Cao |
| TRUNG_BINH | Trung bình |
| THAP | Thấp |

---

## Workflow (STATUS)

| Value | Display | Next Allowed |
|-------|---------|--------------|
| NEW | Mới | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | Đang thực hiện | DONE, CANCELLED |
| DONE | Hoàn thành | — |
| CANCELLED | Đã hủy | — |

---

## Validation Rules

1. ID is system key and must be stable.
2. TASK_TYPE_ID must reference valid MASTER_CODE row with MASTER_GROUP=TASK_TYPE.
3. DON_VI_ID when provided must reference valid DON_VI row.
4. OWNER_ID must reference active USER_DIRECTORY (STATUS=ACTIVE, IS_DELETED=FALSE).
5. REPORTER_ID when provided must reference active USER_DIRECTORY.
6. STATUS transitions enforced by GAS; AppSheet displays only.
7. When STATUS=DONE, DONE_AT should be set.

---

## ENUM_GROUP Usage

| ENUM_GROUP | Table.Column |
|------------|--------------|
| TASK_TYPE | MASTER_CODE (MASTER_GROUP=TASK_TYPE) |
| TASK_STATUS | TASK_MAIN.STATUS |
| TASK_PRIORITY | TASK_MAIN.PRIORITY |

---

## Child Tables

| Child | Ref | Parent |
|-------|-----|--------|
| TASK_CHECKLIST | TASK_ID | TASK_MAIN |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN |
