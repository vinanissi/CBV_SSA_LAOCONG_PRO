# DATA MODEL — TASK (PRO)

Bảng chính **`TASK_MAIN`** và các bảng con/task log theo **`06_DATABASE/schema_manifest.json`** (đồng bộ `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`). Workflow chi tiết, slice AppSheet, API GAS: xem [`../TASK_CENTER/TASK_SYSTEM_REFERENCE.md`](../TASK_CENTER/TASK_SYSTEM_REFERENCE.md), [`../TASK_CENTER/DATA_MODEL.md`](../TASK_CENTER/DATA_MODEL.md) (bản mở rộng lịch sử).

---

## TASK_MAIN

Công việc gắn **`DON_VI_ID`** (đơn vị), **`OWNER_ID`** / **`REPORTER_ID`**, workflow **`STATUS`**, checklist-driven **`PROGRESS_PERCENT`**. Cột **TASK PRO** (visibility): **`SHARED_WITH`**, **`IS_PRIVATE`**, **`PENDING_ACTION`**.

| Column | Type | Nullable / default | Notes |
|--------|------|-------------------|--------|
| ID | PK | required | |
| TASK_CODE | string | optional generated | Mã hiển thị; GAS có thể sinh |
| TITLE | string | required | |
| DESCRIPTION | text | optional | |
| TASK_TYPE_ID | ref | optional | → `MASTER_CODE.ID`, `MASTER_GROUP=TASK_TYPE` |
| STATUS | enum | required (create: `NEW`) | `TASK_STATUS`; đổi qua GAS / action (`setTaskStatus`, …) |
| PRIORITY | enum | required | `TASK_PRIORITY` |
| DON_VI_ID | ref | required | → `DON_VI.ID` |
| OWNER_ID | ref | required | → `USER_DIRECTORY.ID` |
| REPORTER_ID | ref | optional | → `USER_DIRECTORY.ID`; mặc định map user hiện tại nếu có |
| SHARED_WITH | text (list) | optional, default `''` | Danh sách ID user được share (comma-separated); rỗng = không share thêm |
| IS_PRIVATE | bool | optional, default `false` | `true` = chỉ owner/reporter/shared + admin (theo rule AppSheet/GAS) |
| START_DATE | date | optional | |
| DUE_DATE | date | optional | |
| DONE_AT | datetime | optional | Set khi DONE |
| PROGRESS_PERCENT | number | default `0` | Derive từ `TASK_CHECKLIST` |
| RESULT_SUMMARY | text | optional | Kết luận khi hoàn thành |
| RELATED_ENTITY_TYPE | enum | optional / `NONE` | `MASTER_CODE` `MASTER_GROUP=ENTITY_TYPE` (HO_SO, TASK, DON_VI); xem `06_DATABASE/schema_column_notes.json` |
| RELATED_ENTITY_ID | string | optional | ID bản ghi đích theo type |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | | |
| IS_STARRED | bool | default false | UX |
| IS_PINNED | bool | default false | UX |
| IS_DELETED | bool | default false | Soft delete |
| PENDING_ACTION | text | optional, default `''` | Bot/AppSheet `CMD:…`; tương tự pattern `HO_SO_MASTER` |

### Quan hệ

| Bảng | Khóa ngoại | Ghi chú |
|------|------------|---------|
| TASK_CHECKLIST | `TASK_ID` → `TASK_MAIN.ID` | Checklist là nguồn truth cho tiến độ |
| TASK_UPDATE_LOG | `TASK_ID` → `TASK_MAIN.ID` | Lịch sử cập nhật / đổi trạng thái |
| TASK_ATTACHMENT | `TASK_ID` → `TASK_MAIN.ID` | File/đính kèm |

### Enum / MASTER_CODE / ENUM_DICTIONARY

| Cột | Nguồn giá trị |
|-----|----------------|
| TASK_TYPE_ID | `MASTER_CODE` (`TASK_TYPE`) |
| STATUS | `ENUM_DICTIONARY` / `TASK_STATUS` |
| PRIORITY | `TASK_PRIORITY` |
| RELATED_ENTITY_TYPE | `MASTER_CODE` `ENTITY_TYPE` (HO_SO, TASK, DON_VI); GAS: `assertValidRelatedEntityType` |
| RELATED_ENTITY_ID | Polymorphic — cặp với type |

### Business rules (tóm tắt)

- **`PENDING_ACTION`:** hàng đợi lệnh tự động / phản hồi UI; để trống nếu không dùng.
- **`SHARED_WITH`:** chuỗi ID (comma); để trống nếu không chia sẻ ngoài owner/reporter; logic visibility đầy đủ trên AppSheet security + GAS `45_SHARED_WITH_SERVICE.js` khi áp dụng.
- **`IS_PRIVATE`:** khi `true`, giới hạn xem theo chính sách TASK PRO (không thay thế security filter AppSheet).

---

## TASK_CHECKLIST

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| TASK_ID | ref | → `TASK_MAIN.ID` |
| ITEM_NO | number | |
| TITLE | text | |
| IS_REQUIRED | bool | |
| IS_DONE | bool | |
| DONE_AT | datetime | |
| DONE_BY | ref | → `USER_DIRECTORY.ID` |
| NOTE | text | |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | |
| IS_DELETED | bool | |

---

## TASK_UPDATE_LOG

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| TASK_ID | ref | → `TASK_MAIN.ID` |
| UPDATE_TYPE | enum | `UPDATE_TYPE` |
| ACTION | text | Mô tả / nội dung log |
| ACTOR_ID | ref | → `USER_DIRECTORY.ID` |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | |
| IS_DELETED | bool | |

---

## TASK_ATTACHMENT

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| TASK_ID | ref | → `TASK_MAIN.ID` |
| SOURCE_MODE | text | Theo bootstrap schema |
| ATTACHMENT_TYPE | enum | `TASK_ATTACHMENT_TYPE` / tương đương |
| TITLE | text | |
| FILE_NAME | text | |
| UPLOAD_FILE | text/file | Theo cấu hình AppSheet |
| FILE_URL | text | |
| DRIVE_FILE_ID | text | |
| FILE_EXT | text | |
| LINK_DOMAIN | text | |
| SORT_ORDER | number | |
| STATUS | text/enum | |
| NOTE | text | |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | |
| IS_DELETED | bool | |

---

## Tài chính liên quan task

Giao dịch tài chính và đa hình `RELATED_ENTITY`: xem [`../FINANCE/DATA_MODEL.md`](../FINANCE/DATA_MODEL.md).
