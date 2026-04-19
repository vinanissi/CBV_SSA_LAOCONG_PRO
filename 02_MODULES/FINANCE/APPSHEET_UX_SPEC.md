# APPSHEET UX SPEC - FINANCE

**Hướng dẫn thao tác từng bước (copy/paste trong AppSheet Editor):** [`APPSHEET_OPERATIONS_GUIDE.md`](APPSHEET_OPERATIONS_GUIDE.md)

## Views
- FIN_DASHBOARD
- FIN_LIST
- FIN_DETAIL
- FIN_CREATE_FORM
- FIN_CONFIRM_QUEUE
- FIN_LOG_INLINE
- **FIN_EXPORT_SETUP** (khuyến nghị): form/deck **FIN_EXPORT_FILTER** — user chọn chu kỳ / đơn vị / người trước khi vào list export
- **FIN_LIST_EXPORT** (khuyến nghị): bảng `FINANCE_TRANSACTION` dùng slice **FIN_EXPORT_CSV** + action Export CSV

## Actions
- Confirm
- Cancel
- Archive
- (Tuỳ chọn, cấu hình AppSheet) **Export this view to a CSV file** — gắn lên view danh sách; xem mục *AppSheet — Xuất file* bên dưới

## UX nguyên tắc
- Người nhập liệu tạo draft nhanh.
- Người xác nhận có queue riêng.
- Không cho sửa `AMOUNT` ở view sau khi confirmed.

---

## Slices (AppSheet — Data → Slices)

Tên slice và filter khớp `04_APPSHEET/APPSHEET_SLICE_SPEC.md` / `APPSHEET_SLICE_MAP.md`.

| Slice | Bảng | Row filter |
|-------|------|------------|
| **FIN_DRAFT** | `FINANCE_TRANSACTION` | `[STATUS] = "NEW"` |
| **FIN_CONFIRMED** | `FINANCE_TRANSACTION` | `[STATUS] = "CONFIRMED"` |
| **FIN_EXPORT_CSV** | `FINANCE_TRANSACTION` | Theo `FIN_EXPORT_FILTER` của user — xem công thức dưới |

**FIN_CONFIRM_QUEUE** (view): dùng cùng slice **FIN_DRAFT** — hàng đợi xác nhận; không phải tên slice riêng trong spec.

### Bảng `FIN_EXPORT_FILTER` (Google Sheet)

Thêm table trong AppSheet trỏ tới sheet **`FIN_EXPORT_FILTER`**. Mỗi user cần **đúng một dòng** có `USER_EMAIL` = email đăng nhập (AppSheet `USEREMAIL()`). Form tạo/sửa: **Initial value** `USER_EMAIL` = `USEREMAIL()`; **Ref** `DON_VI_ID` → slice `ACTIVE_DON_VI`; **Ref** `USER_REF_ID` → `ACTIVE_USERS` (lọc theo **người tạo** `CREATED_BY`).

**Security filter** (khuyến nghị) trên mọi view của bảng này: `[USER_EMAIL] = USEREMAIL()` để không đọc/sửa dòng người khác.

**Key `ID`:** nên là **Text**, initial value `USEREMAIL()` (một dòng/user). Nếu AppSheet báo *Could not find row with key false*, thường do Key/Ref nhận boolean — xem [`APPSHEET_OPERATIONS_GUIDE.md`](APPSHEET_OPERATIONS_GUIDE.md) Phần 8; ưu tiên view **Deck** thay **Form** nếu Form lỗi.

### Slice `FIN_EXPORT_CSV` — công thức (Data → Slices)

Áp dụng cho nguồn `FINANCE_TRANSACTION` (điều chỉnh tên bảng nếu AppSheet khác):

```
AND(
  [IS_DELETED] = FALSE,
  [TRANS_DATE] >= ANY(SELECT(FIN_EXPORT_FILTER[DATE_FROM], [USER_EMAIL] = USEREMAIL())),
  [TRANS_DATE] <= ANY(SELECT(FIN_EXPORT_FILTER[DATE_TO], [USER_EMAIL] = USEREMAIL())),
  IF(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[DON_VI_ID], [USER_EMAIL] = USEREMAIL()))), TRUE, [DON_VI_ID] = ANY(SELECT(FIN_EXPORT_FILTER[DON_VI_ID], [USER_EMAIL] = USEREMAIL()))),
  IF(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL()))), TRUE, [CREATED_BY] = ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL())))
)
```

- **Đơn vị:** `DON_VI_ID` trống trên dòng filter → **không** lọc theo đơn vị (`IF` nhánh `TRUE`).
- **Người:** `USER_REF_ID` trống → **không** lọc theo người (mọi `CREATED_BY`); nếu chọn → chỉ giao dịch có **`CREATED_BY`** trùng ID đã chọn. Xóa hẳn Ref trong form nếu AppSheet không coi là blank.
- Nếu chưa có dòng `FIN_EXPORT_FILTER` cho user, `SELECT` rỗng — cần tạo dòng trong **FIN_EXPORT_SETUP** trước (hoặc slice fallback tùy bạn; mặc định spec: không có dòng thì không có dòng nào thỏa `ANY`).

Sau khi cấu hình: view Table **FIN_LIST_EXPORT** dùng slice này → action **App: export this view to a CSV file** (trình duyệt web).

---

## Export CSV / Google Sheet — thứ tự cột (header dòng 1)

Khớp `CBV_SCHEMA_MANIFEST` trong `90_BOOTSTRAP_SCHEMA.js` (và `CBV_CONFIG.SHEETS`). GAS: `getSchemaHeaders(...)` / `getFinanceExportHeaders(...)` trong `30_FINANCE_SERVICE.js`.

### Sheet `FINANCE_TRANSACTION`

`ID`, `TRANS_CODE`, `TRANS_DATE`, `TRANS_TYPE`, `STATUS`, `CATEGORY`, `AMOUNT`, `DON_VI_ID`, `COUNTERPARTY`, `PAYMENT_METHOD`, `REFERENCE_NO`, `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID`, `DESCRIPTION`, `EVIDENCE_URL`, `CONFIRMED_AT`, `CONFIRMED_BY`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `IS_DELETED`, `IS_STARRED`, `IS_PINNED`, `PENDING_ACTION`

### Sheet `FINANCE_LOG`

`ID`, `FIN_ID`, `ACTION`, `BEFORE_JSON`, `AFTER_JSON`, `NOTE`, `ACTOR_ID`, `CREATED_AT`

### Sheet `FINANCE_ATTACHMENT`

`ID`, `FINANCE_ID`, `ATTACHMENT_TYPE`, `TITLE`, `FILE_NAME`, `FILE_URL`, `DRIVE_FILE_ID`, `NOTE`, `CREATED_AT`, `CREATED_BY`

### GAS — Export kỳ → Google Sheet trên Drive

Menu **CBV PRO → Finance → Export kỳ → Sheet trên Drive**: nhập **Từ ngày** / **Đến ngày** (`yyyy-MM-dd`), timezone `CBV_CONFIG.TIMEZONE`. Tạo file mới tên `CBV_FINANCE_<từ>_<đến>_<timestamp>`, tab `FINANCE_TRANSACTION`, header theo `getFinanceExportHeaders`, chỉ các dòng có `TRANS_DATE` trong kỳ (bỏ `IS_DELETED`), sắp xếp theo ngày rồi `ID`. File được **chuyển vào cùng thư mục Google Drive** với spreadsheet nguồn (nếu có parent folder). Hàm: `exportFinancePeriodToDrive` trong `30_FINANCE_SERVICE.js`.

---

### AppSheet — Xuất file (CSV → Excel / .xlsx)

AppSheet **không** có hành động sẵn kiểu “Export trực tiếp file .xlsx” cho mọi bảng; có các cách sau (ưu tiên theo nhu cầu lọc trên màn hình).

| Cách | Mô tả | Ghi chú |
|------|--------|--------|
| **1. Export view → CSV (mở bằng Excel)** | Trong AppSheet Editor: **Behavior → Actions** → tạo action **Do this** = **App: export this view to a CSV file**. Gắn action vào view **Table** (ví dụ `FIN_LIST` / `FINANCE_LIST` dùng slice `FIN_DRAFT` hoặc `FIN_CONFIRMED`). | Chỉ hoạt động khi app chạy trên **trình duyệt web** (đã đăng nhập). File CSV mở bằng Excel hoặc **Lưu thành** `.xlsx`. Dữ liệu export **theo slice + bộ lọc + sắp xếp** của view đó. Tham khảo: [Export this view to a CSV file](https://support.google.com/appsheet/answer/11579391?hl=en). |
| **2. Tải Excel từ Google Sheet** | Mở spreadsheet nguồn (cùng ID với app) trong Google Sheets → **Tệp → Tải xuống → Microsoft Excel (.xlsx)**. | Xuất **cả tab** `FINANCE_TRANSACTION` (không tự áp slice AppSheet). Phù hợp backup / kế toán lấy full sheet. |
| **3. GAS export theo kỳ** | Như mục trên (menu hoặc gọi `exportFinancePeriodToDrive`). | Có file Sheet riêng trên Drive → người dùng **Tải xuống → Excel** từ Google Sheets. |
| **4. Automation + Excel template** (nâng cao) | AppSheet **Automation** dùng **Microsoft Excel template** để tạo file .xlsx (email / Drive) theo workflow. | Cấu hình phức tạp hơn; xem [Use Microsoft Excel templates](https://support.google.com/appsheet/answer/11575067?hl=en). |

**Khuyến nghị triển khai nhanh:** (1) **Bootstrap / Ensure schema** để có sheet `FIN_EXPORT_FILTER`. (2) Form **FIN_EXPORT_SETUP** + list **FIN_LIST_EXPORT** (slice **FIN_EXPORT_CSV**). (3) Action **Export this view to a CSV file** trên **FIN_LIST_EXPORT**; tên nút ví dụ **“Xuất CSV (chu kỳ / đơn vị / người)”**.

**Triển khai tối thiểu (không dùng FIN_EXPORT_FILTER):** chỉ gắn Export CSV lên `FIN_LIST` với slice `FIN_CONFIRMED` / `FIN_DRAFT` và dùng bộ lọc cột có sẵn trên Table (nếu bật) — không chọn chu kỳ/đơn vị/người theo form riêng.
