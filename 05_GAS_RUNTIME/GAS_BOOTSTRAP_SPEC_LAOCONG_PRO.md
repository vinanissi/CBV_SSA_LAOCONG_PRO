# GAS BOOTSTRAP SPEC - LAOCONG PRO

## File order (match .clasp.json filePushOrder)
1. config.gs
2. enum.gs
3. enum_repository.gs
4. enum_service.gs
5. enum_seed.gs
6. enum_audit.gs
7. util.gs
8. repository.gs
9. validation_service.gs
10. log_service.gs
11. schema_manifest.gs
12. init_schema.gs
13. master_code_service.gs
14. display_mapping_service.gs
15. ho_so_service.gs
16. task_service.gs
17. finance_service.gs
18. audit_service.gs
19. bootstrap_menu.gs
20. triggers.gs
21. install.gs

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
