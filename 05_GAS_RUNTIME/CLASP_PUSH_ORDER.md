# Clasp Push Order — Deterministic Deployment

## Why the order matters

Apps Script loads files in a single global scope. `filePushOrder` in `.clasp.json` defines the deployment order. Dependents must load **after** their dependencies to avoid reference errors during script assembly.

---

## Dependency direction

```
CONFIG → ENUM → MASTER_CODE → SHARED → SCHEMA → MODULES → DISPLAY → BOOTSTRAP_INIT/AUDIT → APPSHEET → DEBUG → BOOTSTRAP_MENU/TRIGGER/INSTALL
```

---

## Documented filePushOrder (exact sequence)

| # | File | Layer | Depends on |
|---|------|-------|------------|
| 1 | 00_CORE_CONFIG.gs | CONFIG | — |
| 2 | 00_CORE_CONSTANTS.gs | CONFIG | — |
| 3 | 00_CORE_UTILS.gs | CONFIG | 00_CORE_CONFIG (cbvMakeId uses CBV_CONFIG) |
| 4 | 01_ENUM_REPOSITORY.gs | ENUM | 00_CORE_CONFIG, 00_CORE_CONSTANTS |
| 5 | 01_ENUM_SERVICE.gs | ENUM | 01_ENUM_REPOSITORY |
| 6 | 01_ENUM_SEED.gs | ENUM | 00_CORE_CONFIG, 00_CORE_UTILS (buildStructuredBootstrapReport) |
| 7 | 01_ENUM_AUDIT.gs | ENUM | 01_ENUM_SERVICE |
| 8 | 02_MASTER_CODE_SERVICE.gs | MASTER_CODE | 00_CORE_CONFIG |
| 9 | 03_SHARED_REPOSITORY.gs | SHARED | 00_CORE_UTILS (cbvAssert) |
| 10 | 03_SHARED_VALIDATION.gs | SHARED | 00_CORE_UTILS |
| 11 | 03_SHARED_LOGGER.gs | SHARED | — |
| 12 | 01_ENUM_ADMIN_SERVICE.gs | ADMIN | 01_ENUM_*, 03_SHARED_* |
| 13 | 02_MASTER_CODE_ADMIN_SERVICE.gs | ADMIN | 02_MASTER_CODE, 01_ENUM, 03_SHARED_* |
| 14 | 03_ADMIN_AUDIT_SERVICE.gs | ADMIN | 03_SHARED_LOGGER |
| 15 | 90_BOOTSTRAP_SCHEMA.gs | BOOTSTRAP | — (manifest only) |
| 16 | 10_HOSO_SERVICE.gs | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE |
| 17 | 20_TASK_SERVICE.gs | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE |
| 18 | 30_FINANCE_SERVICE.gs | MODULES | 00_CORE_CONFIG, 03_SHARED_*, 01_ENUM_SERVICE |
| 19 | 40_DISPLAY_MAPPING_SERVICE.gs | DISPLAY | 01_ENUM_*, 02_MASTER_CODE_SERVICE |
| 20 | 90_BOOTSTRAP_INIT.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 01_ENUM_SEED, 40_DISPLAY |
| 21 | 90_BOOTSTRAP_AUDIT.gs | BOOTSTRAP | 90_BOOTSTRAP_SCHEMA, 00_CORE_UTILS |
| 22 | 50_APPSHEET_VERIFY.gs | APPSHEET | 90_BOOTSTRAP_AUDIT, 90_BOOTSTRAP_SCHEMA |
| 23 | 99_DEBUG_TEST_HOSO.gs | DEBUG | 10_HOSO_SERVICE |
| 24 | 99_DEBUG_TEST_TASK.gs | DEBUG | 20_TASK_SERVICE |
| 25 | 99_DEBUG_TEST_FINANCE.gs | DEBUG | 30_FINANCE_SERVICE |
| 26 | 99_DEBUG_TEST_RUNNER.gs | DEBUG | 99_DEBUG_TEST_* |
| 27 | 99_DEBUG_SAMPLE_DATA.gs | DEBUG | 10, 20, 30 |
| 28 | 90_BOOTSTRAP_MENU.gs | BOOTSTRAP | initAll, installTriggers, runAllModuleTests, seedGoldenDataset, verifyAppSheetReadiness, auditSystem |
| 29 | 90_BOOTSTRAP_TRIGGER.gs | BOOTSTRAP | — |
| 30 | 90_BOOTSTRAP_INSTALL.gs | BOOTSTRAP | 00_CORE_UTILS |

---

## Key rules enforced

1. **CONFIG first** — CBV_CONFIG and CBV_ENUM before any service.
2. **ENUM before MASTER_CODE** — Both before shared infra.
3. **SHARED before MODULES** — 03_* (repository, validation, logger) before 10/20/30.
4. **SCHEMA before INIT** — 90_BOOTSTRAP_SCHEMA loads early (no module deps); INIT needs it.
5. **MODULES before DISPLAY** — 40_DISPLAY uses enum/master-code; modules use shared.
6. **DISPLAY before BOOTSTRAP_INIT** — initAll calls ensureDisplayTextForEnumRows/MasterCodeRows.
7. **BOOTSTRAP_AUDIT before APPSHEET** — verifyAppSheetReadiness calls selfAuditBootstrap.
8. **DEBUG after MODULES** — 99_* calls createHoSo, createTask, createTransaction.
9. **BOOTSTRAP_MENU last** — onOpen references all menu handlers; they must exist.

---

## HTML files

No HTML files in 05_GAS_RUNTIME. If added later, include in filePushOrder after the GAS files they depend on.

---

## Verification

```bash
clasp push
```

Then run `initAll()` and confirm menu items work (Init All, Run All Tests, etc.).
