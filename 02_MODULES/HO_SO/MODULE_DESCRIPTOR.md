# MODULE DESCRIPTOR — HO_SO (PRO)

## Mục tiêu

Quản lý **hồ sơ** (hợp đồng, giấy tờ, biên bản, …) theo loại master chuẩn (`MASTER_CODE` / `HO_SO_TYPE`), gắn với **đơn vị** (`DON_VI`) và **người** (`USER_DIRECTORY`), tách **file** và **quan hệ** khỏi dòng master.

## Vai trò

- Nguồn sự thật hồ sơ cho vận hành nhỏ (manual-first).
- Không thay thế `DON_VI` — tổ chức pháp lý nằm ở `DON_VI`; hồ sơ có thể tham chiếu `DON_VI_ID`.

## Đầu ra

- Bản ghi `HO_SO_MASTER` ref-safe.
- File lưu tại `HO_SO_FILE`.
- Liên kết nghiệp vụ tại `HO_SO_RELATION` (ref đích đã kiểm tra).
- Lịch sử tại `HO_SO_UPDATE_LOG`.

## Phiên bản

**PRO** — xem `HO_SO_MODULE_PRO.md`.
