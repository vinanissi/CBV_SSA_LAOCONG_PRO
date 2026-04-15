# CHANGELOG

## [PATCH] HO_SO_LOG — Deprecated, removed from DB

**Date:** 2026-04-15

**Files affected:**
- `06_DATABASE/schema_manifest.json` — đã không có `HO_SO_LOG`
- `06_DATABASE/SCHEMA_SHEETS_LAOCONG_PRO.md` — đã không liệt kê
- `05_GAS_RUNTIME/BOOTSTRAP_DEPLOY.md` — Mandatory Sheets không có `HO_SO_LOG`

**Reason:** `HO_SO_LOG` trùng chức năng với `HO_SO_UPDATE_LOG`. Mọi log hành động
hồ sơ (CREATE, UPDATE_INFO, CHANGE_STATUS, ADD_FILE, REMOVE_FILE, LINK_ENTITY,
ARCHIVE…) đều được ghi vào `HO_SO_UPDATE_LOG`. `HO_SO_LOG` chưa bao giờ được
write trong PRO build.

**Action:** Xóa khỏi schema_manifest, SCHEMA_SHEETS, bootstrap manifest.
Không cần migration — sheet chưa được tạo trong bất kỳ môi trường PRO nào.

**Impact:** None. Service layer không bị ảnh hưởng.

## [PATCH] FINANCE_TRANSACTION — Thêm cột PENDING_ACTION

**Date:** 2026-04-14

**Files:** `01_SCHEMA/FINANCE_TRANSACTION_SCHEMA.md`, `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md`, `02_MODULES/FINANCE/DATA_MODEL.md`, `06_DATABASE/schema_manifest.json`, `06_DATABASE/_generated_schema/FINANCE_TRANSACTION.csv`, `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.gs`, `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.gs`, `05_GAS_RUNTIME/30_FINANCE_SERVICE.gs`, `05_GAS_RUNTIME/03_SHARED_ROW_READER.gs` (+ mirrors `.js` nơi có)

**Reason:** ACTION_MAP_MASTER đã dùng CMD:finConfirm / finCancel / finArchive nhưng cột PENDING_ACTION chưa có trong schema DB. Gap được phát hiện qua audit.

**Position:** Sau IS_PINNED, trước CONFIRMED_AT

**Type:** Text | No | GAS set; AppSheet readonly

## finance-module-1.0.0

### GAS
- `30_FINANCE_SERVICE.gs`: viết mới 7 hàm public + helper `_financeAppendLog`
- Enum validation dùng group `FINANCE_TYPE` (không phải `TRANS_TYPE`)
- Xóa `setFinanceStatus`, `createFinanceAttachment` — thay bằng
  `confirmTransaction`, `cancelTransaction`, `archiveTransaction`, `attachEvidence`

### Schema
- `FINANCE_TRANSACTION.csv`: 24 cột, `DON_VI_ID` thay `UNIT_ID`,
  thêm `IS_STARRED`, `IS_PINNED`
- `90_BOOTSTRAP_SCHEMA.gs`: đồng bộ 24 cột

### Tài liệu
- `DATA_MODEL.md`: cập nhật `DON_VI_ID`, `IS_STARRED`, `IS_PINNED`
- `SHEET_DICTIONARY.md`: ghi rõ enum group thực tế (`FINANCE_TYPE`)
- `SERVICE_CONTRACT.md`: ghi chú enum group
- `APPSHEET_ACTION_MAP_MASTER.md`: bổ sung CMD routing cho 3 Finance actions
- `USER_ROLE_PERMISSION_SPEC.md`: thay `setFinanceStatus` → `confirmTransaction`
- `APPSHEET_BUILD_SPEC_LAOCONG_PRO.md`: thêm `FINANCE_ATTACHMENT`

### Tests
- `99_DEBUG_TEST_FINANCE.gs`: 8 test cases, tất cả PASS

## laocong-pro-1.0.0
- Khóa lại full tài liệu meta
- Bổ sung business spec sâu cho HO_SO / TASK_CENTER / FINANCE
- Bổ sung AppSheet build mapping master
- Bổ sung GAS runtime chuẩn service/repository/log/validation
- Bổ sung schema CSV và sample data generator
- Bổ sung audit checklist và manifest builder
