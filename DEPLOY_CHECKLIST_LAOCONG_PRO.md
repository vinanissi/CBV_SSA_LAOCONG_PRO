# DEPLOY CHECKLIST - LAOCONG PRO

See **CBV_LAOCONG_PRO_REFERENCE.md** for consolidated structure and run order.

## A. Chuẩn bị
- [ ] Đã đọc toàn bộ `00_META`
- [ ] Đã chọn 1 Google Sheets file làm DB chính
- [ ] Đã tạo Apps Script bound với DB
- [ ] Đã quyết định vai trò người dùng: ADMIN / OPERATOR / VIEWER

## B. Database
- [ ] Đã import đầy đủ CSV từ `06_DATABASE/_generated_schema`
- [ ] Tên sheet khớp 100%
- [ ] Header khớp 100%
- [ ] Không tự thêm cột ngoài đặc tả
- [ ] ENUM_DICTIONARY, MASTER_CODE created by initAll (không cần import CSV)

## C. GAS
- [ ] Đã copy đủ file từ `05_GAS_RUNTIME` (hoặc clasp push)
- [ ] Đã sửa `config.gs` nếu cần
- [ ] Đã chạy `initAll()` — tạo sheets, seed enum, fill display
- [ ] Đã chạy `installTriggers()` nếu dùng
- [ ] Đã kiểm tra menu hệ thống xuất hiện
- [ ] Đã chạy `auditEnumConsistency()`
- [ ] Đã chạy `verifyAppSheetReadiness()`
- [ ] Đã test tạo task thử
- [ ] Đã test tạo transaction thử
- [ ] Đã test tạo hồ sơ thử

## D. AppSheet
- [ ] Đã add đủ table (bao gồm ENUM_DICTIONARY, MASTER_CODE)
- [ ] Key column đúng
- [ ] Label column đúng
- [ ] Enum columns bind theo 04_APPSHEET/APPSHEET_ENUM_BINDING.md
- [ ] Display mapping theo 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md
- [ ] Slice đúng role
- [ ] Actions không bypass service rule
- [ ] Security filters đúng

## E. Audit
- [ ] Đã chạy `auditSystem()`
- [ ] Không còn sheet thiếu
- [ ] Không còn header sai
- [ ] Enum không lệch
- [ ] Workflow không có trạng thái tự do

## F. Chốt vận hành
- [ ] Có người chịu trách nhiệm master data
- [ ] Có người chịu trách nhiệm task
- [ ] Có người chịu trách nhiệm finance
- [ ] Có quy tắc backup
- [ ] Có quy tắc đặt tên file
