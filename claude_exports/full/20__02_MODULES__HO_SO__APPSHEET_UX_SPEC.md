# AppSheet UX — HO_SO (PRO)

Tóm tắt; chi tiết cấu hình: `04_APPSHEET/APPSHEET_HO_SO_PRO_SPEC.md`.

## Nguyên tắc

- Không nhập tay ID ref quan trọng — dùng **Ref** tới `MASTER_CODE` (slice `HO_SO_TYPE`), `DON_VI`, `USER_DIRECTORY`.
- `STATUS` đổi bằng **action** (workflow), không sửa tự do trên cột (Show_if / Editable_If = false cho user thường).
- Trường hệ thống: `ID`, `HO_SO_CODE`, `CREATED_*`, `UPDATED_*` — ẩn hoặc read-only.

## Views (tối thiểu)

- Home / menu: `HO_SO_HOME`
- Danh sách: `HO_SO_MASTER_Table` (slice Active)
- Chi tiết: `HO_SO_MASTER_Detail` + inline: `HO_SO_FILE`, `HO_SO_RELATION`, `HO_SO_UPDATE_LOG`
- Form: `HO_SO_Form`
- `HO_SO_My_View` (OWNER_ID = USEREMAIL ref)
- `HO_SO_Expiring_View` / `HO_SO_Expired_View` (slice + virtual nếu cần)

## Slices

- `HO_SO_MASTER_Active` — `IS_DELETED = FALSE`
- `HO_SO_FILE_Active`, `HO_SO_RELATION_Active`, `HO_SO_UPDATE_LOG_Active`
- `HO_SO_MASTER_MyItems`, `_Expiring`, `_Expired` theo rule nghiệp vụ
