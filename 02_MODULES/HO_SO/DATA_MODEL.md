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
| HTX_ID | ref | → `HO_SO_MASTER.ID` (bản ghi HTX cha; ref phải có type HTX qua `HO_SO_TYPE_ID`) |
| MANAGER_USER_ID | ref | → `USER_DIRECTORY.ID` |
| RELATED_ENTITY_TYPE | enum | |
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

## HO_SO_FILE

Immutable file row (chỉ `CREATED_AT` / `CREATED_BY`, không có cột audit UPDATE).

| Column | Notes |
|--------|--------|
| ID | PK |
| HO_SO_ID | → HO_SO_MASTER |
| FILE_GROUP | Nhóm tài liệu (`FILE_GROUP` enum) |
| FILE_NAME, FILE_URL, DRIVE_FILE_ID | |
| STATUS | `ACTIVE` / `ARCHIVED` (archived = gỡ/ẩn) |
| NOTE | |
| DOC_TYPE, DOC_NO, ISSUED_DATE, EXPIRY_DATE | Chi tiết chứng tờ (sau NOTE, trước CREATED) |
| CREATED_AT, CREATED_BY | |

## HO_SO_RELATION

Quan hệ **FROM_HO_SO_ID → TO_HO_SO_ID** (hai hồ sơ) + optional polymorphic `RELATED_TABLE` / `RELATED_RECORD_ID`; audit đầy đủ.

| Column | Notes |
|--------|--------|
| ID | PK |
| FROM_HO_SO_ID | → HO_SO_MASTER |
| TO_HO_SO_ID | → HO_SO_MASTER |
| RELATION_TYPE | `HO_SO_RELATION_TYPE` |
| STATUS | `HO_SO_STATUS` |
| HO_SO_ID | Context nhanh (thường = FROM) |
| RELATED_TABLE, RELATED_RECORD_ID | Link ngoài (optional) |
| NOTE | |
| START_DATE, END_DATE | |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | |
| IS_DELETED | Soft delete |

`RELATED_TABLE` whitelist (polymorphic): `TASK`, `DON_VI`, `FINANCE_TRANSACTION`, `USER_DIRECTORY`, `HO_SO` (→ `HO_SO_MASTER`).

## HO_SO_UPDATE_LOG

ID, HO_SO_ID, ACTION_TYPE (`HO_SO_ACTION_TYPE`), OLD_STATUS, NEW_STATUS, FIELD_CHANGED, OLD_VALUE, NEW_VALUE, NOTE, ACTOR_ID (optional), audit fields, IS_DELETED.
