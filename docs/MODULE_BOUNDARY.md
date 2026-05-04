# Biên module — MAIN_CONTROL, HOSO, TASK, FINANCE

## MAIN_CONTROL

Chứa (theo bản copy trong `apps-script/main-control/src`):

- Core V2: bootstrap, command router, command log, idempotency, event bus/worker, audit, permission, health, registry, error, tests, menu.
- Level 6 hardening: schema registry, migration, error code/log, permission advanced, retry, event consumer, backup/rollback, dev governance, hardening tests/menu.
- `150_CBV_CONFIG_RESOLVER.js` — resolver cấu hình.
- `151_CBV_HOSO_V2_2_SETUP.js` — setup bridge (theo mapping từ nguồn `05_GAS_RUNTIME`; tên file có hậu tố hiển thị version, không nhúng version vào command/event).

## HOSO

- Handler, stub, constants, DB layer, validation, duplicate, service (import/search/attachment/print), health, tests, menu — toàn bộ file `*_HO_SO_V2_*` trong `apps-script/hoso/src`.

## TASK / FINANCE (legacy)

- Giữ nguyên hành vi và dependency trong monolith `05_GAS_RUNTIME` cho đến khi có kế hoạch tách runtime.
- Bản copy trong `apps-script/task/src` và `apps-script/finance/src` phục vụ clasp và documentation; **không** cam kết đủ symbol dependency để chạy độc lập nếu chưa bổ sung file shared/core.

## Quy tắc phụ thuộc

1. **HOSO** không phụ thuộc file TASK/FINANCE trong thiết kế mục tiêu; mã copy hiện tại chỉ gồm file HOSO V2.
2. **TASK/FINANCE** không được ghi trực tiếp vào HOSO DB (sheet nghiệp vụ Hồ sơ); liên kết tương lai qua `CBV_ENTITY_LINK` hoặc command/event/API.
3. **MAIN_CONTROL** không thay thế toàn bộ logic nghiệp vụ HOSO; điều phối, permission, event, config.

## Shared

- `apps-script/shared/src` dành cho utility thật sự dùng chung **sau** khi xác định không phá `filePushOrder` và không trùng định nghĩa global. Hiện không copy tự động từ monolith.
