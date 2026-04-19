# GAS Dependency Map

> **Warning:** `.clasp.json` `filePushOrder` is the authoritative source for file presence and push sequence.  
> This document reflects the state as of **2026-04-19** (P1 Event-Driven Core landed). Rows below are the **core dependency spine**; additional files (HO_SO layer, Data Sync, gateway, menu helpers, etc.) appear in `.clasp.json` in the order listed there.

## By File (load order)

| # | File | Depends on | Notes |
|---|------|------------|-------|
| 1 | 00_CORE_CONFIG.js | — | SpreadsheetApp, Session only. Now includes `EVENT_QUEUE`, `RULE_DEF` in `CBV_CONFIG.SHEETS`. |
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
| 18a | **04_CORE_EVENT_TYPES.js** | — | Constants: `FINANCE_CREATED`, `FINANCE_STATUS_CHANGED`, etc. `cbvCoreEventMode_()` reads Script Property `CBV_CORE_EVENT_MODE` (`off` \| `shadow` \| `on`). No runtime deps. |
| 18b | **04_CORE_EVENT_QUEUE.js** | 04_CORE_EVENT_TYPES, 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY | `createCoreEvent` (appends to `EVENT_QUEUE` sheet); `cbvTryEmitCoreEvent_` (non-throwing wrapper). Uses `cbvCoreEventMode_()`. Reads `CBV_CONFIG.SHEETS.EVENT_QUEUE`. |
| 18c | **04_CORE_RULE_ENGINE.js** | 00_CORE_CONFIG, 03_SHARED_REPOSITORY, 04_CORE_EVENT_TYPES | `loadRulesForEventType_` (reads `RULE_DEF` sheet); `evaluateCoreCondition_` (DSL: all/any, eq/ne/in — no eval). |
| 18d | **04_CORE_EVENT_PROCESSOR.js** | 04_CORE_EVENT_QUEUE, 04_CORE_RULE_ENGINE, 03_SHARED_REPOSITORY, 00_CORE_UTILS | `processCoreEvent`, `processCoreEventQueueBatch_`, `executeCoreAction_` (stub dispatch). Header also references `04_CORE_EVENT_TYPES`. Must load after 18a–18c. |
| 18e | **04_CORE_EVENT_TRIGGERS.js** | 04_CORE_EVENT_PROCESSOR, ScriptApp | `coreEventQueueProcessMinutely`; `installCoreEventQueueTrigger` / `uninstallCoreEventQueueTrigger` (menu-driven time triggers). |
| 19 | 03_USER_MIGRATION_HELPER.js | 00_CORE_CONFIG, 02_USER_SERVICE, 03_SHARED_REPOSITORY, 03_SHARED_LOGGER | resolveValueToUserDirectoryId |
| 20 | 02_USER_VALIDATION.js | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY | validateUserRecordForCreate |
| 21 | 01_ENUM_ADMIN_SERVICE.js | 01_ENUM_*, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 22 | 02_MASTER_CODE_ADMIN_SERVICE.js | 02_MASTER_CODE, 01_ENUM, 03_SHARED_*, 00_CORE_UTILS | assertAdminAuthority, logAdminAudit |
| 23 | 03_ADMIN_AUDIT_SERVICE.js | 03_SHARED_LOGGER | logAdminAudit |
| 24 | 90_BOOTSTRAP_SCHEMA.js | — | Manifest only; `getRequiredSheetNames`, `getSchemaHeaders`. Now includes column defs for `EVENT_QUEUE` and `RULE_DEF`. |
| 25 | 90_BOOTSTRAP_USER_SEED.js | 00_CORE_CONFIG, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA | seedUserDirectory |
| 26 | 90_BOOTSTRAP_AUDIT_SCHEMA.js | 90_BOOTSTRAP_SCHEMA | — |
| 27 | 90_BOOTSTRAP_LIFECYCLE.js | — | — |
| 28 | 90_BOOTSTRAP_PROTECTION.js | — | — |
| 29 | 10_HOSO_SERVICE.js | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_SERVICE, 03_SHARED_* | ensureRequired, assertValidEnumValue, _sheet, _rows |
| 30 | 20_TASK_REPOSITORY.js | 00_CORE_CONFIG, 03_SHARED_REPOSITORY | taskFindById, taskAppendMain, etc. |
| 31 | 20_TASK_VALIDATION.js | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY | assertActiveHtxId, validateTaskTransition |
| 32 | 20_TASK_SERVICE.js | 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE | createTask, updateTask, completeTask, etc. |
| 32a | 21_MASTER_DATA_HELPER.js | 00_CORE_CONFIG, 03_SHARED_REPOSITORY | Master data lookup helpers |
| 33 | 20_TASK_MIGRATION_HELPER.js | 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER | runTaskMigration |
| 34 | 30_FINANCE_SERVICE.js | 00_CORE_CONFIG, 03_SHARED_*, 03_SHARED_ACTION_REGISTRY, 03_SHARED_PENDING_FEEDBACK, 01_ENUM_SERVICE, 02_USER_SERVICE, **04_CORE_EVENT_QUEUE** | `registerAction` (finConfirm/finCancel/finArchive); calls `cbvTryEmitCoreEvent_` after `createTransaction` and after `setFinanceStatus` + `logFinance`. |
| 35 | 40_DISPLAY_MAPPING_SERVICE.js | 00_CORE_CONFIG | CBV_CONFIG.SHEETS; optionally clearEnumCache |
| 36 | 90_BOOTSTRAP_INIT.js | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY | initAll |
| 36a | 95_TASK_SYSTEM_BOOTSTRAP.js | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA | ensureSeedDonVi, ensureSeedMasterCode / ensureSeedTaskType, buildActiveSlicesSpecImpl, repairTaskSystemSafelyImpl |
| 37 | 90_BOOTSTRAP_TASK.js | 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT | taskBootstrapSheets |
| 38 | 90_BOOTSTRAP_AUDIT.js | 00_CORE_UTILS, 90_BOOTSTRAP_SCHEMA, 03_SHARED_ROW_READER | ensureHeadersMatchOrReport; readNormalizedRows for _auditGetRows |
| 39 | 90_BOOTSTRAP_REPAIR.js | 90_BOOTSTRAP_SCHEMA | repairSchemaColumns, repairSchemaAndData |
| 40 | 50_APPSHEET_VERIFY.js | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA, 01_ENUM_SERVICE | verifyAppSheetReadiness |
| 41 | 99_DEBUG_TEST_HOSO.js | 10_HOSO_SERVICE | runHoSoTests |
| 42 | 99_DEBUG_TASK_TEST.js | 20_TASK_SERVICE | runTaskTests |
| 43 | 99_DEBUG_TEST_TASK.js | 99_DEBUG_TASK_TEST | runTaskTests |
| 44 | 99_DEBUG_TEST_FINANCE.js | 30_FINANCE_SERVICE | runFinanceTests |
| 45 | 99_DEBUG_TEST_RUNNER.js | 99_DEBUG_TEST_* | runAllModuleTests |
| 46 | 99_DEBUG_SAMPLE_DATA.js | 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE | seedGoldenDataset |
| 47 | 99_APPSHEET_WEBHOOK.js | 03_SHARED_ACTION_REGISTRY, 03_SHARED_PENDING_FEEDBACK, 20_TASK_SERVICE, 30_FINANCE_SERVICE (handlers via registry), 00_CORE_UTILS | `_routeWebhookAction`; `withTaskFeedback` → `withPendingFeedback`; `checklistDone` / `addLog` in switch (pending migration to event path in P2+) |
| 48 | 90_BOOTSTRAP_MENU.js | initAll, repairSchemaAndData, installTriggers, runAllModuleTests, seedGoldenDataset, verifyAppSheetReadiness, runEnumHealthCheck, runSafeRepairDryRun, auditSystem | onOpen |
| 49 | 90_BOOTSTRAP_TRIGGER.js | 90_BOOTSTRAP_AUDIT | dailyHealthCheck |
| 50 | 90_BOOTSTRAP_INSTALL.js | 00_CORE_UTILS | buildStructuredBootstrapReport |

Logical layer order above; **actual clasp order** places `99_APPSHEET_WEBHOOK.js`, `60_HOSO_API_GATEWAY.js`, `61_UNIFIED_ROUTER.js`, menu helpers/wrappers, and **`90_BOOTSTRAP_MENU.js` last** before triggers/install. See `.clasp.json` for the exact sequence.

**Also in `.clasp.json` (not expanded row-by-row here):** `03_RELATED_ENTITY_HELPER.js`; HO_SO `10_*` config/repo/validation/seed/migration/bootstrap/test/wrappers/menu; `11_PHUONG_TIEN_*`; `90_BOOTSTRAP_ON_EDIT.js` (task code sync); `40_STAR_PIN_SERVICE.js`; `45_SHARED_WITH_SERVICE.js`; Data Sync `45–49`; `99_MIGRATION_CLEAN_PRO.js`; `98_*` managers; `60_HOSO_API_GATEWAY.js`; `61_UNIFIED_ROUTER.js`; `90_BOOTSTRAP_MENU_HELPERS.js`; `90_BOOTSTRAP_MENU_WRAPPERS.js`; task system `96–97_*`.

---

## Cross-module (no cross-deps)

- 10_HOSO_SERVICE, 20_TASK_SERVICE, 30_FINANCE_SERVICE do **not** call each other.
- Admin services (21–23) depend on ENUM, MASTER_CODE, SHARED; not called by modules.
- Modules depend on CONFIG, UTILS, ENUM, SHARED (plus `03_SHARED_ACTION_REGISTRY` / `03_SHARED_PENDING_FEEDBACK` where they `registerAction` or rely on webhook dispatch).
- **04_CORE_EVENT_QUEUE** is a new shared dependency for modules that emit events. Currently only `30_FINANCE_SERVICE` calls `cbvTryEmitCoreEvent_`. TASK/HO_SO integration is P2+.

---

## Reverse dependency (explicit, documented)

- **90_BOOTSTRAP_USER_SEED** depends on **90_BOOTSTRAP_SCHEMA** (getSchemaHeaders). Load order enforces SCHEMA before USER_SEED.
- **04_CORE_EVENT_PROCESSOR** depends on **04_CORE_EVENT_QUEUE** and **04_CORE_RULE_ENGINE** — all four 04_CORE_* queue/engine/processor files must load in suffix order (TYPES → QUEUE → RULE_ENGINE → PROCESSOR); **04_CORE_EVENT_TRIGGERS.js** loads immediately after PROCESSOR.

---

## Circular check

No circular dependencies. DAG is acyclic.

---

## Open items (tracked)

| ID | Issue | Status |
|----|-------|--------|
| H-1 | `SYSTEM_ACTOR_ID` in `00_CORE_CONFIG.js` | **Open** — needed by DATA_SYNC §6.1 and audit actor in event processor |
| M-1 | `menuRepairWholeSystemSafely` / `menuRepairSchemaSafely` bypass wrapper layer | Open |
| P2 | TASK + HO_SO `cbvTryEmitCoreEvent_` integration | Deferred to Sprint 2 |
| P2 | `checklistDone` / `addLog` in webhook switch → event path | Deferred to Sprint 2 |
| P2 | `executeCoreAction_` stub → real dispatch | Deferred to Sprint 2 |
