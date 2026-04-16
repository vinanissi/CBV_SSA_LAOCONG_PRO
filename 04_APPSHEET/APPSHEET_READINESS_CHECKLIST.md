# AppSheet readiness checklist

Chạy checklist này sau mỗi lần thay đổi [`06_DATABASE/schema_manifest.json`](../06_DATABASE/schema_manifest.json) (hoặc sau `python 99_TOOLS/sync_schema_manifest_from_bootstrap.py` + export CSV).

**Run after every manifest update** — đồng bộ header Google Sheet, slice, và ref trước khi publish app.

---

## Bảng cần verify trong AppSheet editor

- [ ] Schema các bảng trong manifest khớp với Google Sheet header thực tế (thứ tự cột / tên cột)
- [ ] Slice `ACTIVE_HTX`, `HO_SO_ACTIVE` (hoặc tương đương dự án) filter đúng `IS_DELETED` + `HTX_ID` theo spec
- [ ] Security Filter user scoping hoạt động (không lộ dòng ngoài phạm vi)
- [ ] Ref columns trỏ đúng bảng đích (Related / Ref views)
- [ ] Enum columns dùng đúng `ENUM_DICTIONARY` / `MASTER_CODE` slice hoặc Valid_If đã khóa

---

## Sau mỗi lần thêm bảng mới

- [ ] Thêm bảng vào AppSheet Data sources
- [ ] Tạo slice `IS_DELETED = FALSE` (hoặc tương đương theo bảng — một số bảng dùng `STATUS` thay `IS_DELETED`, xem DATA_MODEL)
- [ ] Verify column types khớp manifest (Text, Date, Yes/No, Ref, File, …)

---

## Sau export CSV từ repo

- [ ] Import hoặc so khớp `_generated_schema/*.csv` với sheet production
- [ ] Chạy `verifyAppSheetReadiness()` trên GAS nếu có trong dự án

---

## Tài liệu liên quan

- [`SCHEMA_SHEETS_LAOCONG_PRO.md`](../06_DATABASE/SCHEMA_SHEETS_LAOCONG_PRO.md)
- [`02_MODULES/TASK/DATA_MODEL.md`](../02_MODULES/TASK/DATA_MODEL.md), [`02_MODULES/FINANCE/DATA_MODEL.md`](../02_MODULES/FINANCE/DATA_MODEL.md), [`02_MODULES/HO_SO/DATA_MODEL.md`](../02_MODULES/HO_SO/DATA_MODEL.md)
