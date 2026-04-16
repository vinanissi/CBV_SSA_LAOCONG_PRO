# SERVICE MAP — HO_SO (PRO)

Implementation: `05_GAS_RUNTIME/10_HOSO_SERVICE.js` (+ repository / validation / migration).

## Public API

| Function | Mô tả |
|----------|--------|
| `createHoSo(data)` / `createHoso(data)` | Tạo master; sinh `ID`, `HO_SO_CODE`; bắt buộc `HO_SO_TYPE_ID`; `TAGS_TEXT`; `IS_STARRED`/`IS_PINNED`/`PENDING_ACTION` mặc định; log `CREATE` |
| `updateHoso(id, patch)` | Patch (không `STATUS`, không `HO_SO_CODE`); log `UPDATE_INFO` |
| `changeHosoStatus(id, newStatus, note)` | Đổi trạng thái; log `CHANGE_STATUS` |
| `closeHoso(id, note)` | `STATUS=CLOSED`; log `CLOSE` |
| `addHosoFile(data)` / `removeHosoFile(fileId, note)` | File; log `ADD_FILE` / `REMOVE_FILE` |
| `addHosoRelation(data)` / `removeHosoRelation(relationId, note)` | Quan hệ: bắt buộc `FROM_HO_SO_ID` + polymorphic (`RELATED_TABLE` / `RELATED_RECORD_ID`); không cột `HO_SO_ID` trên sheet; log `LINK_ENTITY` / `UNLINK_ENTITY` |
| `createHoSoRelation(data)` | Tạo quan hệ 2 hồ sơ (FROM→TO) + optional polymorphic; log `RELATION_ADDED` / `LINK_ENTITY` |
| `softDeleteHoso(id)` | `IS_DELETED`; log `ARCHIVE` |
| `getHosoById` / `getHosoFiles` / `getHosoRelations` / `getHosoLogs` | Đọc |
| `getExpiringHoso(days)` / `getExpiredHoso()` | Báo hết hạn |

## Legacy / alias

| Function | Ghi chú |
|----------|---------|
| `createHoso` | Alias → `createHoSo` |
| `setHoSoStatus` | Ủy quyền `changeHosoStatus` |
| `attachHoSoFile` | Đính kèm theo schema `DOC_TYPE` / `FILE_GROUP` (immutable file row) |

## Migration / ops

| Function | File |
|----------|------|
| `migrateHosoLegacyToPro_()` | `10_HOSO_MIGRATION.js` |
| `runHosoFullDeployment()` | `10_HOSO_BOOTSTRAP.js` |
