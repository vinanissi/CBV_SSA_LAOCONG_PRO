# GAS Dependency Map

## By File (load order)

| # | File | Depends on | Notes |
|---|------|------------|-------|
| 1 | 00_CORE_CONFIG.gs | — | SpreadsheetApp, Session only |
| 2 | 00_CORE_CONSTANTS.gs | — | CBV_ENUM literal |
| 3 | 00_CORE_UTILS.gs | 00_CORE_CONFIG | cbvMakeId uses CBV_CONFIG.TIMEZONE |
| 4 | 01_ENUM_REPOSITORY.gs | 00_CORE_CONFIG, 00_CORE_CONSTANTS | CBV_CONFIG.SHEETS, CBV_ENUM |
| 5 | 01_ENUM_SERVICE.gs | 01_ENUM_REPOSITORY | buildEnumMap |
| 6 | 01_ENUM_SEED.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_REPOSITORY | buildStructuredBootstrapReport, cbvNow, cbvUser, cbvMakeId, clearEnumCache |
| 7 | 01_ENUM_AUDIT.gs | 00_CORE_CONFIG | CBV_CONFIG.SHEETS only |
| 8 | 02_MASTER_CODE_SERVICE.gs | 00_CORE_CONFIG | CBV_CONFIG.SHEETS |
| 9 | 03_SHARED_REPOSITORY.gs | 00_CORE_UTILS | cbvAssert |
| 10 | 03_SHARED_VALIDATION.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | cbvAssert, _rows, _sheet, CBV_CONFIG (ensureTaskCanComplete) |
| 11 | 03_SHARED_LOGGER.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | cbvMakeId, cbvUser, _appendRecord, CBV_CONFIG.SHEETS |
| 12 | 01_ENUM_ADMIN_SERVICE.gs | 01_ENUM_*, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 13 | 02_MASTER_CODE_ADMIN_SERVICE.gs | 02_MASTER_CODE, 01_ENUM, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 14 | 03_ADMIN_AUDIT_SERVICE.gs | 03_SHARED_LOGGER | logAdminAudit |
| 15 | 90_BOOTSTRAP_SCHEMA.gs | — | Manifest only |
| 16 | 10_HOSO_SERVICE.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_* | ensureRequired, assertValidEnumValue, _sheet, _rows, _appendRecord, _findById, _updateRow |
| 17 | 20_TASK_SERVICE.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_* | Same pattern |
| 18 | 30_FINANCE_SERVICE.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_* | Same pattern |
| 19 | 40_DISPLAY_MAPPING_SERVICE.gs | 00_CORE_CONFIG | CBV_CONFIG.SHEETS; optionally clearEnumCache, clearMasterCodeCache |
| 20 | 90_BOOTSTRAP_INIT.gs | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY | buildStructuredBootstrapReport, getRequiredSheetNames, getSchemaHeaders, seedEnumDictionary, ensureDisplayText* |
| 21 | 90_BOOTSTRAP_AUDIT.gs | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT | buildStructuredBootstrapReport, getRequiredSheetNames, getSchemaHeaders, ensureHeadersMatchOrReport |
| 22 | 50_APPSHEET_VERIFY.gs | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SERVICE | selfAuditBootstrap, getRequiredSheetNames, getActiveEnumValues (typeof guarded) |
| 23 | 99_DEBUG_TEST_HOSO.gs | 03_SHARED_REPOSITORY, 00_CORE_CONFIG, 10_HOSO_SERVICE | _sheet, _rows, _findById, createHoSo |
| 24 | 99_DEBUG_TEST_TASK.gs | 03_SHARED_REPOSITORY, 20_TASK_SERVICE | createTask, addTaskUpdate, etc. |
| 25 | 99_DEBUG_TEST_FINANCE.gs | 30_FINANCE_SERVICE | createTransaction, etc. |
| 26 | 99_DEBUG_TEST_RUNNER.gs | 99_DEBUG_TEST_HOSO, 99_DEBUG_TEST_TASK, 99_DEBUG_TEST_FINANCE | runHoSoTests, runTaskTests, runFinanceTests |
| 27 | 99_DEBUG_SAMPLE_DATA.gs | 03_SHARED_REPOSITORY, 00_CORE_CONFIG, 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE | _sheet, _rows, createHoSo, createTask, createTransaction |
| 28 | 90_BOOTSTRAP_MENU.gs | initAll, selfAuditBootstrap, installTriggers, runAllModuleTests, seedGoldenDataset, verifyAppSheetReadiness, auditSystem | onOpen menu targets |
| 29 | 90_BOOTSTRAP_TRIGGER.gs | 90_BOOTSTRAP_AUDIT | dailyHealthCheck calls auditSystem |
| 30 | 90_BOOTSTRAP_INSTALL.gs | 00_CORE_UTILS | buildStructuredBootstrapReport |

---

## Cross-module (no cross-deps)

- 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE do **not** call each other
- Admin services (12–14) depend on ENUM, MASTER_CODE, SHARED; not called by modules
- Modules only depend on CONFIG, UTILS, ENUM, SHARED

---

## Circular check

No circular dependencies. DAG is acyclic.
