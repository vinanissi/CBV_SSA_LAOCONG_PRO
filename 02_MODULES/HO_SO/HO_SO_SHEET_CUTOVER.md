# HO_SO_MASTER — thứ tự cắt sheet (xóa cột `HO_SO_TYPE`)

Thực hiện **một chiều** sau khi code/docs đã deploy.

1. Chạy `migrateHosoLegacyToPro_()` nếu còn dòng thiếu `HO_SO_TYPE_ID` / `HO_SO_CODE`.
2. Trên AppSheet: đổi slice **ACTIVE_HTX** và Valid_If **HTX_ID** sang `[HO_SO_TYPE_ID].[CODE] = "HTX"` (không dùng cột `HO_SO_TYPE`).
3. `clasp push` GAS mới; kiểm tra `createHoSo` / list filter `ho_so_type`.
4. Trên Google Sheet: **xóa cột** `HO_SO_TYPE` (và đổi `TAGS` → `TAGS_TEXT` nếu sheet cũ còn tên `TAGS`).
5. Chạy bootstrap / `ensureSchemas` để header khớp [`90_BOOTSTRAP_SCHEMA.js`](../../05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js) và [`06_DATABASE/schema_manifest.json`](../../06_DATABASE/schema_manifest.json).
6. Thêm cột `IS_STARRED`, `IS_PINNED`, `PENDING_ACTION` nếu chưa có; chạy lại audit.
