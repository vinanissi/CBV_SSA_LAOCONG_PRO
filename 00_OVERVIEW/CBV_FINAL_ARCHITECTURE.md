# CBV Lao Cộng PRO — Final Architecture

**Status:** Authoritative. No hybrid/legacy design.

---

## 1. Design Principles

| Principle | Rule |
|-----------|------|
| **User table** | USER_DIRECTORY is the sole canonical user table. Users are global. Users do NOT depend on HTX. |
| **Organization table** | DON_VI is the sole organization/unit table. No separate HTX table. DON_VI includes CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM. |
| **Master data** | MASTER_CODE stores only static/semi-static business master data. MASTER_CODE does NOT store DON_VI or USER. |
| **Enum layer** | ENUM_DICTIONARY stores workflow enums only. |

---

## 2. Core Tables

### USER_DIRECTORY

Canonical user table. Independent of DON_VI/HTX.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| USER_CODE | Text | Yes | Machine-safe |
| FULL_NAME | Text | Yes | Canonical name |
| DISPLAY_NAME | Text | No | UI override |
| EMAIL | Text | No | Contact |
| PHONE | Text | No | Contact |
| ROLE | Text | Yes | ADMIN \| OPERATOR \| VIEWER |
| POSITION | Text | No | Job title |
| STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| IS_SYSTEM | Yes/No | No | System-seeded |
| ALLOW_LOGIN | Yes/No | No | Can sign in |
| NOTE | Text | No | Admin note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

### DON_VI

Sole organization table. Covers CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM. NOT in MASTER_CODE.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| DON_VI_TYPE | Text | Yes | CONG_TY \| HTX \| DOI_KINH_DOANH \| BO_PHAN \| NHOM |
| CODE | Text | Yes | Machine-safe |
| NAME | Text | Yes | Full name |
| DISPLAY_TEXT | Text | No | UI override |
| SHORT_NAME | Text | No | Abbreviated |
| PARENT_ID | Text | No | Ref DON_VI (self) |
| STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| SORT_ORDER | Number | No | Display order |
| MANAGER_USER_ID | Text | No | Ref USER_DIRECTORY |
| EMAIL | Text | No | Unit contact |
| PHONE | Text | No | Unit contact |
| ADDRESS | Text | No | Physical address |
| NOTE | Text | No | Admin note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

### MASTER_CODE

Static/semi-static business master data only. Does NOT store DON_VI or USER.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| MASTER_GROUP | Text | Yes | Family: TASK_TYPE, PROVINCE, etc. |
| CODE | Text | Yes | Unique per group |
| NAME | Text | No | Full name |
| DISPLAY_TEXT | Text | No | UI override |
| STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| SORT_ORDER | Number | No | Display order |
| IS_SYSTEM | Yes/No | No | System-seeded |
| ALLOW_EDIT | Yes/No | No | Admin editable |
| NOTE | Text | No | Admin note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

### ENUM_DICTIONARY

Enum dictionary only.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| ENUM_GROUP | Text | Yes | Family |
| ENUM_VALUE | Text | Yes | Machine value |
| DISPLAY_TEXT | Text | No | UI label |
| SORT_ORDER | Number | No | Display order |
| IS_ACTIVE | Yes/No | No | Controls usability |
| NOTE | Text | No | Admin note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |

---

## 3. Task Module

### TASK_MAIN

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| TASK_CODE | Text | No | Display code |
| TITLE | Text | Yes | Task name |
| DESCRIPTION | Text | No | Details |
| TASK_TYPE_ID | Text | Yes | Ref MASTER_CODE (MASTER_GROUP=TASK_TYPE) |
| STATUS | Text | Yes | NEW \| IN_PROGRESS \| DONE \| CANCELLED |
| PRIORITY | Text | Yes | CAO \| TRUNG_BINH \| THAP |
| OWNER_ID | Text | Yes | Ref USER_DIRECTORY |
| REPORTER_ID | Text | No | Ref USER_DIRECTORY |
| DON_VI_ID | Text | No | Ref DON_VI |
| RELATED_ENTITY_TYPE | Text | No | Polymorphic type |
| RELATED_ENTITY_ID | Text | No | Polymorphic ref |
| START_DATE | Date | No | |
| DUE_DATE | Date | No | |
| DONE_AT | Datetime | No | When completed |
| RESULT_SUMMARY | Text | No | Completion summary |
| PROGRESS_PERCENT | Number | No | Checklist-derived |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

**Removed:** TASK_TYPE, HTX_ID, RESULT_NOTE.

---

### TASK_CHECKLIST

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| TASK_ID | Text | Yes | Ref TASK_MAIN |
| ITEM_NO | Number | No | Order |
| TITLE | Text | Yes | Checklist item |
| IS_REQUIRED | Yes/No | No | Required for completion |
| IS_DONE | Yes/No | No | Completion status |
| DONE_AT | Datetime | No | When done |
| DONE_BY | Text | No | Ref USER_DIRECTORY |
| NOTE | Text | No | |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

**Removed:** DESCRIPTION.

---

### TASK_UPDATE_LOG

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| TASK_ID | Text | Yes | Ref TASK_MAIN |
| UPDATE_TYPE | Text | Yes | Type of update |
| ACTION | Text | Yes | Action code |
| OLD_STATUS | Text | No | Previous STATUS |
| NEW_STATUS | Text | No | New STATUS |
| NOTE | Text | No | Log note |
| ACTOR_ID | Text | Yes | Ref USER_DIRECTORY |
| CREATED_AT | Datetime | Yes | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

**Removed:** CONTENT.

---

### TASK_ATTACHMENT

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| TASK_ID | Text | Yes | Ref TASK_MAIN |
| FILE_NAME | Text | No | Original filename |
| FILE_URL | Text | No | URL |
| DRIVE_FILE_ID | Text | No | Drive ID |
| ATTACHMENT_TYPE | Text | No | Enum |
| TITLE | Text | No | Display label |
| NOTE | Text | No | |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

## 4. Finance Module

### FINANCE_TRANSACTION

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique key |
| TRANS_CODE | Text | No | Display code |
| TRANS_DATE | Date | Yes | |
| TRANS_TYPE | Text | Yes | Enum |
| STATUS | Text | Yes | Enum |
| CATEGORY | Text | No | Enum |
| AMOUNT | Number | Yes | |
| DON_VI_ID | Text | No | Ref DON_VI (unit attribution) |
| COUNTERPARTY | Text | No | |
| PAYMENT_METHOD | Text | No | Enum |
| REFERENCE_NO | Text | No | |
| RELATED_ENTITY_TYPE | Text | No | Polymorphic |
| RELATED_ENTITY_ID | Text | No | Polymorphic |
| DESCRIPTION | Text | No | |
| EVIDENCE_URL | Text | No | |
| CONFIRMED_AT | Datetime | No | |
| CONFIRMED_BY | Text | No | Ref USER_DIRECTORY |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

## 5. Reference Summary

| Child | Ref Column | Parent |
|-------|------------|--------|
| DON_VI | PARENT_ID | DON_VI |
| DON_VI | MANAGER_USER_ID | USER_DIRECTORY |
| TASK_MAIN | DON_VI_ID | DON_VI |
| TASK_MAIN | TASK_TYPE_ID | MASTER_CODE |
| TASK_MAIN | OWNER_ID | USER_DIRECTORY |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN |
| FINANCE_TRANSACTION | DON_VI_ID | DON_VI |
| FINANCE_TRANSACTION | CONFIRMED_BY | USER_DIRECTORY |

---

## 6. Luồng vận hành (HO_SO / HTX)

- **Tạo HTX:** `HO_SO_TYPE_ID` trỏ tới `MASTER_CODE` với `CODE = HTX`. **`HTX_ID` để NULL/blank** (không self-ref tới chính bản ghi; bản ghi này là root hợp tác xã).
- **Tạo hồ sơ con** (xe, xã viên, hợp đồng, …): `HO_SO_TYPE_ID` khác HTX; **`HTX_ID` bắt buộc** trỏ tới một `HO_SO_MASTER` đã tồn tại có loại HTX.

Chi tiết cột và validation: `02_MODULES/HO_SO/DATA_MODEL.md`, `05_GAS_RUNTIME/10_HOSO_VALIDATION.js` (`hosoValidateHtxIdForHoSoType`).

---

## 7. Deprecated / Removed (Do Not Reintroduce)

See **09_AUDIT/DEPRECATED_OLD_DESIGN_ITEMS.md** for full list. Key removals:

- TASK_TYPE (use TASK_TYPE_ID)
- HTX_ID in TASK_MAIN
- DON_VI in MASTER_CODE
- USER in MASTER_CODE
- Separate HTX table
- USER_DIRECTORY dependency on HTX
