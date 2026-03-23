# MASTER_CODE Schema

**Canonical:** See 01_SCHEMA/MASTER_CODE_SCHEMA.md for final spec. MASTER_CODE does NOT store DON_VI or USER.

## Sheet
MASTER_CODE

## Design Source
- 03_SHARED/MASTER_CODE_STANDARD.md

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key, MC_YYYYMMDD_xxxxx |
| 2 | MASTER_GROUP | Text | Yes | Family: PROVINCE, DISTRICT, etc. |
| 3 | CODE | Text | Yes | Unique per (MASTER_GROUP, CODE) |
| 4 | NAME | Text | Yes | Full canonical name |
| 5 | DISPLAY_TEXT | Text | No | UI override; empty = use NAME |
| 6 | SHORT_NAME | Text | No | Abbreviated label |
| 7 | PARENT_CODE | Text | No | Parent for hierarchy |
| 8 | STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| 9 | SORT_ORDER | Number | No | Display order |
| 10 | IS_SYSTEM | Yes/No | Yes | System-seeded, not admin-editable |
| 11 | ALLOW_EDIT | Yes/No | Yes | Admin can edit |
| 12 | NOTE | Text | No | |
| 13 | CREATED_AT | Datetime | No | |
| 14 | CREATED_BY | Text | No | |
| 15 | UPDATED_AT | Datetime | No | |
| 16 | UPDATED_BY | Text | No | |
| 17 | IS_DELETED | Yes/No | Yes | Soft delete |

## STATUS Enum
- ACTIVE
- INACTIVE
- ARCHIVED

## Relationship to Other Sheets
- MASTER_CODE is a **reference sheet** — other sheets may store MASTER_GROUP + CODE as foreign keys
- Not in ENUM_DICTIONARY — MASTER_CODE is for dynamic groups; ENUM_DICTIONARY is for locked workflow enums
