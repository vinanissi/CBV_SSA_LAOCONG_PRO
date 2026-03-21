# USER_DIRECTORY Schema

## Sheet
USER_DIRECTORY

## Design Source
- 03_SHARED/USER_SYSTEM_STANDARD.md
- 00_META/CBV_TABLE_STANDARD.md
- 00_META/CBV_ID_STANDARD.md

## Purpose
Dedicated layer for operational users. Manages system identity separately from business records (HO_SO_MASTER). Used for task owner/assignee, reporter, finance confirmation, checklist done-by.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key, UD_YYYYMMDD_<6-8 chars> |
| 2 | USER_CODE | Text | Yes | Machine-safe; USER_001, USER_002 |
| 3 | FULL_NAME | Text | Yes | Canonical human name |
| 4 | DISPLAY_NAME | Text | No | UI override; empty = use FULL_NAME |
| 5 | EMAIL | Text | No | Main login / identity reference |
| 6 | PHONE | Text | No | Contact phone |
| 7 | ROLE | Text | Yes | Enum: ADMIN \| OPERATOR \| VIEWER |
| 8 | POSITION | Text | No | Job title; not enum |
| 9 | HTX_ID | Text | No | Ref HO_SO_MASTER (HO_SO_TYPE=HTX) |
| 10 | STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| 11 | IS_SYSTEM | Yes/No | Yes | System-seeded, not admin-editable |
| 12 | ALLOW_LOGIN | Yes/No | Yes | Can sign in to AppSheet |
| 13 | NOTE | Text | No | Admin note |
| 14 | CREATED_AT | Datetime | No | |
| 15 | CREATED_BY | Text | No | |
| 16 | UPDATED_AT | Datetime | No | |
| 17 | UPDATED_BY | Text | No | |
| 18 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## STATUS Enum

- ACTIVE
- INACTIVE
- ARCHIVED

(Use ENUM_GROUP=USER_DIRECTORY_STATUS or MASTER_CODE_STATUS pattern; values align with MASTER_CODE_STATUS.)

---

## ROLE Enum

- ADMIN
- OPERATOR
- VIEWER

(From ENUM_DICTIONARY ENUM_GROUP=ROLE.)

---

## Relationship to Other Sheets

| Ref Field | Target | Notes |
|-----------|--------|-------|
| USER_DIRECTORY.HTX_ID | HO_SO_MASTER | When user belongs to specific HTX |
| TASK_MAIN.OWNER_ID | USER_DIRECTORY | Task assignee |
| TASK_MAIN.REPORTER_ID | USER_DIRECTORY | Task reporter |
| HO_SO_MASTER.OWNER_ID | USER_DIRECTORY | File owner (operational user) |
| TASK_CHECKLIST.DONE_BY | USER_DIRECTORY | Who marked done |
| FINANCE_TRANSACTION.CONFIRMED_BY | USER_DIRECTORY | Who confirmed |

---

## ID Format

`UD_YYYYMMDD_<6-8 chars>` — per CBV_ID_STANDARD. UD = USER_DIRECTORY prefix.

---

## Validation Rules

1. ID is system key and must be stable.
2. USER_CODE is unique per sheet.
3. ROLE must be from ENUM_DICTIONARY ROLE group.
4. STATUS must be ACTIVE, INACTIVE, or ARCHIVED.
5. HTX_ID when provided must reference valid HO_SO_MASTER row (HO_SO_TYPE=HTX).
6. EMAIL recommended for USEREMAIL() mapping; not enforced unique at schema level.
