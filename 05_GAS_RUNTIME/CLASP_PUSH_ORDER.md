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
| 1 | 00_CORE_CONFIG.gs | CONFIG | — |
| 2 | 00_CORE_CONSTANTS.gs | CONFIG | — |
| 3 | 00_CORE_UTILS.gs | CONFIG | 00_CORE_CONFIG (cbvMakeId uses CBV_CONFIG) |
| 4 | 01_ENUM_CONFIG.gs | ENUM | — |
| 5 | 01_ENUM_REPOSITORY.gs | ENUM | 00_CORE_CONFIG, 00_CORE_CONSTANTS |
| 6 | 01_ENUM_SYNC_SERVICE.gs | ENUM | 00_CORE_CONFIG, 01_ENUM_CONFIG |
| 7 | 01_ENUM_SERVICE.gs | ENUM | 01_ENUM_REPOSITORY, 01_ENUM_SYNC_SERVICE |
| 8 | 01_ENUM_SEED.gs | ENUM | 00_CORE_CONFIG, 00_CORE_UTILS, 01_ENUM_CONFIG |
| 9 | 01_ENUM_AUDIT.gs | ENUM | 01_ENUM_SERVICE |
| 10 | 02_MASTER_CODE_SERVICE.gs | MASTER_CODE | 00_CORE_CONFIG |
| 11 | 02_USER_SERVICE.gs | USER | 00_CORE_CONFIG, 00_CORE_UTILS |
| 12 | 03_SHARED_ROW_READER.gs | SHARED | 00_CORE_UTILS (blank-row helpers) |
| 13 | 03_SHARED_REPOSITORY.gs | SHARED | 00_CORE_UTILS, 03_SHARED_ROW_READER |
| 14 | 03_SHARED_VALIDATION.gs | SHARED | 00_CORE_UTILS |
| 15 | 03_SHARED_LOGGER.gs | SHARED | — |
| 16 | 03_SHARED_FILE_HELPER.gs | SHARED | — |
| 17 | 03_SHARED_ACTION_REGISTRY.gs | SHARED | — |
| 18 | 03_SHARED_PENDING_FEEDBACK.gs | SHARED | 03_SHARED_ACTION_REGISTRY, 00_CORE_UTILS, 03_SHARED_REPOSITORY |
| 19 | 03_USER_MIGRATION_HELPER.gs | USER | 00_CORE_CONFIG, 02_USER_SERVICE, 03_SHARED_REPOSITORY, 03_SHARED_LOGGER |
| 20 | 02_USER_VALIDATION.gs | USER | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY |
| 21 | 01_ENUM_ADMIN_SERVICE.gs | ADMIN | 01_ENUM_*, 03_SHARED_* |
| 22 | 02_MASTER_CODE_ADMIN_SERVICE.gs | ADMIN | 02_MASTER_CODE, 01_ENUM, 03_SHARED_* |
| 23 | 03_ADMIN_AUDIT_SERVICE.gs | ADMIN | 03_SHARED_LOGGER |
| 24 | 90_BOOTSTRAP_SCHEMA.gs | BOOTSTRAP | — (manifest only) |
| 25 | 90_BOOTSTRAP_USER_SEED.gs | BOOTSTRAP | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA |
| 26 | 90_BOOTSTRAP_AUDIT_SCHEMA.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA |
| 27 | 90_BOOTSTRAP_LIFECYCLE.gs | BOOTSTRAP | — |
| 28 | 90_BOOTSTRAP_PROTECTION.gs | BOOTSTRAP | — |
| 29 | 10_HOSO_SERVICE.gs | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE |
| 30 | 20_TASK_REPOSITORY.gs | TASK | 00_CORE_CONFIG, 03_SHARED_REPOSITORY |
| 31 | 20_TASK_VALIDATION.gs | TASK | 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY |
| 32 | 20_TASK_SERVICE.gs | TASK | 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE |
| 32a | 21_MASTER_DATA_HELPER.gs | TASK | 00_CORE_CONFIG, 03_SHARED_REPOSITORY |
| 33 | 20_TASK_MIGRATION_HELPER.gs | TASK | 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER |
| 34 | 30_FINANCE_SERVICE.gs | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE, 02_USER_SERVICE |
| 35 | 40_DISPLAY_MAPPING_SERVICE.gs | DISPLAY | 01_ENUM_*, 02_MASTER_CODE_SERVICE |
| 36 | 90_BOOTSTRAP_INIT.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY |
| 36a | 95_TASK_SYSTEM_BOOTSTRAP.gs | BOOTSTRAP | 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA |
| 37 | 90_BOOTSTRAP_TASK.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT |
| 38 | 90_BOOTSTRAP_AUDIT.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 00_CORE_UTILS, 03_SHARED_ROW_READER |
| 39 | 90_BOOTSTRAP_REPAIR.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA |
| 40 | 50_APPSHEET_VERIFY.gs | APPSHEET | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA |
| 41 | 99_DEBUG_TEST_HOSO.gs | DEBUG | 10_HOSO_SERVICE |
| 42 | 99_DEBUG_TASK_TEST.gs | DEBUG | 20_TASK_SERVICE (defines runTaskTests) |
| 43 | 99_DEBUG_TEST_TASK.gs | DEBUG | runTaskTests (via 99_DEBUG_TASK_TEST) |
| 44 | 99_DEBUG_TEST_FINANCE.gs | DEBUG | 30_FINANCE_SERVICE |
| 45 | 99_DEBUG_TEST_RUNNER.gs | DEBUG | 99_DEBUG_TEST_* |
| 46 | 99_DEBUG_SAMPLE_DATA.gs | DEBUG | 10, 20, 30 |
| 47 | 90_BOOTSTRAP_MENU.gs | BOOTSTRAP | initAll, repairSchemaAndData, installTriggers, runAllModuleTests, seedGoldenDataset, verifyAppSheetReadiness, runEnumHealthCheck, runSafeRepairDryRun, auditSystem |
| 48 | 90_BOOTSTRAP_TRIGGER.gs | BOOTSTRAP | — |
| 49 | 90_BOOTSTRAP_INSTALL.gs | BOOTSTRAP | 00_CORE_UTILS |

---

## Key rules enforced

1. **CONFIG first** — CBV_CONFIG and CBV_ENUM before any service.
2. **ENUM before MASTER_CODE** — Both before shared infra.
3. **SHARED before MODULES** — 03_* (repository, validation, logger, file helper, ACTION_REGISTRY, PENDING_FEEDBACK) before 10/20/30. Registry + pending feedback load immediately after file helper so modules can `registerAction` at load time and webhook can dispatch generically.
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
   03_SHARED_FILE_HELPER.gs
   03_SHARED_ACTION_REGISTRY.gs
   03_SHARED_PENDING_FEEDBACK.gs
   03_USER_MIGRATION_HELPER.gs
```

Task system files:

```
… 10_HOSO_SERVICE.gs
   20_TASK_REPOSITORY.gs
   20_TASK_VALIDATION.gs
   20_TASK_SERVICE.gs
   20_TASK_MIGRATION_HELPER.gs
   30_FINANCE_SERVICE.gs
   …
   90_BOOTSTRAP_INIT.gs
   90_BOOTSTRAP_TASK.gs
   90_BOOTSTRAP_AUDIT.gs
   …
   99_DEBUG_TASK_TEST.gs
   99_DEBUG_TEST_TASK.gs
   …
```

---

## Verification

```bash
clasp push
```

Then run `initAll()` and confirm menu items work (Init All, Run All Tests, etc.).
