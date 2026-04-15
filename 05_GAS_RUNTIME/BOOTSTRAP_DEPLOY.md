# CBV Bootstrap - Deployment Guide

## Final deployment order

1. `initAll()` – Initialize sheets and headers
2. `selfAuditBootstrap()` – Verify setup
3. `installTriggers()` – Install daily trigger

---

## Mandatory Sheets (12)
- HO_SO_MASTER
- HO_SO_FILE
- HO_SO_RELATION
- TASK_MAIN
- TASK_CHECKLIST
- TASK_UPDATE_LOG
- TASK_ATTACHMENT
- FINANCE_TRANSACTION
- FINANCE_LOG
- FINANCE_ATTACHMENT
- USER_DIRECTORY
- ADMIN_AUDIT_LOG

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
- `buildStructuredBootstrapReport()` - Empty result template (00_CORE_UTILS.gs)

## File Tree (GAS)
```
05_GAS_RUNTIME/
  00_CORE_CONFIG.gs
  00_CORE_CONSTANTS.gs
  00_CORE_UTILS.gs
  01_ENUM_*.gs
  02_MASTER_CODE_SERVICE.gs
  03_SHARED_*.gs
  10_HOSO_SERVICE.gs
  20_TASK_SERVICE.gs
  30_FINANCE_SERVICE.gs
  40_DISPLAY_MAPPING_SERVICE.gs
  50_APPSHEET_VERIFY.gs
  90_BOOTSTRAP_*.gs
  99_DEBUG_*.gs
```

## Schema vs Docs
- schema_manifest.json and _generated_schema/*.csv are aligned
- No enum/config sheets in schema - initEnumData and initSystemConfig return skipped
- 03_SHARED_LOGGER.logAction uses MODULE/ENTITY_TYPE/ENTITY_ID; FINANCE_LOG uses FIN_ID, TASK_UPDATE_LOG uses TASK_ID - 20_TASK_SERVICE and 30_FINANCE_SERVICE use their own log functions (addTaskUpdate, logFinance)
