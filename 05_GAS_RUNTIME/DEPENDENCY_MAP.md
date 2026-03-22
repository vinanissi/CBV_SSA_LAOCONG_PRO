# GAS Dependency Map

## By File (load order)

| # | File | Depends on | Notes |
|---|------|------------|-------|
| 1 | 00_CORE_CONFIG.gs | — | SpreadsheetApp, Session only |
| 2 | 00_CORE_CONSTANTS.gs | — | CBV_ENUM literal |
| 3 | 00_CORE_UTILS.gs | 00_CORE_CONFIG | cbvMakeId uses CBV_CONFIG.TIMEZONE |
| 4 | 01_ENUM_CONFIG.gs | — | ENUM_CONFIG literal |
| 5 | 01_ENUM_REPOSITORY.gs | 00_CORE_CONFIG, 00_CORE_CONSTANTS | CBV_CONFIG.SHEETS, CBV_ENUM |
| 6 | 01_ENUM_SYNC_SERVICE.gs | 00_CORE_CONFIG, 01_ENUM_CONFIG | Sync engine |
| 7 | 01_ENUM_SERVICE.gs | 01_ENUM_REPOSITORY, 01_ENUM_SYNC_SERVICE | buildEnumMap, getEnumValuesFromRegistry |
| 8 | 01_ENUM_SEED.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_CONFIG | seedEnumDictionary |
| 9 | 01_ENUM_AUDIT.gs | 00_CORE_CONFIG | CBV_CONFIG.SHEETS only |
| 10 | 02_MASTER_CODE_SERVICE.gs | 00_CORE_CONFIG | CBV_CONFIG.SHEETS |
| 11 | 02_USER_SERVICE.gs | 00_CORE_CONFIG, 00_CORE_UTILS | mapCurrentUserEmailToInternalId, etc. |
| 12 | 03_SHARED_ROW_READER.gs | 00_CORE_UTILS | isEffectivelyBlankRow, filterRealDataRows, readNormalizedRows |
| 13 | 03_SHARED_REPOSITORY.gs | 00_CORE_UTILS, 03_SHARED_ROW_READER | cbvAssert, readNormalizedRows |
| 14 | 03_SHARED_VALIDATION.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | cbvAssert, _rows, _sheet |
| 15 | 03_SHARED_LOGGER.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | cbvMakeId, cbvUser, _appendRecord |
| 16 | 03_SHARED_FILE_HELPER.gs | — | File ops |
| 17 | 03_USER_MIGRATION_HELPER.gs | 00_CORE_CONFIG, 02_USER_SERVICE, 03_SHARED_REPOSITORY, 03_SHARED_LOGGER | resolveValueToUserDirectoryId |
| 17 | 02_USER_VALIDATION.gs | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY | validateUserRecordForCreate |
| 18 | 01_ENUM_ADMIN_SERVICE.gs | 01_ENUM_*, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 19 | 02_MASTER_CODE_ADMIN_SERVICE.gs | 02_MASTER_CODE, 01_ENUM, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 20 | 03_ADMIN_AUDIT_SERVICE.gs | 03_SHARED_LOGGER | logAdminAudit |
| 21 | 90_BOOTSTRAP_SCHEMA.gs | — | Manifest only; getRequiredSheetNames, getSchemaHeaders |
| 22 | 90_BOOTSTRAP_USER_SEED.gs | 00_CORE_CONFIG, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA | seedUserDirectory |
| 23 | 90_BOOTSTRAP_AUDIT_SCHEMA.gs | 90_BOOTSTRAP_SCHEMA | — |
| 24 | 90_BOOTSTRAP_LIFECYCLE.gs | — | — |
| 25 | 90_BOOTSTRAP_PROTECTION.gs | — | — |
| 26 | 10_HOSO_SERVICE.gs | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_* | ensureRequired, assertValidEnumValue, _sheet, _rows |
| 27 | 20_TASK_REPOSITORY.gs | 00_CORE_CONFIG, 03_SHARED_REPOSITORY | taskFindById, taskAppendMain, etc. |
| 28 | 20_TASK_VALIDATION.gs | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY | assertActiveHtxId, validateTaskTransition |
| 29 | 20_TASK_SERVICE.gs | 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE | createTask, updateTask, completeTask, etc. |
| 30 | 20_TASK_MIGRATION_HELPER.gs | 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER | runTaskMigration |
| 31 | 30_FINANCE_SERVICE.gs | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE | Same pattern |
| 32 | 40_DISPLAY_MAPPING_SERVICE.gs | 00_CORE_CONFIG | CBV_CONFIG.SHEETS; optionally clearEnumCache |
| 33 | 90_BOOTSTRAP_INIT.gs | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY | initAll |
| 34 | 90_BOOTSTRAP_TASK.gs | 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT | taskBootstrapSheets |
| 35 | 90_BOOTSTRAP_AUDIT.gs | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 03_SHARED_ROW_READER | ensureHeadersMatchOrReport; readNormalizedRows for _auditGetRows |
| 36 | 50_APPSHEET_VERIFY.gs | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SERVICE | verifyAppSheetReadiness |
| 37 | 99_DEBUG_TEST_HOSO.gs | 10_HOSO_SERVICE | runHoSoTests |
| 38 | 99_DEBUG_TASK_TEST.gs | 20_TASK_SERVICE | runTaskTests |
| 39 | 99_DEBUG_TEST_TASK.gs | 99_DEBUG_TASK_TEST | runTaskTests |
| 40 | 99_DEBUG_TEST_FINANCE.gs | 30_FINANCE_SERVICE | runFinanceTests |
| 41 | 99_DEBUG_TEST_RUNNER.gs | 99_DEBUG_TEST_* | runAllModuleTests |
| 42 | 99_DEBUG_SAMPLE_DATA.gs | 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE | seedGoldenDataset |
| 43 | 90_BOOTSTRAP_MENU.gs | initAll, installTriggers, runAllModuleTests, etc. | onOpen |
| 44 | 90_BOOTSTRAP_TRIGGER.gs | 90_BOOTSTRAP_AUDIT | dailyHealthCheck |
| 46 | 90_BOOTSTRAP_INSTALL.gs | 00_CORE_UTILS | buildStructuredBootstrapReport |

---

## Cross-module (no cross-deps)

- 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE do **not** call each other
- Admin services (18–20) depend on ENUM, MASTER_CODE, SHARED; not called by modules
- Modules only depend on CONFIG, UTILS, ENUM, SHARED

---

## Reverse dependency (explicit, documented)

- **90_BOOTSTRAP_USER_SEED** depends on **90_BOOTSTRAP_SCHEMA** (getSchemaHeaders). Load order enforces SCHEMA before USER_SEED. Filename 90_* groups both in bootstrap layer.

---

## Circular check

No circular dependencies. DAG is acyclic.
