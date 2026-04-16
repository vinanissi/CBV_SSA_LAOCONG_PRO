# GAS Dependency Map

## By File (load order)

| # | File | Depends on | Notes |
|---|------|------------|-------|
| 1 | 00_CORE_CONFIG.js | — | SpreadsheetApp, Session only |
| 2 | 00_CORE_CONSTANTS.js | — | CBV_ENUM literal |
| 3 | 00_CORE_UTILS.js | 00_CORE_CONFIG | cbvMakeId uses CBV_CONFIG.TIMEZONE |
| 4 | 01_ENUM_CONFIG.js | — | ENUM_CONFIG literal |
| 5 | 01_ENUM_REPOSITORY.js | 00_CORE_CONFIG, 00_CORE_CONSTANTS | CBV_CONFIG.SHEETS, CBV_ENUM |
| 6 | 01_ENUM_SYNC_SERVICE.js | 00_CORE_CONFIG, 01_ENUM_CONFIG | Sync engine |
| 7 | 01_ENUM_SERVICE.js | 01_ENUM_REPOSITORY, 01_ENUM_SYNC_SERVICE | buildEnumMap, getEnumValuesFromRegistry |
| 8 | 01_ENUM_SEED.js | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_CONFIG | seedEnumDictionary |
| 9 | 01_ENUM_AUDIT.js | 00_CORE_CONFIG | CBV_CONFIG.SHEETS only |
| 10 | 02_MASTER_CODE_SERVICE.js | 00_CORE_CONFIG | CBV_CONFIG.SHEETS |
| 11 | 02_USER_SERVICE.js | 00_CORE_CONFIG, 00_CORE_UTILS | mapCurrentUserEmailToInternalId, etc. |
| 12 | 03_SHARED_ROW_READER.js | 00_CORE_UTILS | isEffectivelyBlankRow, filterRealDataRows, readNormalizedRows |
| 13 | 03_SHARED_REPOSITORY.js | 00_CORE_UTILS, 03_SHARED_ROW_READER | cbvAssert, readNormalizedRows |
| 14 | 03_SHARED_VALIDATION.js | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | cbvAssert, _rows, _sheet |
| 15 | 03_SHARED_LOGGER.js | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | cbvMakeId, cbvUser, _appendRecord |
| 16 | 03_SHARED_FILE_HELPER.js | — | File ops |
| 17 | 03_SHARED_ACTION_REGISTRY.js | — | `registerAction` / `getRegisteredAction`; global registry |
| 18 | 03_SHARED_PENDING_FEEDBACK.js | 03_SHARED_ACTION_REGISTRY, 00_CORE_UTILS, 03_SHARED_REPOSITORY | `withPendingFeedback`, `PENDING_ADAPTER_*` (runtime: task/finance/hoso) |
| 19 | 03_USER_MIGRATION_HELPER.js | 00_CORE_CONFIG, 02_USER_SERVICE, 03_SHARED_REPOSITORY, 03_SHARED_LOGGER | resolveValueToUserDirectoryId |
| 20 | 02_USER_VALIDATION.js | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY | validateUserRecordForCreate |
| 21 | 01_ENUM_ADMIN_SERVICE.js | 01_ENUM_*, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 22 | 02_MASTER_CODE_ADMIN_SERVICE.js | 02_MASTER_CODE, 01_ENUM, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 23 | 03_ADMIN_AUDIT_SERVICE.js | 03_SHARED_LOGGER | logAdminAudit |
| 24 | 90_BOOTSTRAP_SCHEMA.js | — | Manifest only; getRequiredSheetNames, getSchemaHeaders |
| 25 | 90_BOOTSTRAP_USER_SEED.js | 00_CORE_CONFIG, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA | seedUserDirectory |
| 26 | 90_BOOTSTRAP_AUDIT_SCHEMA.js | 90_BOOTSTRAP_SCHEMA | — |
| 27 | 90_BOOTSTRAP_LIFECYCLE.js | — | — |
| 28 | 90_BOOTSTRAP_PROTECTION.js | — | — |
| 29 | 10_HOSO_SERVICE.js | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_* | ensureRequired, assertValidEnumValue, _sheet, _rows |
| 30 | 20_TASK_REPOSITORY.js | 00_CORE_CONFIG, 03_SHARED_REPOSITORY | taskFindById, taskAppendMain, etc. |
| 31 | 20_TASK_VALIDATION.js | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY | assertActiveHtxId, validateTaskTransition |
| 32 | 20_TASK_SERVICE.js | 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE | createTask, updateTask, completeTask, etc. |
| 33 | 20_TASK_MIGRATION_HELPER.js | 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER | runTaskMigration |
| 34 | 30_FINANCE_SERVICE.js | 00_CORE_CONFIG, 03_SHARED_*, 03_SHARED_ACTION_REGISTRY, 03_SHARED_PENDING_FEEDBACK, 01_ENUM_SERVICE, 02_USER_SERVICE | `registerAction` (finConfirm/finCancel/finArchive); same shared pattern as other modules |
| 35 | 40_DISPLAY_MAPPING_SERVICE.js | 00_CORE_CONFIG | CBV_CONFIG.SHEETS; optionally clearEnumCache |
| 36 | 90_BOOTSTRAP_INIT.js | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY | initAll |
| 37 | 90_BOOTSTRAP_TASK.js | 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT | taskBootstrapSheets |
| 38 | 90_BOOTSTRAP_AUDIT.js | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 03_SHARED_ROW_READER | ensureHeadersMatchOrReport; readNormalizedRows for _auditGetRows |
| 39 | 50_APPSHEET_VERIFY.js | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SERVICE | verifyAppSheetReadiness |
| 40 | 99_DEBUG_TEST_HOSO.js | 10_HOSO_SERVICE | runHoSoTests |
| 41 | 99_DEBUG_TASK_TEST.js | 20_TASK_SERVICE | runTaskTests |
| 42 | 99_DEBUG_TEST_TASK.js | 99_DEBUG_TASK_TEST | runTaskTests |
| 43 | 99_DEBUG_TEST_FINANCE.js | 30_FINANCE_SERVICE | runFinanceTests |
| 44 | 99_DEBUG_TEST_RUNNER.js | 99_DEBUG_TEST_* | runAllModuleTests |
| 45 | 99_DEBUG_SAMPLE_DATA.js | 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE | seedGoldenDataset |
| 46 | 99_APPSHEET_WEBHOOK.js | 03_SHARED_ACTION_REGISTRY, 03_SHARED_PENDING_FEEDBACK, 20_TASK_SERVICE, 30_FINANCE_SERVICE (handlers via registry), 00_CORE_UTILS | `_routeWebhookAction`, `withTaskFeedback` → `withPendingFeedback` |
| 47 | 90_BOOTSTRAP_MENU.js | initAll, installTriggers, runAllModuleTests, etc. | onOpen |
| 48 | 90_BOOTSTRAP_TRIGGER.js | 90_BOOTSTRAP_AUDIT | dailyHealthCheck |
| 49 | 90_BOOTSTRAP_INSTALL.js | 00_CORE_UTILS | buildStructuredBootstrapReport |

---

## Cross-module (no cross-deps)

- 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE do **not** call each other
- Admin services (18–20) depend on ENUM, MASTER_CODE, SHARED; not called by modules
- Modules only depend on CONFIG, UTILS, ENUM, SHARED (plus `03_SHARED_ACTION_REGISTRY` / `03_SHARED_PENDING_FEEDBACK` where they call `registerAction` or rely on webhook dispatch)

---

## Reverse dependency (explicit, documented)

- **90_BOOTSTRAP_USER_SEED** depends on **90_BOOTSTRAP_SCHEMA** (getSchemaHeaders). Load order enforces SCHEMA before USER_SEED. Filename 90_* groups both in bootstrap layer.

---

## Circular check

No circular dependencies. DAG is acyclic.
