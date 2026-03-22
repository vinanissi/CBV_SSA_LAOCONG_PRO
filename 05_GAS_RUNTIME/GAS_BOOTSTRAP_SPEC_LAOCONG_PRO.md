# GAS BOOTSTRAP SPEC - LAOCONG PRO

## File order (match .clasp.json filePushOrder)

See **CLASP_PUSH_ORDER.md** for full dependency rationale and exact sequence.

**Layers:** CONFIG → ENUM → MASTER_CODE → USER → SHARED → ADMIN → SCHEMA → USER_SEED → MODULES → TASK → DISPLAY → BOOTSTRAP_INIT/TASK/AUDIT → APPSHEET → DEBUG → BOOTSTRAP_MENU/TRIGGER/INSTALL

Key files: 00_CORE_*, 01_ENUM_*, 02_*, 03_SHARED_*, 03_USER_MIGRATION_HELPER, 10_HOSO_SERVICE, 20_TASK_*, 30_FINANCE_SERVICE, 40_DISPLAY_MAPPING_SERVICE, 90_BOOTSTRAP_*, 99_DEBUG_*

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
