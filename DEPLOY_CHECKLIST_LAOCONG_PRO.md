# DEPLOY CHECKLIST - LAOCONG PRO

See **CBV_LAOCONG_PRO_REFERENCE.md** for consolidated structure and run order. See **RUNBOOK_LAOCONG_PRO.md** for troubleshooting.

## A. Chuẩn bị
- [ ] Đã đọc toàn bộ `00_META`
- [ ] Đã chọn 1 Google Sheets file làm DB chính
- [ ] Đã tạo Apps Script bound với DB
- [ ] Đã quyết định vai trò người dùng: ADMIN / OPERATOR / ACCOUNTANT / VIEWER

## B. Database
- [ ] Đã import đầy đủ CSV từ `06_DATABASE/_generated_schema`
- [ ] Tên sheet khớp 100%
- [ ] Header khớp 100%
- [ ] Không tự thêm cột ngoài đặc tả
- [ ] ENUM_DICTIONARY, MASTER_CODE created by initAll (không cần import CSV)

## C. GAS
- [ ] Đã copy đủ file từ `05_GAS_RUNTIME` (hoặc clasp push)
- [ ] Đã sửa `00_CORE_CONFIG.gs` — thêm ADMIN_EMAILS nếu dùng admin panel
- [ ] Đã chạy `initAll()` — tạo sheets, seed enum, fill display
- [ ] Nếu selfAuditBootstrap báo thiếu cột hoặc blank enum: chạy `repairSchemaAndData()` (menu: Run Schema & Data Repair)
- [ ] Đã chạy `protectSensitiveSheets()` — bảo vệ TASK_CHECKLIST, TASK_UPDATE_LOG, ENUM_DICTIONARY, MASTER_CODE
- [ ] Đã chạy `installTriggers()` nếu dùng
- [ ] Đã kiểm tra menu hệ thống xuất hiện
- [ ] Đã chạy `auditEnumConsistency()`
- [ ] Đã chạy `verifyAppSheetReadiness()`
- [ ] Đã test tạo task thử
- [ ] Đã test tạo transaction thử
- [ ] Đã test tạo hồ sơ thử

## D. AppSheet
- [ ] Đã add đủ table (bao gồm ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG nếu dùng admin panel)
- [ ] Key column đúng
- [ ] Label column đúng
- [ ] Enum columns bind theo 04_APPSHEET/APPSHEET_ENUM_BINDING.md
- [ ] Display mapping theo 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md
- [ ] Slice đúng role
- [ ] Actions không bypass service rule
- [ ] Security filters đúng
- [ ] **TASK workflow lock:** STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, DONE_AT, DONE_BY, TASK_UPDATE_LOG = Editable OFF (xem 04_APPSHEET/APPSHEET_TASK_FIELD_POLICY.md, 02_MODULES/TASK_CENTER/TASK_SYSTEM_REFERENCE.md)

## E. Audit
- [ ] Đã chạy `auditSystem()`
- [ ] Không còn sheet thiếu
- [ ] Không còn header sai
- [ ] Enum không lệch
- [ ] Workflow không có trạng thái tự do

## F. Admin Panel (nếu dùng)
- [ ] ADMIN_EMAILS đã cấu hình
- [ ] App Admin Panel tách riêng, share chỉ cho admin
- [ ] Xem 04_APPSHEET/ADMIN_OPERATING_CHECKLIST.md

## G. Chốt vận hành
- [ ] Có người chịu trách nhiệm master data
- [ ] Có người chịu trách nhiệm task
- [ ] Có người chịu trách nhiệm finance
- [ ] Có quy tắc backup
- [ ] Có quy tắc đặt tên file
