# Enum Sync Audit

## Design Source
- 03_SHARED/ENUM_DICTIONARY.md
- 02_MODULES/*/SHEET_DICTIONARY.md

## Runtime Source
- Google Sheets: ENUM_DICTIONARY
- Columns: ID, ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, SORT_ORDER, IS_ACTIVE, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY

## GAS Validation Method
- buildEnumMap() — loads from sheet, caches
- getEnumValues(enumGroup) — returns active values
- isValidEnumValue(enumGroup, value)
- assertValidEnumValue(enumGroup, value, fieldName) — used by services
- Fallback: CBV_ENUM (00_CORE_CONSTANTS.gs) when sheet missing/empty

## AppSheet Binding Method
- Add ENUM_DICTIONARY table
- Valid_If: `IN([Field], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND([ENUM_GROUP]="X", [IS_ACTIVE]=TRUE)))`
- See 04_APPSHEET/APPSHEET_ENUM_BINDING.md

## Fallback Policy
- If ENUM_DICTIONARY missing or empty: GAS uses CBV_ENUM, logs warning
- Run seedEnumDictionary() to initialize
- Backend validation always enforced

## Audit Policy
- Run auditEnumConsistency() after seed
- Checks: sheet exists, required groups present, no duplicates, values match repo docs
- Report mismatches in audit result

## Enum Groups Required by Schema
- HO_SO_TYPE, HO_SO_STATUS, FILE_GROUP
- TASK_TYPE, TASK_STATUS, TASK_PRIORITY
- ATTACHMENT_TYPE, UPDATE_TYPE
- FINANCE_TYPE, FINANCE_STATUS, FIN_CATEGORY, PAYMENT_METHOD
- MASTER_CODE_STATUS, RELATED_ENTITY_TYPE
