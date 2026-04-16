# ENUM_DICTIONARY Standard

## Design Source
- 03_SHARED/ENUM_DICTIONARY.md — defines enum law and structure
- 02_MODULES/*/SHEET_DICTIONARY.md — field-level enum references

## Runtime Source
- Google Sheets: ENUM_DICTIONARY — live operational enum source
- GAS reads from this sheet; AppSheet binds Valid_If to same sheet

## Sheet Structure

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique per row |
| ENUM_GROUP | Text | Yes | Family: HO_SO_TYPE, TASK_STATUS, etc. |
| ENUM_VALUE | Text | Yes | Machine-safe value: NEW, ACTIVE, etc. |
| DISPLAY_TEXT | Text | No | User-facing label |
| SORT_ORDER | Number | No | Display order |
| IS_ACTIVE | Yes/No | Yes | Controls usability |
| NOTE | Text | No | Optional note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |

## Enum Groups (Schema-Aligned)

| ENUM_GROUP | Used By | Repo Doc |
|------------|---------|----------|
| ROLE | AppSheet Account list, security filters | CBV_ENUM, 00_CORE_CONSTANTS |
| HO_SO_TYPE | MASTER_CODE (group HO_SO_TYPE); `HO_SO_MASTER.HO_SO_TYPE_ID` → Ref | ENUM_DICTIONARY.md |
| HO_SO_STATUS | HO_SO_MASTER.STATUS, HO_SO_FILE.STATUS, HO_SO_RELATION.STATUS | ENUM_DICTIONARY.md |
| FILE_GROUP | HO_SO_FILE.FILE_GROUP | ENUM_DICTIONARY.md |
| TASK_TYPE | TASK_MAIN.TASK_TYPE | ENUM_DICTIONARY.md |
| TASK_STATUS | TASK_MAIN.STATUS | ENUM_DICTIONARY.md |
| TASK_PRIORITY | TASK_MAIN.PRIORITY | ENUM_DICTIONARY.md |
| ATTACHMENT_TYPE | TASK_ATTACHMENT.TYPE (future) | ENUM_DICTIONARY.md |
| UPDATE_TYPE | TASK_UPDATE_LOG.ACTION | ENUM_DICTIONARY.md |
| FINANCE_TYPE | FINANCE_TRANSACTION.TRANS_TYPE | ENUM_DICTIONARY.md |
| FINANCE_STATUS | FINANCE_TRANSACTION.STATUS | ENUM_DICTIONARY.md |
| FIN_CATEGORY | FINANCE_TRANSACTION.CATEGORY | ENUM_DICTIONARY.md |
| PAYMENT_METHOD | FINANCE_TRANSACTION.PAYMENT_METHOD | ENUM_DICTIONARY.md |
| MASTER_CODE_STATUS | MASTER_CODE.STATUS | MASTER_CODE_STANDARD.md |
| USER_DIRECTORY_STATUS | USER_DIRECTORY.STATUS | USER_DIRECTORY_SCHEMA.md |
| RELATED_ENTITY_TYPE | TASK_MAIN.RELATED_ENTITY_TYPE, FINANCE_TRANSACTION.RELATED_ENTITY_TYPE | SHEET_DICTIONARY |

## Minimal Seed Strategy
- Run seedEnumDictionary() after initAll() or separately
- Idempotent: inserts only missing (ENUM_GROUP, ENUM_VALUE) rows
- Do not remove existing rows; add new groups via seed spec and redeploy

## Fallback Policy
- If ENUM_DICTIONARY sheet missing or empty: GAS uses CBV_ENUM (00_CORE_CONSTANTS.js) and logs warning
- Backend validation is always the real guard; AppSheet Valid_If is UI-only

## Audit Policy
- Run auditEnumConsistency() after seedEnumDictionary()
- Report mismatches between sheet and repo docs
- Detect duplicate (ENUM_GROUP, ENUM_VALUE) rows
