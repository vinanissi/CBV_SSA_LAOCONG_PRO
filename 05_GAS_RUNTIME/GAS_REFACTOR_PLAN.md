# GAS Refactor Plan — CBV-Compliant Naming and Load Order

## 1. Rename Plan

Structural refactor only. No behavior change. No schema change. No logic move across layers.

---

## 2. Old → New File Mapping

| Old File | New File | Rationale |
|----------|----------|-----------|
| config.gs | 00_CORE_CONFIG.gs | CBV_CONFIG, SHEETS — core config first |
| enum.gs | 00_CORE_CONSTANTS.gs | CBV_ENUM fallback — constants before services |
| util.gs | 00_CORE_UTILS.gs | cbvNow, cbvUser, cbvAssert, buildStructuredBootstrapReport — core helpers |
| enum_repository.gs | 01_ENUM_REPOSITORY.gs | ENUM_DICTIONARY sheet loader — enum layer |
| enum_service.gs | 01_ENUM_SERVICE.gs | getEnumValues, assertValidEnumValue |
| enum_seed.gs | 01_ENUM_SEED.gs | seedEnumDictionary() |
| enum_audit.gs | 01_ENUM_AUDIT.gs | auditEnumConsistency() |
| master_code_service.gs | 02_MASTER_CODE_SERVICE.gs | getMasterCodes, assertValidMasterCode — no repo/seed/audit exists |
| repository.gs | 03_SHARED_REPOSITORY.gs | _sheet, _rows, _findById — shared data access |
| validation_service.gs | 03_SHARED_VALIDATION.gs | ensureRequired, ensureTransition |
| log_service.gs | 03_SHARED_LOGGER.gs | log helpers — shared infra |
| ho_so_service.gs | 10_HOSO_SERVICE.gs | HO_SO module — prefix 10 |
| task_service.gs | 20_TASK_SERVICE.gs | TASK module — prefix 20 |
| finance_service.gs | 30_FINANCE_SERVICE.gs | FINANCE module — prefix 30 |
| display_mapping_service.gs | 40_DISPLAY_MAPPING_SERVICE.gs | Display layer — prefix 40 |
| verify_appsheet.gs | 50_APPSHEET_VERIFY.gs | AppSheet readiness — prefix 50 |
| schema_manifest.gs | 90_BOOTSTRAP_SCHEMA.gs | CBV_SCHEMA_MANIFEST, getRequiredSheetNames |
| init_schema.gs | 90_BOOTSTRAP_INIT.gs | initAll(), initCoreSheets() |
| audit_service.gs | 90_BOOTSTRAP_AUDIT.gs | selfAuditBootstrap(), auditSystem() |
| bootstrap_menu.gs | 90_BOOTSTRAP_MENU.gs | onOpen() |
| triggers.gs | 90_BOOTSTRAP_TRIGGER.gs | Trigger definitions |
| install.gs | 90_BOOTSTRAP_INSTALL.gs | installTriggers() |
| test_hoso.gs | 99_DEBUG_TEST_HOSO.gs | Debug/test — prefix 99 |
| test_task.gs | 99_DEBUG_TEST_TASK.gs | Debug/test |
| test_finance.gs | 99_DEBUG_TEST_FINANCE.gs | Debug/test |
| test_runner.gs | 99_DEBUG_TEST_RUNNER.gs | runAllModuleTests() |
| sample_data.gs | 99_DEBUG_SAMPLE_DATA.gs | seedGoldenDataset() |

---

## 3. Final File List (Load Order)

See **CLASP_PUSH_ORDER.md** for dependency rationale.

```
00_CORE_CONFIG.gs
00_CORE_CONSTANTS.gs
00_CORE_UTILS.gs
01_ENUM_REPOSITORY.gs
01_ENUM_SERVICE.gs
01_ENUM_SEED.gs
01_ENUM_AUDIT.gs
02_MASTER_CODE_SERVICE.gs
03_SHARED_REPOSITORY.gs
03_SHARED_VALIDATION.gs
03_SHARED_LOGGER.gs
90_BOOTSTRAP_SCHEMA.gs
10_HOSO_SERVICE.gs
20_TASK_SERVICE.gs
30_FINANCE_SERVICE.gs
40_DISPLAY_MAPPING_SERVICE.gs
90_BOOTSTRAP_INIT.gs
90_BOOTSTRAP_AUDIT.gs
50_APPSHEET_VERIFY.gs
99_DEBUG_TEST_HOSO.gs
99_DEBUG_TEST_TASK.gs
99_DEBUG_TEST_FINANCE.gs
99_DEBUG_TEST_RUNNER.gs
99_DEBUG_SAMPLE_DATA.gs
90_BOOTSTRAP_MENU.gs
90_BOOTSTRAP_TRIGGER.gs
90_BOOTSTRAP_INSTALL.gs
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
| 01_ENUM_REPOSITORY.gs | Comment updated ✓ |
| 90_BOOTSTRAP_INIT.gs | Comment updated ✓ |
