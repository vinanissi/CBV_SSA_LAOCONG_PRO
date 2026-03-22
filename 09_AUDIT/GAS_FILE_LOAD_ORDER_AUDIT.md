# GAS File Load Order Audit

**Date:** 2025-03-21  
**Scope:** 05_GAS_RUNTIME/*.gs refactor to strict numbered load-order naming convention  

---

## 1. Final File Rename Map

| Before | After |
|--------|-------|
| 20_TASK_SERVICE.gs (stub) | DELETED (merged into 20_TASK_SERVICE.gs) |
| task_service.gs | 20_TASK_SERVICE.gs |
| task_repository.gs | 20_TASK_REPOSITORY.gs |
| task_validation.gs | 20_TASK_VALIDATION.gs |
| task_migration_helper.gs | 20_TASK_MIGRATION_HELPER.gs |
| task_bootstrap.gs | 90_BOOTSTRAP_TASK.gs |
| task_test.gs | 99_DEBUG_TASK_TEST.gs |
| user_migration_helper.gs | 03_USER_MIGRATION_HELPER.gs |
| 02_USER_SEED.gs | 90_BOOTSTRAP_USER_SEED.gs |
| (all others) | No change |

---

## 2. Files Updated Beyond Renaming

| File | Change |
|------|--------|
| 20_TASK_SERVICE.gs | Header: `task_repository` → `20_TASK_REPOSITORY`, `task_validation` → `20_TASK_VALIDATION` |
| 20_TASK_REPOSITORY.gs | Header: `task_service` → `20_TASK_SERVICE` |
| 20_TASK_VALIDATION.gs | Header: `task_repository` → `20_TASK_REPOSITORY` |
| 20_TASK_MIGRATION_HELPER.gs | Header: `task_repository` → `20_TASK_REPOSITORY`, `user_migration_helper` → `03_USER_MIGRATION_HELPER` |
| 99_DEBUG_TEST_TASK.gs | Header: `task_test.gs` → `99_DEBUG_TASK_TEST.gs` |
| .clasp.json | Full filePushOrder rewritten; added 01_ENUM_CONFIG, 01_ENUM_SYNC_SERVICE; reordered for DAG |
| CLASP_PUSH_ORDER.md | Full rewrite with new file names and dependency table |
| DEPENDENCY_MAP.md | Full rewrite with 45-file map |
| GAS_BOOTSTRAP_SPEC_LAOCONG_PRO.md | Simplified; points to CLASP_PUSH_ORDER.md |
| build_manifest.json | Added 20_TASK_REPOSITORY, 20_TASK_VALIDATION, 90_BOOTSTRAP_TASK, 90_BOOTSTRAP_USER_SEED |
| CBV_LAOCONG_PRO_REFERENCE.md | Task layer file names |
| 02_MODULES/TASK_CENTER/TASK_SYSTEM_REFERENCE.md | Task layer file names and flow |
| 04_APPSHEET/APPSHEET_TASK_ACTION_RULES.md | task_validation.gs → 20_TASK_VALIDATION.gs |
| 04_APPSHEET/APPSHEET_USER_MIGRATION_NOTES.md | user_migration_helper.gs → 03_USER_MIGRATION_HELPER.gs |
| 09_AUDIT/TASK_MIGRATION_PLAN.md | File references |
| 09_AUDIT/USER_MIGRATION_PLAN.md | File references |
| 09_AUDIT/TASK_POLICY_AUDIT.md | task_service/validation → 20_TASK_SERVICE/VALIDATION |
| 09_AUDIT/TASK_GAS_RUNTIME_AUDIT.md | File references |
| 09_AUDIT/TASK_RUNTIME_AUDIT.md | Full file name updates |
| 09_AUDIT/TASK_MIGRATION_AUDIT.md | task_migration_helper → 20_TASK_MIGRATION_HELPER |

---

## 3. Top-Level Dependency Risks Found

| Risk | File | Mitigation |
|------|------|------------|
| ENUM_CONFIG object literal | 01_ENUM_CONFIG.gs | Plain object; no cross-file refs at init. **No change needed.** |
| TASK_VALID_TRANSITIONS, TASK_UPDATE_TYPES | 20_TASK_VALIDATION.gs | Plain objects; no cross-file refs. **No change needed.** |
| TASK_MIGRATION_COLUMN_ALIASES, TASK_STATUS_MAPPING | 20_TASK_MIGRATION_HELPER.gs | Plain objects; no cross-file refs. **No change needed.** |
| USER_MIGRATION_FIELDS, HO_SO_PREFIXES | 03_USER_MIGRATION_HELPER.gs | Plain arrays/objects; no cross-file refs. **No change needed.** |
| USER_SEED_SAMPLE_PREFIX | 90_BOOTSTRAP_USER_SEED.gs | Plain string; no cross-file refs. **No change needed.** |

**Conclusion:** No top-level initialization creates order fragility. All constants are self-contained literals. Lazy/function-based refactor not required.

---

## 4. Exact Clasp Push Order

```
1.  00_CORE_CONFIG.gs
2.  00_CORE_CONSTANTS.gs
3.  00_CORE_UTILS.gs
4.  01_ENUM_CONFIG.gs
5.  01_ENUM_REPOSITORY.gs
6.  01_ENUM_SYNC_SERVICE.gs
7.  01_ENUM_SERVICE.gs
8.  01_ENUM_SEED.gs
9.  01_ENUM_AUDIT.gs
10. 02_MASTER_CODE_SERVICE.gs
11. 02_USER_SERVICE.gs
12. 03_SHARED_REPOSITORY.gs
13. 03_SHARED_VALIDATION.gs
14. 03_SHARED_LOGGER.gs
15. 03_SHARED_FILE_HELPER.gs
16. 03_USER_MIGRATION_HELPER.gs
17. 02_USER_VALIDATION.gs
18. 01_ENUM_ADMIN_SERVICE.gs
19. 02_MASTER_CODE_ADMIN_SERVICE.gs
20. 03_ADMIN_AUDIT_SERVICE.gs
21. 90_BOOTSTRAP_SCHEMA.gs
22. 90_BOOTSTRAP_USER_SEED.gs
23. 90_BOOTSTRAP_AUDIT_SCHEMA.gs
24. 90_BOOTSTRAP_LIFECYCLE.gs
25. 90_BOOTSTRAP_PROTECTION.gs
26. 10_HOSO_SERVICE.gs
27. 20_TASK_REPOSITORY.gs
28. 20_TASK_VALIDATION.gs
29. 20_TASK_SERVICE.gs
30. 20_TASK_MIGRATION_HELPER.gs
31. 30_FINANCE_SERVICE.gs
32. 40_DISPLAY_MAPPING_SERVICE.gs
33. 90_BOOTSTRAP_INIT.gs
34. 90_BOOTSTRAP_TASK.gs
35. 90_BOOTSTRAP_AUDIT.gs
36. 50_APPSHEET_VERIFY.gs
37. 99_DEBUG_TEST_HOSO.gs
38. 99_DEBUG_TASK_TEST.gs
39. 99_DEBUG_TEST_TASK.gs
40. 99_DEBUG_TEST_FINANCE.gs
41. 99_DEBUG_TEST_RUNNER.gs
42. 99_DEBUG_SAMPLE_DATA.gs
43. 90_BOOTSTRAP_MENU.gs
44. 90_BOOTSTRAP_TRIGGER.gs
45. 90_BOOTSTRAP_INSTALL.gs
```

---

## 5. Reverse Dependency (Documented)

**90_BOOTSTRAP_USER_SEED** depends on **90_BOOTSTRAP_SCHEMA** (getSchemaHeaders). Both use 90_ prefix; load order enforces SCHEMA (21) before USER_SEED (22). Unavoidable; explicitly documented in DEPENDENCY_MAP.md and CLASP_PUSH_ORDER.md.

---

## 6. Final File Tree (Alphabetical)

```
00_CORE_CONFIG.gs
00_CORE_CONSTANTS.gs
00_CORE_UTILS.gs
01_ENUM_ADMIN_SERVICE.gs
01_ENUM_AUDIT.gs
01_ENUM_CONFIG.gs
01_ENUM_REPOSITORY.gs
01_ENUM_SEED.gs
01_ENUM_SERVICE.gs
01_ENUM_SYNC_SERVICE.gs
02_MASTER_CODE_ADMIN_SERVICE.gs
02_MASTER_CODE_SERVICE.gs
02_USER_SERVICE.gs
02_USER_VALIDATION.gs
03_ADMIN_AUDIT_SERVICE.gs
03_SHARED_FILE_HELPER.gs
03_SHARED_LOGGER.gs
03_SHARED_REPOSITORY.gs
03_SHARED_VALIDATION.gs
03_USER_MIGRATION_HELPER.gs
10_HOSO_SERVICE.gs
20_TASK_MIGRATION_HELPER.gs
20_TASK_REPOSITORY.gs
20_TASK_SERVICE.gs
20_TASK_VALIDATION.gs
30_FINANCE_SERVICE.gs
40_DISPLAY_MAPPING_SERVICE.gs
50_APPSHEET_VERIFY.gs
90_BOOTSTRAP_AUDIT.gs
90_BOOTSTRAP_AUDIT_SCHEMA.gs
90_BOOTSTRAP_INIT.gs
90_BOOTSTRAP_INSTALL.gs
90_BOOTSTRAP_LIFECYCLE.gs
90_BOOTSTRAP_MENU.gs
90_BOOTSTRAP_PROTECTION.gs
90_BOOTSTRAP_SCHEMA.gs
90_BOOTSTRAP_TASK.gs
90_BOOTSTRAP_TRIGGER.gs
90_BOOTSTRAP_USER_SEED.gs
99_DEBUG_SAMPLE_DATA.gs
99_DEBUG_TASK_TEST.gs
99_DEBUG_TEST_FINANCE.gs
99_DEBUG_TEST_HOSO.gs
99_DEBUG_TEST_RUNNER.gs
99_DEBUG_TEST_TASK.gs
```

---

## 7. Circular Dependency Check

No circular dependencies. DAG is acyclic. Verified by tracing all cross-file references.

---

## 8. 30_FINANCE_SERVICE.gs Extension

No missing extension issue found. File exists as `30_FINANCE_SERVICE.gs`; all references use `.gs`. No change required.

---

## 9. Final Statement

**LOAD ORDER SAFE**
