# Clasp Push Order — Deterministic Deployment

## Why the order matters

Apps Script loads files in a single global scope. `filePushOrder` in `.clasp.json` defines the deployment order. Dependents must load **after** their dependencies to avoid reference errors during script assembly.

---

## Dependency direction

```
CONFIG → ENUM → MASTER_CODE → USER → SHARED (repository, validation, logger, file helper, ACTION_REGISTRY, PENDING_FEEDBACK) → SCHEMA → USER_SEED → MODULES → TASK → DISPLAY → BOOTSTRAP_INIT/TASK/AUDIT → APPSHEET → DEBUG → BOOTSTRAP_MENU/TRIGGER/INSTALL
```

---

## Documented filePushOrder (exact sequence)

| # | File | Layer | Depends on |
|---|------|-------|------------|
| 1 | 00_CORE_CONFIG.js | CONFIG | — |
| 2 | 00_CORE_CONSTANTS.js | CONFIG | — |
| 3 | 00_CORE_UTILS.js | CONFIG | 00_CORE_CONFIG (cbvMakeId uses CBV_CONFIG) |
| 4 | 01_ENUM_CONFIG.js | ENUM | — |
| 5 | 01_ENUM_REPOSITORY.js | ENUM | 00_CORE_CONFIG, 00_CORE_CONSTANTS |
| 6 | 01_ENUM_SYNC_SERVICE.js | ENUM | 00_CORE_CONFIG, 01_ENUM_CONFIG |
| 7 | 01_ENUM_SERVICE.js | ENUM | 01_ENUM_REPOSITORY, 01_ENUM_SYNC_SERVICE |
| 8 | 01_ENUM_SEED.js | ENUM | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_CONFIG |
| 9 | 01_ENUM_AUDIT.js | ENUM | 01_ENUM_SERVICE |
| 10 | 02_MASTER_CODE_SERVICE.js | MASTER_CODE | 00_CORE_CONFIG |
| 11 | 02_USER_SERVICE.js | USER | 00_CORE_CONFIG, 00_CORE_UTILS |
| 12 | 03_SHARED_ROW_READER.js | SHARED | 00_CORE_UTILS (blank-row helpers) |
| 13 | 03_SHARED_REPOSITORY.js | SHARED | 00_CORE_UTILS, 03_SHARED_ROW_READER |
| 14 | 03_SHARED_VALIDATION.js | SHARED | 00_CORE_UTILS |
| 15 | 03_SHARED_LOGGER.js | SHARED | — |
| 16 | 03_SHARED_FILE_HELPER.js | SHARED | — |
| 17 | 03_SHARED_ACTION_REGISTRY.js | SHARED | — |
| 18 | 03_SHARED_PENDING_FEEDBACK.js | SHARED | 03_SHARED_ACTION_REGISTRY, 00_CORE_UTILS, 03_SHARED_REPOSITORY |
| 18a | 04_CORE_EVENT_TYPES.js | CORE | 00_CORE_CONFIG (PropertiesService) |
| 18b | 04_CORE_EVENT_QUEUE.js | CORE | 04_CORE_EVENT_TYPES, 00_CORE_UTILS, 03_SHARED_REPOSITORY |
| 18c | 04_CORE_RULE_ENGINE.js | CORE | 03_SHARED_REPOSITORY, 00_CORE_CONFIG |
| 18c1 | 04_CORE_ACTION_REGISTRY.js | CORE | — (pluggable allowlist for INVOKE_SERVICE; modules register at load time) |
| 18d | 04_CORE_EVENT_PROCESSOR.js | CORE | 04_CORE_RULE_ENGINE, 04_CORE_ACTION_REGISTRY, 03_SHARED_REPOSITORY, 00_CORE_UTILS |
| 18e | 04_CORE_EVENT_TRIGGERS.js | CORE | 04_CORE_EVENT_PROCESSOR, ScriptApp | `coreEventQueueProcessMinutely`, install/uninstall |
| 19 | 03_USER_MIGRATION_HELPER.js | USER | 00_CORE_CONFIG, 02_USER_SERVICE, 03_SHARED_REPOSITORY, 03_SHARED_LOGGER |
| 20 | 02_USER_VALIDATION.js | USER | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY |
| 21 | 01_ENUM_ADMIN_SERVICE.js | ADMIN | 01_ENUM_*, 03_SHARED_* |
| 22 | 02_MASTER_CODE_ADMIN_SERVICE.js | ADMIN | 02_MASTER_CODE, 01_ENUM, 03_SHARED_* |
| 23 | 03_ADMIN_AUDIT_SERVICE.js | ADMIN | 03_SHARED_LOGGER |
| 24 | 90_BOOTSTRAP_SCHEMA.js | BOOTSTRAP | — (manifest only) |
| 25 | 90_BOOTSTRAP_USER_SEED.js | BOOTSTRAP | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA |
| 26 | 90_BOOTSTRAP_AUDIT_SCHEMA.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA |
| 27 | 90_BOOTSTRAP_LIFECYCLE.js | BOOTSTRAP | — |
| 28 | 90_BOOTSTRAP_PROTECTION.js | BOOTSTRAP | — |
| 28a | 10_HOSO_EVENTS.js | MODULES | 04_CORE_EVENT_TYPES, 04_CORE_EVENT_QUEUE (emit helpers; must load before 10_HOSO_SERVICE) |
| 29 | 10_HOSO_SERVICE.js | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE, 10_HOSO_REPOSITORY, 10_HOSO_VALIDATION, 10_HOSO_EVENTS |
| 30 | 20_TASK_REPOSITORY.js | TASK | 00_CORE_CONFIG, 03_SHARED_REPOSITORY |
| 31 | 20_TASK_VALIDATION.js | TASK | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY |
| 31a | 20_TASK_STATUS_SNAPSHOT.js | TASK | 04_CORE_EVENT_QUEUE, CBV_CONFIG |
| 32 | 20_TASK_SERVICE.js | TASK | 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 20_TASK_STATUS_SNAPSHOT, 02_USER_SERVICE, 01_ENUM_SERVICE |
| 32a | 21_MASTER_DATA_HELPER.js | TASK | 00_CORE_CONFIG, 03_SHARED_REPOSITORY |
| 33 | 20_TASK_MIGRATION_HELPER.js | TASK | 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER |
| 34 | 30_FINANCE_SERVICE.js | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE |
| 35 | 40_DISPLAY_MAPPING_SERVICE.js | DISPLAY | 01_ENUM_*, 02_MASTER_CODE_SERVICE |
| 36 | 90_BOOTSTRAP_INIT.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY |
| 36a | 95_TASK_SYSTEM_BOOTSTRAP.js | BOOTSTRAP | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA |
| 37 | 90_BOOTSTRAP_TASK.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT |
| 38 | 90_BOOTSTRAP_AUDIT.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 00_CORE_UTILS, 03_SHARED_ROW_READER |
| 39 | 90_BOOTSTRAP_REPAIR.js | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA |
| 40 | 50_APPSHEET_VERIFY.js | APPSHEET | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA |
| 41 | 99_DEBUG_TEST_HOSO.js | DEBUG | 10_HOSO_SERVICE |
| 42 | 99_DEBUG_TASK_TEST.js | DEBUG | 20_TASK_SERVICE (defines runTaskTests) |
| 43 | 99_DEBUG_TEST_TASK.js | DEBUG | runTaskTests (via 99_DEBUG_TASK_TEST) |
| 44 | 99_DEBUG_TEST_FINANCE.js | DEBUG | 30_FINANCE_SERVICE |
| 45 | 99_DEBUG_TEST_RUNNER.js | DEBUG | 99_DEBUG_TEST_* |
| 46 | 99_DEBUG_SAMPLE_DATA.js | DEBUG | 10, 20, 30 |
| 47 | 90_BOOTSTRAP_MENU.js | BOOTSTRAP | initAll, repairSchemaAndData, installTriggers, runAllModuleTests, seedGoldenDataset, verifyAppSheetReadiness, runEnumHealthCheck, runSafeRepairDryRun, auditSystem |
| 48 | 90_BOOTSTRAP_TRIGGER.js | BOOTSTRAP | — |
| 49 | 90_BOOTSTRAP_INSTALL.js | BOOTSTRAP | 00_CORE_UTILS |
| 50 | 90_BOOTSTRAP_TRIGGERS_ALL.js | BOOTSTRAP | 90_BOOTSTRAP_INSTALL, 90_BOOTSTRAP_ON_EDIT, 04_CORE_EVENT_TRIGGERS |

---

## Key rules enforced

1. **CONFIG first** — CBV_CONFIG and CBV_ENUM before any service.
2. **ENUM before MASTER_CODE** — Both before shared infra.
3. **SHARED before MODULES** — 03_* (repository, validation, logger, file helper, ACTION_REGISTRY, PENDING_FEEDBACK) before 10/20/30; **04_CORE_*** (event queue, rules, processor) immediately after PENDING_FEEDBACK so modules can call `cbvTryEmitCoreEvent_`. Registry + pending feedback load immediately after file helper so modules can `registerAction` at load time and webhook can dispatch generically.
4. **SCHEMA before USER_SEED** — 90_BOOTSTRAP_USER_SEED depends on getSchemaHeaders (90_BOOTSTRAP_SCHEMA).
5. **MODULES before DISPLAY** — 40_DISPLAY uses enum/master-code; modules use shared.
6. **DISPLAY before BOOTSTRAP_INIT** — initAll calls ensureDisplayTextForEnumRows/MasterCodeRows.
7. **BOOTSTRAP_AUDIT before APPSHEET** — verifyAppSheetReadiness calls selfAuditBootstrap.
8. **DEBUG after MODULES** — 99_* calls createHoSo, createTask, createTransaction.
9. **BOOTSTRAP_MENU last** — onOpen references all menu handlers; they must exist.

---

## HTML files

No HTML files in 05_GAS_RUNTIME. If added later, include in filePushOrder after the GAS files they depend on.

---

## Exact filePushOrder (matches .clasp.json)

The sequence in `.clasp.json` filePushOrder is the deployment order. SHARED layer excerpt (matches push order after file helper):

```
   03_SHARED_FILE_HELPER.js
   03_SHARED_ACTION_REGISTRY.js
   03_SHARED_PENDING_FEEDBACK.js
   03_USER_MIGRATION_HELPER.js
```

Task system files:

```
… 10_HOSO_SERVICE.js
   20_TASK_REPOSITORY.js
   20_TASK_VALIDATION.js
   20_TASK_STATUS_SNAPSHOT.js
   20_TASK_SERVICE.js
   20_TASK_MIGRATION_HELPER.js
   30_FINANCE_SERVICE.js
   …
   90_BOOTSTRAP_INIT.js
   90_BOOTSTRAP_TASK.js
   90_BOOTSTRAP_AUDIT.js
   …
   99_DEBUG_TASK_TEST.js
   99_DEBUG_TEST_TASK.js
   …
```

---

## Verification

```bash
clasp push
```

Then run `initAll()` and confirm menu items work (Init All, Run All Tests, etc.).
