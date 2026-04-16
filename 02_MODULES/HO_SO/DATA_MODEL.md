# DATA MODEL — HO_SO (PRO)

Canonical tables per **CBV final architecture**. Loại hồ sơ chỉ qua **`HO_SO_TYPE_ID`** → `MASTER_CODE` (`MASTER_GROUP = HO_SO_TYPE`). Không cột text `HO_SO_TYPE` trên sheet.

## HO_SO_MASTER

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| CODE | string | Legacy / mã ngắn (optional) |
| NAME | string | Legacy tên (optional) |
| HO_SO_CODE | string | Unique; generated `HS-…` |
| TITLE | string | |
| DISPLAY_NAME | string | |
| HO_SO_TYPE_ID | ref | → `MASTER_CODE.ID`, `MASTER_GROUP=HO_SO_TYPE` |
| STATUS | enum | `HO_SO_STATUS` |
| DON_VI_ID | ref | → `DON_VI.ID`, optional |
| OWNER_ID | ref | → `USER_DIRECTORY.ID` |
| HTX_ID | ref | → `HO_SO_MASTER.ID` (bản ghi HTX cha; ref phải có type HTX qua `HO_SO_TYPE_ID`). **Rule:** bắt buộc **NULL/blank** khi `HO_SO_TYPE_ID` trỏ tới `MASTER_CODE.CODE = HTX` (bản ghi gốc HTX). Bắt buộc **NOT NULL** (có giá trị) với mọi loại hồ sơ khác — không self-reference HTX. |
| MANAGER_USER_ID | ref | → `USER_DIRECTORY.ID` |
| RELATED_ENTITY_TYPE | enum | Lưu `MASTER_CODE.CODE` với `MASTER_GROUP = ENTITY_TYPE` (HO_SO, TASK, DON_VI); xem `06_DATABASE/schema_column_notes.json` / `_COLUMN_NOTES` trong `schema_manifest.json`. |
| RELATED_ENTITY_ID | string | Logical id of related entity |
| FULL_NAME, PHONE, EMAIL, ID_TYPE, ID_NO, DOB, ADDRESS | | |
| START_DATE, END_DATE | date | |
| PRIORITY, SOURCE_CHANNEL | enum | |
| SUMMARY, NOTE, TAGS_TEXT | string | |
| IS_STARRED | bool | UX; default false |
| IS_PINNED | bool | UX; default false |
| PENDING_ACTION | text | Bot/AppSheet `CMD:…`; feedback ⏳/✅/❌ |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | |
| IS_DELETED | bool | Soft delete |

## HO_SO_DETAIL_PHUONG_TIEN

Chi tiết phương tiện (1–1 hoặc mở rộng theo `HO_SO_ID` trên `HO_SO_MASTER` loại xe).

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| HO_SO_ID | ref | → `HO_SO_MASTER.ID` (hồ sơ phương tiện) |
| HTX_ID | ref | → `HO_SO_MASTER.ID` (bản ghi HTX); phạm vi unique biển số |
| PLATE_NO | string | **PLATE_NO: unique per HTX_ID, enforced tại GAS layer.** So khớp chuẩn hoá (bỏ khoảng trắng, không phân biệt hoa thường) trong `validatePhuongTien`. |
| VEHICLE_TYPE_ID | ref | → `MASTER_CODE` (optional) |
| VIN | string | |
| CAPACITY_TON | number | |
| NOTE | text | |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | |
| IS_DELETED | bool | Soft delete |

## HO_SO_FILE

Immutable file row (chỉ `CREATED_AT` / `CREATED_BY`, không có cột audit UPDATE).

### 3.1 Bảng trường (field)

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| HO_SO_ID | ref | → `HO_SO_MASTER.ID` |
| LINKED_RELATION_ID | text (ref), optional | Optional. Gắn file với một kỳ phân công cụ thể. Dùng khi file chỉ có giá trị trong một DRIVES/OWNS_VEHICLE period. → `HO_SO_RELATION.ID`. Mặc định để trống / NULL. |
| FILE_GROUP | enum | Nhóm tài liệu (`FILE_GROUP`) |
| FILE_NAME, FILE_URL, DRIVE_FILE_ID | text | |
| STATUS | enum | `ACTIVE` / `ARCHIVED` (archived = gỡ/ẩn) |
| NOTE | text | |
| DOC_TYPE, DOC_NO, ISSUED_DATE, EXPIRY_DATE | | Chi tiết chứng tờ |
| CREATED_AT, CREATED_BY | audit | |

## HO_SO_RELATION

Quan hệ **FROM_HO_SO_ID → TO_HO_SO_ID** (hai hồ sơ) + optional polymorphic `RELATED_TABLE` / `RELATED_RECORD_ID`; audit đầy đủ.

| Column | Notes |
|--------|--------|
| ID | PK |
| FROM_HO_SO_ID | → HO_SO_MASTER |
| TO_HO_SO_ID | → HO_SO_MASTER |
| RELATION_TYPE | `HO_SO_RELATION_TYPE` |
| STATUS | `HO_SO_STATUS` |
| RELATED_TABLE, RELATED_RECORD_ID | Link ngoài (optional) |
| NOTE | |
| START_DATE, END_DATE | |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | |
| IS_DELETED | Soft delete |

`RELATED_TABLE` whitelist (polymorphic): `TASK`, `DON_VI`, `FINANCE_TRANSACTION`, `USER_DIRECTORY`, `HO_SO` (→ `HO_SO_MASTER`).

## 5. Enum cần chuẩn hóa (MASTER_CODE)

Các giá trị nghiệp vụ dùng chung qua **`MASTER_CODE`** (cột `MASTER_GROUP` + `CODE` + nhãn hiển thị). Ví dụ nhóm **`ENTITY_TYPE`** — dùng cho cột **`RELATED_ENTITY_TYPE`** (đa hình kèm `RELATED_ENTITY_ID`):

| MASTER_GROUP | Ví dụ CODE | Ghi chú |
|--------------|------------|---------|
| ENTITY_TYPE | **HO_SO** — Hồ sơ; **TASK** — Công việc; **DON_VI** — Đơn vị | Chuẩn trong seed `02_SEED/seed_master_code.tsv`; GAS: `assertValidRelatedEntityType` / `getRelatedEntity`. |

## HO_SO_UPDATE_LOG

ID, HO_SO_ID, ACTION_TYPE (`HO_SO_ACTION_TYPE`), OLD_STATUS, NEW_STATUS, FIELD_CHANGED, OLD_VALUE, NEW_VALUE, NOTE, ACTOR_ID (optional), audit fields, IS_DELETED.

---

## Liên kết module TASK / FINANCE

- **TASK (field catalog PRO, manifest-aligned):** [`../TASK/DATA_MODEL.md`](../TASK/DATA_MODEL.md) — workflow / API sâu: [`../TASK_CENTER/TASK_SYSTEM_REFERENCE.md`](../TASK_CENTER/TASK_SYSTEM_REFERENCE.md).
- **FINANCE:** [`../FINANCE/DATA_MODEL.md`](../FINANCE/DATA_MODEL.md).
