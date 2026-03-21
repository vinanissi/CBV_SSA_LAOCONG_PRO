# AppSheet MASTER_CODE Binding

## Source
- Table: MASTER_CODE (Google Sheets)
- Filter: MASTER_GROUP = "[group]", STATUS = "ACTIVE", IS_DELETED = FALSE

## Binding Method
Use List/Choice with MASTER_CODE table. Filter by MASTER_GROUP.

## GAS Validation
- `getMasterCodes(masterGroup)` / `getActiveMasterCodes(masterGroup)` — load from sheet
- `assertValidMasterCode(masterGroup, code, fieldName)` — throw if invalid

## Field Mappings (MASTER_CODE-backed)

### TASK_MAIN.TASK_GROUP_CODE
- **MASTER_GROUP:** TASK_GROUP
- **⚠️ FIELD NOT IN SCHEMA** — TASK_MAIN has no TASK_GROUP_CODE column. Add when schema extended.
- **Valid_If (when field exists):**
```
IN(
  [TASK_GROUP_CODE],
  SELECT(MASTER_CODE[CODE], AND(MASTER_CODE[MASTER_GROUP] = "TASK_GROUP", MASTER_CODE[STATUS] = "ACTIVE", MASTER_CODE[IS_DELETED] = FALSE))
)
```
- **Display:** DISPLAY_TEXT or NAME

### FINANCE_TRANSACTION.CATEGORY_CODE
- **MASTER_GROUP:** FINANCE_CATEGORY
- **⚠️ FIELD NOT IN SCHEMA** — FINANCE_TRANSACTION has CATEGORY (enum FIN_CATEGORY), not CATEGORY_CODE. Add if migrating to dynamic categories.
- **Valid_If (when field exists):**
```
IN(
  [CATEGORY_CODE],
  SELECT(MASTER_CODE[CODE], AND(MASTER_CODE[MASTER_GROUP] = "FINANCE_CATEGORY", MASTER_CODE[STATUS] = "ACTIVE", MASTER_CODE[IS_DELETED] = FALSE))
)
```

### TASK_ATTACHMENT.DOC_GROUP_CODE
- **MASTER_GROUP:** DOCUMENT_TYPE
- **⚠️ FIELD NOT IN SCHEMA** — TASK_ATTACHMENT has no DOC_GROUP_CODE column. Add when schema extended.
- **Valid_If (when field exists):**
```
IN(
  [DOC_GROUP_CODE],
  SELECT(MASTER_CODE[CODE], AND(MASTER_CODE[MASTER_GROUP] = "DOCUMENT_TYPE", MASTER_CODE[STATUS] = "ACTIVE", MASTER_CODE[IS_DELETED] = FALSE))
)
```

## Display Mapping
- **Store:** CODE
- **Display:** DISPLAY_TEXT (if populated) else SHORT_NAME+" - "+NAME or CODE+" - "+NAME or NAME or CODE
- See 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md

## Dropdown Configuration
- **List:** MASTER_CODE
- **Filter:** `AND([MASTER_GROUP] = "PROVINCE", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
- **Display column:** DISPLAY_TEXT (or NAME if DISPLAY_TEXT empty)
- **Value column:** CODE
- **Sort by:** SORT_ORDER

## Valid_If (if field stores CODE)
```
IN(
  [YourField],
  SELECT(MASTER_CODE[CODE], AND(MASTER_CODE[MASTER_GROUP] = "PROVINCE", MASTER_CODE[STATUS] = "ACTIVE", MASTER_CODE[IS_DELETED] = FALSE))
)
```

## Rules
- Do NOT enable "Allow other values" unless explicitly required
- Backend (GAS) validation is the real guard
- IS_SYSTEM = TRUE rows: consider read-only in AppSheet
- ALLOW_EDIT = FALSE: hide from admin edit UI

## Required MASTER_GROUPs (for mapped fields)
- **USER** — TASK_MAIN.OWNER_ID, TASK_MAIN.REPORTER_ID, HO_SO_MASTER.OWNER_ID, TASK_CHECKLIST.DONE_BY, FINANCE_TRANSACTION.CONFIRMED_BY (see APPSHEET_USER_BINDING.md)
- **TASK_GROUP** — TASK_MAIN.TASK_GROUP_CODE (when added)
- **FINANCE_CATEGORY** — FINANCE_TRANSACTION.CATEGORY_CODE (when added)
- **DOCUMENT_TYPE** — TASK_ATTACHMENT.DOC_GROUP_CODE (when added)

## Example MASTER_GROUPs (admin-defined)
- PROVINCE, DISTRICT, COST_CENTER, CURRENCY, UNIT_TYPE
