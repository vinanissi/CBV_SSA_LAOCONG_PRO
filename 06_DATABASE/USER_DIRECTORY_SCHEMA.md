# USER_DIRECTORY Schema

**Canonical:** See 01_SCHEMA/USER_DIRECTORY_SCHEMA.md for final spec.

## Sheet
USER_DIRECTORY

## Design Source
- 03_SHARED/USER_SYSTEM_STANDARD.md
- 00_META/CBV_TABLE_STANDARD.md
- 00_META/CBV_ID_STANDARD.md

## Purpose
Operational user registry for the system. **Independent from DON_VI/HTX** — users are system-wide, not tied to organizational units. Used for task owner/assignee, reporter, finance confirmation, checklist done-by.

---

## Minimum Required Fields

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key, UD_YYYYMMDD_<6-8 chars> |
| EMAIL | Text | Yes | Main login / identity reference |
| DISPLAY_NAME | Text | Yes | User-facing name (UI) |
| ROLE | Text | Yes | ADMIN \| OPERATOR \| VIEWER |
| STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

## Extended Columns (Optional)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| USER_CODE | Text | No | Machine-safe; USER_001, USER_002 |
| FULL_NAME | Text | No | Canonical human name |
| PHONE | Text | No | Contact phone |
| POSITION | Text | No | Job title; not enum |
| IS_SYSTEM | Yes/No | No | System-seeded, not admin-editable |
| ALLOW_LOGIN | Yes/No | No | Can sign in to AppSheet |
| NOTE | Text | No | Admin note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |

---

## ACTIVE_USERS View

**Filter:** `STATUS = "ACTIVE" AND IS_DELETED = FALSE`

Used for:
- TASK_MAIN.OWNER_ID Valid_If
- TASK_MAIN.REPORTER_ID Valid_If
- HO_SO_MASTER.OWNER_ID Valid_If
- TASK_CHECKLIST.DONE_BY Valid_If
- FINANCE_TRANSACTION.CONFIRMED_BY Valid_If

---

## STATUS Enum

- ACTIVE
- INACTIVE
- ARCHIVED

(Use ENUM_GROUP=USER_DIRECTORY_STATUS or MASTER_CODE_STATUS pattern.)

---

## ROLE Enum

- ADMIN
- OPERATOR
- VIEWER

(From ENUM_DICTIONARY ENUM_GROUP=ROLE.)

---

## Independence Policy

- USER_DIRECTORY has **no** DON_VI_ID or HTX_ID.
- Users are system-wide; organizational assignment (if needed) is via TASK_MAIN.DON_VI_ID, HO_SO_MASTER, or other business tables.
- Do not link USER_DIRECTORY to DON_VI or HO_SO_MASTER for user-to-unit mapping at schema level.

---

## Relationship to Other Sheets

| Ref Field | Target | Notes |
|-----------|--------|-------|
| TASK_MAIN.OWNER_ID | USER_DIRECTORY | Task assignee |
| TASK_MAIN.REPORTER_ID | USER_DIRECTORY | Task reporter |
| HO_SO_MASTER.OWNER_ID | USER_DIRECTORY | File owner |
| TASK_CHECKLIST.DONE_BY | USER_DIRECTORY | Who marked done |
| FINANCE_TRANSACTION.CONFIRMED_BY | USER_DIRECTORY | Who confirmed |
| DON_VI.MANAGER_USER_ID | USER_DIRECTORY | Unit manager |

---

## ID Format

`UD_YYYYMMDD_<6-8 chars>` — per CBV_ID_STANDARD. UD = USER_DIRECTORY prefix.

---

## Validation Rules

1. ID is system key and must be stable.
2. EMAIL recommended for USEREMAIL() mapping; uniqueness enforced by app logic.
3. ROLE must be from ENUM_DICTIONARY ROLE group.
4. STATUS must be ACTIVE, INACTIVE, or ARCHIVED.
5. DISPLAY_NAME used when FULL_NAME empty; at least one required.
