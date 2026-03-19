# ENUM_DICTIONARY Schema

## Sheet
ENUM_DICTIONARY

## Design Source
- 03_SHARED/ENUM_DICTIONARY_STANDARD.md
- 03_SHARED/ENUM_DICTIONARY.md

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique per row |
| 2 | ENUM_GROUP | Text | Yes | Family: HO_SO_TYPE, TASK_STATUS, etc. |
| 3 | ENUM_VALUE | Text | Yes | Machine-safe value |
| 4 | DISPLAY_TEXT | Text | No | User-facing label |
| 5 | SORT_ORDER | Number | No | Display order |
| 6 | IS_ACTIVE | Yes/No | Yes | Controls usability |
| 7 | NOTE | Text | No | |
| 8 | CREATED_AT | Datetime | No | |
| 9 | CREATED_BY | Text | No | |
| 10 | UPDATED_AT | Datetime | No | |
| 11 | UPDATED_BY | Text | No | |

## Relationship
- Reference sheet — no foreign keys to other tables
- Created by seedEnumDictionary(); not in schema_manifest (created by initAll flow)
