# SERVICE MAP — HO_SO (PRO)

Implementation: `05_GAS_RUNTIME/10_HOSO_SERVICE.gs` (+ repository / validation / migration).

## Public API

| Function | Mô tả |
|----------|--------|
| `createHoso(data)` | Tạo master; sinh `ID`, `HO_SO_CODE`; log `CREATE` |
| `updateHoso(id, patch)` | Patch (không `STATUS`, không `HO_SO_CODE`); log `UPDATE_INFO` |
| `changeHosoStatus(id, newStatus, note)` | Đổi trạng thái; log `CHANGE_STATUS` |
| `closeHoso(id, note)` | `STATUS=CLOSED`; log `CLOSE` |
| `addHosoFile(data)` / `removeHosoFile(fileId, note)` | File; log `ADD_FILE` / `REMOVE_FILE` |
| `addHosoRelation(data)` / `removeHosoRelation(relationId, note)` | Quan hệ ref-safe; log `LINK_ENTITY` / `UNLINK_ENTITY` |
| `softDeleteHoso(id)` | `IS_DELETED`; log `ARCHIVE` |
| `getHosoById` / `getHosoFiles` / `getHosoRelations` / `getHosoLogs` | Đọc |
| `getExpiringHoso(days)` / `getExpiredHoso()` | Báo hết hạn |

## Legacy

| Function | Ghi chú |
|----------|---------|
| `createHoSo` | Throw — dùng `createHoso` |
| `setHoSoStatus` | Ủy quyền `changeHosoStatus` |
| `attachHoSoFile` | Ủy quyền `addHosoFile` |

## Migration / ops

| Function | File |
|----------|------|
| `migrateHosoLegacyToPro_()` | `10_HOSO_MIGRATION.gs` |
| `runHosoFullDeployment()` | `10_HOSO_BOOTSTRAP.gs` |
