# GAS BOOTSTRAP SPEC - LAOCONG PRO

## File order (match .clasp.json filePushOrder)

See **CLASP_PUSH_ORDER.md** for full dependency rationale.

1. 00_CORE_CONFIG.gs
2. 00_CORE_CONSTANTS.gs
3. 00_CORE_UTILS.gs
4. 01_ENUM_REPOSITORY.gs
5. 01_ENUM_SERVICE.gs
6. 01_ENUM_SEED.gs
7. 01_ENUM_AUDIT.gs
8. 02_MASTER_CODE_SERVICE.gs
9. 03_SHARED_REPOSITORY.gs
10. 03_SHARED_VALIDATION.gs
11. 03_SHARED_LOGGER.gs
12. 01_ENUM_ADMIN_SERVICE.gs
13. 02_MASTER_CODE_ADMIN_SERVICE.gs
14. 03_ADMIN_AUDIT_SERVICE.gs
15. 90_BOOTSTRAP_SCHEMA.gs
16. 10_HOSO_SERVICE.gs
17. 20_TASK_SERVICE.gs
18. 30_FINANCE_SERVICE.gs
19. 40_DISPLAY_MAPPING_SERVICE.gs
20. 90_BOOTSTRAP_INIT.gs
21. 90_BOOTSTRAP_AUDIT.gs
22. 50_APPSHEET_VERIFY.gs
23. 99_DEBUG_TEST_HOSO.gs
24. 99_DEBUG_TEST_TASK.gs
25. 99_DEBUG_TEST_FINANCE.gs
26. 99_DEBUG_TEST_RUNNER.gs
27. 99_DEBUG_SAMPLE_DATA.gs
28. 90_BOOTSTRAP_MENU.gs
29. 90_BOOTSTRAP_TRIGGER.gs
30. 90_BOOTSTRAP_INSTALL.gs

## Cách bootstrap
- Tạo bound script với file DB (hoặc dùng clasp).
- Copy tất cả file `.gs` hoặc `clasp push`.
- Chạy `initAll()` — tạo sheets, seed enum, fill DISPLAY_TEXT.
- Chạy `installTriggers()` (nếu dùng).
- Reload Sheets để thấy menu.

## Functions chạy
- `initAll()` — đủ (gồm seedEnumDictionary, ensureDisplayTextForEnumRows, ensureDisplayTextForMasterCodeRows)
- `auditEnumConsistency()` — kiểm enum
- `verifyAppSheetReadiness()` — kiểm AppSheet

## Reference
- CBV_LAOCONG_PRO_REFERENCE.md — consolidated reference
