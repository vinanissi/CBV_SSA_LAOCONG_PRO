# HO_SO — Module-led (bán tập trung)

HO_SO hiện chạy **Module-led**:

- **Dispatch** nằm tại project **HO_SO** (`006_CBV_CORE_HOST_DISPATCH.js`) — `CBV_CoreV2_dispatch` gọi `HosoCommandHandler_handle` trên `globalThis` host, không qua `CBVCoreRuntime.dispatch` của thư viện.
- **CORE DB** dùng chung (COMMAND_LOG, EVENT_QUEUE, MODULE_REGISTRY, …) — spreadsheet mở qua `CBV_CORE_DB_ID` + resolver host/thư viện helper.
- **CONFIG DB** dùng chung — resolver/config tracked như hiện có.
- **MAIN_CONTROL** giữ control plane (CORE DB bootstrap, CONFIG, dashboard/health tổng hợp); **chưa** làm gateway dispatch cho HO_SO ở phase này.
- **CORE_RUNTIME_LIB** chỉ còn vai trò **helper** (bootstrap sheet core mặc định, healthCheck, emitEvent, logAudit, stringify, …) — không phụ thuộc handler nghiệp vụ HO_SO.

## Lý do

- Tránh **Apps Script Library** không resolve `HosoCommandHandler_handle` trên host khi chạy `dispatch` trong context thư viện.
- Tăng tốc build triển khai module.
- Giảm rủi ro phình MAIN_CONTROL.
- Giữ lộ trình chuyển sang **centralized gateway** sau này nếu cần.

## Thứ tự file GAS (HO_SO)

Sau bridge: command log → idempotency → permission → registry read → **host dispatch** → command handler & services → menu.
