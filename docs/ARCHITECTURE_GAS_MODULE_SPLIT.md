# Kiến trúc tách module Google Apps Script (CBV / LAOCONG)

## Lý do tách module GAS

- **Một GAS project / một `scriptId`**: giảm rủi ro push nhầm, dễ phân quyền owner, dễ audit và rollback theo phạm vi.
- **Clasp rõ ràng**: mỗi thư mục module có `.clasp.json` riêng, `rootDir` trỏ `src/`, `filePushOrder` cố định thứ tự nạp file (quan trọng với GAS không có bundler).
- **Biên ranh nghiệp vụ**: Core (router, event, permission, hardening) tách khỏi Hồ sơ (HOSO), khỏi legacy TASK/FINANCE cho đến khi sẵn sàng tách runtime thật.
- **Không đổi schema Sheets**: tách repo là tổ chức mã nguồn và quy trình deploy; dữ liệu và tên bảng hiển thị giữ nguyên theo quyết định migration riêng.

## Mô hình triển khai

| Thành phần | Vai trò |
|-------------|---------|
| **MAIN_CONTROL** GAS | CBV Core V2: bootstrap, command router, command log, idempotency, event bus/worker, audit, permission, health, registry, error; Level 6 hardening; config resolver; setup bridge (`151_CBV_HOSO_V2_2_SETUP.js` nằm ở main-control theo mapping nguồn). |
| **HOSO** GAS | Handler, DB, validation, service Hồ sơ V2 (file `*_HO_SO_V2_*` đã copy). |
| **TASK** GAS (legacy / tương lai) | Tập con `20_TASK_*` và file hệ thống task đã copy — **chưa** cam kết chạy standalone đầy đủ cho đến khi bổ sung dependency và binding menu. |
| **FINANCE** GAS (legacy / tương lai) | `30_FINANCE_SERVICE.js` và debug test tài chính đã copy. |
| **CONFIG DB** | Spreadsheet cấu hình (tên hiển thị có thể gồm version, ví dụ hướng `CBV_LAOCONG_CONFIG_V2_2_DB`) — sở hữu dữ liệu theo quy ước MODULE_BOUNDARY. |
| **HOSO DB** | Spreadsheet hồ sơ (ví dụ hướng `CBV_LAOCONG_HOSO_V2_2_DB`) — module HOSO sở hữu ghi nghiệp vụ Hồ sơ. |

## Quy tắc

1. **Module nào sở hữu DB nào**: HOSO sở hữu HOSO DB; CONFIG/resolver ở main-control đọc cấu hình đã thống nhất; TASK/FINANCE legacy giữ DB/sheet theo manifest hiện tại cho đến khi có migration.
2. **Không ghi thẳng DB của module khác**: tránh sheet cross-write; đồng bộ qua command/event/API hoặc bảng liên kết được thiết kế (ví dụ hướng `CBV_ENTITY_LINK`).
3. **Giao tiếp**: command/event qua Core hoặc contract ổn định; không nhúng version vào tên command/event kỹ thuật (xem `NAMING_CONVENTION.md`).
4. **TASK/FINANCE**: legacy **không bắt buộc** tách GAS ngay; thư mục `apps-script/task` và `apps-script/finance` phục vụ chuẩn bị clasp và tài liệu, song song `05_GAS_RUNTIME` vẫn là nguồn monolith hiện tại.

## Thư mục repo

- `apps-script/main-control/src` — Core + Level6 + config resolver + setup.
- `apps-script/hoso/src` — HOSO V2 services.
- `apps-script/task/src` — tập con TASK đã copy.
- `apps-script/finance/src` — tập con FINANCE đã copy.
- `apps-script/shared/src` — dự phòng utility dùng chung (hiện trống, không copy bừa để tránh phá thứ tự runtime).

Nguồn gốc file vẫn giữ tại `05_GAS_RUNTIME/` cho đến khi freeze/archive theo `MIGRATION_PLAN_05_GAS_RUNTIME_TO_MODULES.md`.
