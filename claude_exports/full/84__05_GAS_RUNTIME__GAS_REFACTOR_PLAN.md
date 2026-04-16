# GAS Refactor Plan — CBV-Compliant Naming and Load Order

## 1. Rename Plan

Structural refactor only. No behavior change. No schema change. No logic move across layers.

---

## 2. Old → New File Mapping

| Old File | New File | Rationale |
|----------|----------|-----------|
| config.js | 00_CORE_CONFIG.js | CBV_CONFIG, SHEETS — core config first |
| enum.js | 00_CORE_CONSTANTS.js | CBV_ENUM fallback — constants before services |
| util.js | 00_CORE_UTILS.js | cbvNow, cbvUser, cbvAssert, buildStructuredBootstrapReport — core helpers |
| enum_repository.js | 01_ENUM_REPOSITORY.js | ENUM_DICTIONARY sheet loader — enum layer |
| enum_service.js | 01_ENUM_SERVICE.js | getEnumValues, assertValidEnumValue |
| enum_seed.js | 01_ENUM_SEED.js | seedEnumDictionary() |
| enum_audit.js | 01_ENUM_AUDIT.js | auditEnumConsistency() |
| master_code_service.js | 02_MASTER_CODE_SERVICE.js | getMasterCodes, assertValidMasterCode — no repo/seed/audit exists |
| repository.js | 03_SHARED_REPOSITORY.js | _sheet, _rows, _findById — shared data access |
| validation_service.js | 03_SHARED_VALIDATION.js | ensureRequired, ensureTransition |
| log_service.js | 03_SHARED_LOGGER.js | log helpers — shared infra |
| ho_so_service.js | 10_HOSO_SERVICE.js | HO_SO module — prefix 10 |
| task_service.js | 20_TASK_SERVICE.js | TASK module — prefix 20 |
| finance_service.js | 30_FINANCE_SERVICE.js | FINANCE module — prefix 30 |
| display_mapping_service.js | 40_DISPLAY_MAPPING_SERVICE.js | Display layer — prefix 40 |
| verify_appsheet.js | 50_APPSHEET_VERIFY.js | AppSheet readiness — prefix 50 |
| schema_manifest.js | 90_BOOTSTRAP_SCHEMA.js | CBV_SCHEMA_MANIFEST, getRequiredSheetNames |
| init_schema.js | 90_BOOTSTRAP_INIT.js | initAll(), initCoreSheets() |
| audit_service.js | 90_BOOTSTRAP_AUDIT.js | selfAuditBootstrap(), auditSystem() |
| bootstrap_menu.js | 90_BOOTSTRAP_MENU.js | onOpen() |
| triggers.js | 90_BOOTSTRAP_TRIGGER.js | Trigger definitions |
| install.js | 90_BOOTSTRAP_INSTALL.js | installTriggers() |
| test_hoso.js | 99_DEBUG_TEST_HOSO.js | Debug/test — prefix 99 |
| test_task.js | 99_DEBUG_TEST_TASK.js | Debug/test |
| test_finance.js | 99_DEBUG_TEST_FINANCE.js | Debug/test |
| test_runner.js | 99_DEBUG_TEST_RUNNER.js | runAllModuleTests() |
| sample_data.js | 99_DEBUG_SAMPLE_DATA.js | seedGoldenDataset() |

---

## 3. Final File List (Load Order)

See **CLASP_PUSH_ORDER.md** for dependency rationale.

```
00_CORE_CONFIG.js
00_CORE_CONSTANTS.js
00_CORE_UTILS.js
01_ENUM_REPOSITORY.js
01_ENUM_SERVICE.js
01_ENUM_SEED.js
01_ENUM_AUDIT.js
02_MASTER_CODE_SERVICE.js
03_SHARED_REPOSITORY.js
03_SHARED_VALIDATION.js
03_SHARED_LOGGER.js
90_BOOTSTRAP_SCHEMA.js
10_HOSO_SERVICE.js
20_TASK_SERVICE.js
30_FINANCE_SERVICE.js
40_DISPLAY_MAPPING_SERVICE.js
90_BOOTSTRAP_INIT.js
90_BOOTSTRAP_AUDIT.js
50_APPSHEET_VERIFY.js
99_DEBUG_TEST_HOSO.js
99_DEBUG_TEST_TASK.js
99_DEBUG_TEST_FINANCE.js
99_DEBUG_TEST_RUNNER.js
99_DEBUG_SAMPLE_DATA.js
90_BOOTSTRAP_MENU.js
90_BOOTSTRAP_TRIGGER.js
90_BOOTSTRAP_INSTALL.js
```

**Note:** Order follows dependency direction. DEBUG (99) loads before BOOTSTRAP_MENU so `runAllModuleTests` and `seedGoldenDataset` exist when `onOpen` creates the menu.

---

## 4. Files Not Present (No Action)

- No HTML files — target UI_*.html not created (none exist)
- MASTER_CODE: no repository, seed, audit — single service only
- HO_SO/TASK/FINANCE: no separate repository/validation files — logic in service

---

## 5. Internal References Updated

| File | Change |
|------|--------|
| .clasp.json | filePushOrder → new filenames ✓ |
| CBV_LAOCONG_PRO_REFERENCE.md | Stable Structure section ✓ |
| GAS_BOOTSTRAP_SPEC_LAOCONG_PRO.md | File order list ✓ |
| BOOTSTRAP_DEPLOY.md | File tree ✓ |
| BOOTSTRAP_AUDIT_REPORT.md | File references ✓ |
| build_manifest.json | GAS entries ✓ |
| 01_ENUM_REPOSITORY.js | Comment updated ✓ |
| 90_BOOTSTRAP_INIT.js | Comment updated ✓ |
