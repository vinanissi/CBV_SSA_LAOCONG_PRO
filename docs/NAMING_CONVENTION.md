# Quy ước đặt tên — kỹ thuật vs hiển thị (CBV / LAOCONG)

## Kỹ thuật không gắn version

| Loại | Quy ước | Ví dụ |
|------|-----------|--------|
| Module code | Tên module ngắn, ổn định | `HOSO` |
| Commands | `MODULE_ACTION` | `HOSO_CREATE`, `HOSO_UPDATE`, `HOSO_SEARCH` |
| Events | `MODULE_ACTION` (past) | `HOSO_CREATED`, `HOSO_UPDATED` |
| Table / entity code nội bộ | Không nhúng `V2_2` trong registry command/event mới | `MASTER`, `XA_VIEN`, `PHUONG_TIEN` |

Version **không** đưa vào chuỗi command/event kỹ thuật; chỉ dùng ở lớp hiển thị, tên file Google Sheet, config, release note.

## Hiển thị / tài liệu / Spreadsheet có version

- Tên spreadsheet hoặc alias người dùng: ví dụ `CBV_LAOCONG_HOSO_V2_2_DB`, `CBV_LAOCONG_CONFIG_V2_2_DB`.
- UI / tài liệu: "Hồ sơ V2.2", "Cấu hình V2.2".

## Tránh (đối với registry kỹ thuật mới)

- `HOSO_V2_2_CREATE` — lẫn version vào command.
- `HO_SO_CREATE` trong technical registry mới — ưu tiên prefix module thống nhất `HOSO_*` cho command/event **mới** (schema cột sheet có thể vẫn dùng tiền tố `HO_SO_*` theo manifest đã chốt; không đổi schema trong đợt tách repo này).
- Dùng `HO_SO_MASTER` làm "tên bảng code mới" nếu đã chốt bảng khác — tuân manifest hiện hành; tài liệu này chỉ chốt hướng tách tên **kỹ thuật** command/event.

## Tham chiếu

- Quy ước code file/function: `.cursor/rules/cbv-naming-conventions.mdc`, `00_OVERVIEW/NAMING_CONVENTIONS.md` (nếu có trong repo).
- Deploy clasp: `DEPLOYMENT_CLASP_GUIDE.md`.
