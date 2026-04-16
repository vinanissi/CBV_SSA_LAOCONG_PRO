# HO_SO Module — PRO (CBV Small-Scale)

## Mục tiêu

Quản lý hồ sơ tập trung: master, file đính kèm, quan hệ nghiệp vụ, nhật ký thay đổi — **chỉ `HO_SO_TYPE_ID`** → `MASTER_CODE` (group `HO_SO_TYPE`). Không cột `HO_SO_TYPE` text trên sheet; slice ACTIVE_HTX dùng `[HO_SO_TYPE_ID].[CODE]="HTX"`.

## Schema (final)

| Bảng | Mô tả |
|------|--------|
| `HO_SO_MASTER` | Bản ghi hồ sơ; `HO_SO_TYPE_ID` → `MASTER_CODE` (group `HO_SO_TYPE`); `DON_VI_ID` → `DON_VI`; user refs → `USER_DIRECTORY`. |
| `HO_SO_FILE` | File/đính kèm; `HO_SO_ID` → master. |
| `HO_SO_RELATION` | Liên kết tới entity (`RELATED_TABLE` + `RELATED_RECORD_ID` đã validate ref). |
| `HO_SO_UPDATE_LOG` | Log hành động; `ACTOR_ID` optional (khi user chưa map `USER_DIRECTORY`). |

Chi tiết cột: `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` và `06_DATABASE/schema_manifest.json`.

## HO_SO_CODE

- Định dạng: `HS-{TYPE_SLUG}-{6 số}`; `TYPE_SLUG` suy ra từ `MASTER_CODE.CODE` (slug trong `10_HOSO_UTILS.js`).
- Sinh mã: `hosoRepoAllocateHoSoCode` trong `10_HOSO_REPOSITORY.js` (đọc sheet chỉ qua repository).

## API GAS chính

| Hàm | Layer |
|-----|--------|
| `createHoso` / `updateHoso` / `changeHosoStatus` / `closeHoso` | Service |
| `addHosoFile` / `removeHosoFile` / `addHosoRelation` / `removeHosoRelation` | Service |
| `softDeleteHoso` | Service |
| `migrateHosoLegacyToPro_` | Migration (legacy → PRO, idempotent) |
| `ensureHosoSheets_` / `runHosoFullDeployment` | Bootstrap |

## Migration

Chạy `migrateHosoLegacyToPro_()` trước khi gỡ cột legacy (nếu từng có `HO_SO_TYPE` text). Sau khi AppSheet/GAS không còn phụ thuộc cột đó, có thể **xóa cột** `HO_SO_TYPE` khỏi Google Sheet và chạy `ensureSchemas` theo `90_BOOTSTRAP_SCHEMA.js`.

## Tài liệu liên quan

- `DATA_MODEL.md` — cột chi tiết.
- `../../04_APPSHEET/APPSHEET_HO_SO_PRO_SPEC.md` — AppSheet.
- Code: `05_GAS_RUNTIME/10_HOSO_*.js`.
