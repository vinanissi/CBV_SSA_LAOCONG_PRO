# DATA MODEL — FINANCE (PRO)

Bảng giao dịch **`FINANCE_TRANSACTION`**, log audit **`FINANCE_LOG`**, đính kèm **`FINANCE_ATTACHMENT`** theo **`06_DATABASE/schema_manifest.json`** (đồng bộ `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`). Nghiệp vụ chi tiết: [`BUSINESS_SPEC.md`](BUSINESS_SPEC.md), [`WORKFLOW.md`](WORKFLOW.md).

---

## FINANCE_TRANSACTION

Giao dịch thu/chi; trạng thái workflow (`NEW` → `CONFIRMED` / `CANCELLED` / …); có thể gắn đa hình tới thực thể nghiệp vụ qua **`RELATED_ENTITY_TYPE`** / **`RELATED_ENTITY_ID`**.

| Column | Type | Nullable / default | Notes |
|--------|------|-------------------|--------|
| ID | PK | required | |
| TRANS_CODE | string | optional | Mã giao dịch |
| TRANS_DATE | date/datetime | optional | |
| TRANS_TYPE | enum | required | `FINANCE_TYPE` (thu/chi — theo `ENUM_DICTIONARY` / seed) |
| STATUS | enum | required | `FINANCE_STATUS` |
| CATEGORY | enum | required | `FIN_CATEGORY`; có bản song song `MASTER_CODE` `FINANCE_CATEGORY` trong seed |
| AMOUNT | number | required | |
| DON_VI_ID | ref | optional | → `DON_VI.ID` (manifest: `DON_VI_ID`, không dùng `UNIT_ID`) |
| COUNTERPARTY | text | optional | |
| PAYMENT_METHOD | enum | optional / default khác `OTHER` theo GAS | `PAYMENT_METHOD` |
| REFERENCE_NO | text | optional | |
| RELATED_ENTITY_TYPE | enum | optional / `NONE` | `MASTER_CODE` `ENTITY_TYPE` (HO_SO, TASK, DON_VI); xem `06_DATABASE/schema_column_notes.json` |
| RELATED_ENTITY_ID | string | optional | ID bản ghi đích theo type |
| DESCRIPTION | text | optional | |
| EVIDENCE_URL | text | optional | Chứng từ |
| CONFIRMED_AT | datetime | optional | |
| CONFIRMED_BY | ref | optional | → `USER_DIRECTORY.ID` |
| CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY | audit | | |
| IS_DELETED | bool | default false | Soft delete |
| IS_STARRED | bool | default false | UX |
| IS_PINNED | bool | default false | UX |
| PENDING_ACTION | text | optional, default `''` | Hàng đợi lệnh bot/AppSheet (`CMD:…`), cùng ý tưởng `TASK_MAIN` / `HO_SO_MASTER`; GAS `createTransaction` gán mặc định rỗng |

### Quan hệ

| Bảng | Khóa ngoại | Ghi chú |
|------|------------|---------|
| FINANCE_LOG | `FIN_ID` → `FINANCE_TRANSACTION.ID` | Append-only audit (BEFORE/AFTER JSON) |
| FINANCE_ATTACHMENT | `FINANCE_ID` → `FINANCE_TRANSACTION.ID` | File đính kèm (schema dùng tên cột `FINANCE_ID`) |

### RELATED_ENTITY (đa hình)

- **`RELATED_ENTITY_TYPE`:** mã trong `MASTER_CODE` với `MASTER_GROUP = ENTITY_TYPE` (ví dụ HO_SO, TASK, DON_VI); rỗng / `NONE` nếu không link.
- **`RELATED_ENTITY_ID`:** ID bản ghi trong bảng đích tương ứng (resolve qua GAS `getRelatedEntity` / rule nghiệp vụ).
- Validation GAS: `assertValidRelatedEntityType` trên create/update draft (xem `05_GAS_RUNTIME/30_FINANCE_SERVICE.js`).

### TRANS_TYPE / CATEGORY (enum references)

| Cột | Nguồn |
|-----|--------|
| TRANS_TYPE | `ENUM_DICTIONARY` / nhóm `FINANCE_TYPE` (ví dụ INCOME, EXPENSE); đồng bộ `01_ENUM_SEED.js` |
| CATEGORY | `FIN_CATEGORY`; có giá trị trong `02_SEED/seed_master_code.tsv` (`MASTER_GROUP=FINANCE_CATEGORY`) |
| PAYMENT_METHOD | `PAYMENT_METHOD` (seed + ENUM) |
| STATUS | `FINANCE_STATUS` |

---

## FINANCE_LOG

Append-only; không `IS_DELETED` trong manifest.

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| FIN_ID | ref | → `FINANCE_TRANSACTION.ID` |
| ACTION | text | |
| BEFORE_JSON | text | |
| AFTER_JSON | text | |
| NOTE | text | |
| ACTOR_ID | ref | → `USER_DIRECTORY.ID` |
| CREATED_AT | datetime | |

---

## FINANCE_ATTACHMENT

| Column | Type | Notes |
|--------|------|--------|
| ID | PK | |
| FINANCE_ID | ref | → `FINANCE_TRANSACTION.ID` |
| ATTACHMENT_TYPE | enum | `FINANCE_ATTACHMENT_TYPE` / tương đương |
| TITLE | text | |
| FILE_NAME | text | |
| FILE_URL | text | |
| DRIVE_FILE_ID | text | |
| NOTE | text | |
| CREATED_AT, CREATED_BY | audit | Không có UPDATED_* trong manifest |

---

## Task / hồ sơ liên quan

Task và hồ sơ dùng cùng pattern `RELATED_ENTITY_*` nơi cần: xem [`../TASK/DATA_MODEL.md`](../TASK/DATA_MODEL.md), [`../HO_SO/DATA_MODEL.md`](../HO_SO/DATA_MODEL.md).
