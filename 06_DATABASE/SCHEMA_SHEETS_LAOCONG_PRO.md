# SCHEMA SHEETS - LAOCONG PRO

Mỗi file CSV trong `_generated_schema` tương ứng 1 sheet header chuẩn.
Import vào Google Sheets theo đúng tên file/sheet.

## Quy tắc cột (bổ sung cho `schema_manifest.json`)

**Ghi chú theo cột (semantic):** `schema_manifest.json` có khóa **`_COLUMN_NOTES`** cho một số cặp bảng.cột; bản mở rộng có mô tả đầy đủ hơn nằm trong **`06_DATABASE/schema_column_notes.json`**.

**`HO_SO_MASTER.HTX_ID`:** cùng semantic với `02_MODULES/HO_SO/DATA_MODEL.md` — để trống khi `HO_SO_TYPE_ID` là loại **HTX** (bản ghi gốc); bắt buộc có giá trị cho các loại khác. File manifest chỉ liệt kê tên cột; không thể mô tả conditional trong JSON.

## Sheet bắt buộc
- USER_DIRECTORY
- ADMIN_AUDIT_LOG
- MASTER_CODE
- HO_SO_MASTER
- HO_SO_DETAIL_PHUONG_TIEN (chi tiết xe; PLATE_NO unique/HTX tại GAS)
- HO_SO_FILE
- HO_SO_RELATION
- TASK_MAIN
- TASK_CHECKLIST
- TASK_UPDATE_LOG
- TASK_ATTACHMENT
- FINANCE_TRANSACTION
- FINANCE_LOG
