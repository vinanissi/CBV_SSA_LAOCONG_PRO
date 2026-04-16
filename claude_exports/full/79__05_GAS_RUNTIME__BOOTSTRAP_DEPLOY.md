# CBV Bootstrap - Deployment Guide

## Final deployment order

1. `initAll()` – Initialize sheets and headers
2. `selfAuditBootstrap()` – Verify setup
3. `installTriggers()` – Install daily trigger

---

## Mandatory Sheets (9)
- HO_SO_MASTER
- HO_SO_FILE
- HO_SO_RELATION
- TASK_MAIN
- TASK_CHECKLIST
- TASK_UPDATE_LOG
- TASK_ATTACHMENT
- FINANCE_TRANSACTION
- FINANCE_LOG

## Bootstrap Functions
- `initAll()` - Full bootstrap (sheets, headers)
- `initCoreSheets()` - Sheets + headers only
- `initEnumData()` - Enum sheets (currently skipped)
- `initSystemConfig()` - Config placeholders (currently skipped)
- `installTriggers()` - Time-based triggers, no duplicates
- `selfAuditBootstrap()` - Self-audit (sheets, headers, triggers)
- `onOpen()` - Menu (runs on spreadsheet open)

## Helpers
- `ensureSheetExists(name)` - Create sheet if missing
- `ensureHeadersMatchOrReport(sheet, headers)` - Compare headers, report only
- `ensureEnumRows(sheet, keyColumn, rows)` - Add enum rows without duplicates
- `ensureNoDuplicateTrigger(handler)` - Check trigger exists
- `buildStructuredBootstrapReport()` - Empty result template (00_CORE_UTILS.js)

## File Tree (GAS)
```
05_GAS_RUNTIME/
  00_CORE_CONFIG.js
  00_CORE_CONSTANTS.js
  00_CORE_UTILS.js
  01_ENUM_*.js
  02_MASTER_CODE_SERVICE.js
  03_SHARED_*.js
  10_HOSO_SERVICE.js
  20_TASK_SERVICE.js
  30_FINANCE_SERVICE.js
  40_DISPLAY_MAPPING_SERVICE.js
  50_APPSHEET_VERIFY.js
  90_BOOTSTRAP_*.js
  99_DEBUG_*.js
```

## Schema vs Docs
- schema_manifest.json and _generated_schema/*.csv are aligned
- No enum/config sheets in schema - initEnumData and initSystemConfig return skipped
- 03_SHARED_LOGGER.logAction uses MODULE/ENTITY_TYPE/ENTITY_ID; FINANCE_LOG uses FIN_ID, TASK_UPDATE_LOG uses TASK_ID - 20_TASK_SERVICE and 30_FINANCE_SERVICE use their own log functions (addTaskUpdate, logFinance)
