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
- `buildStructuredBootstrapReport()` - Empty result template (util.gs)

## File Tree (GAS)
```
05_GAS_RUNTIME/
  config.gs
  enum.gs
  util.gs
  repository.gs
  validation_service.gs
  log_service.gs
  schema_manifest.gs
  init_schema.gs
  bootstrap_menu.gs
  install.gs
  audit_service.gs
  ho_so_service.gs
  task_service.gs
  finance_service.gs
  triggers.gs
```

## Schema vs Docs
- schema_manifest.json and _generated_schema/*.csv are aligned
- No enum/config sheets in schema - initEnumData and initSystemConfig return skipped
- log_service.logAction uses MODULE/ENTITY_TYPE/ENTITY_ID; FINANCE_LOG uses FIN_ID, TASK_UPDATE_LOG uses TASK_ID - task_service and finance_service use their own log functions (addTaskUpdate, logFinance)
