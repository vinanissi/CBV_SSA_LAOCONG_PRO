# Hướng dẫn thao tác AppSheet — Module Tài chính (FINANCE)

**Mục đích:** Làm từng bước trong **AppSheet Editor**; copy đúng khối công thức khi được ghi *Dán vào…*.  
**Tham chiếu kỹ thuật:** [`APPSHEET_UX_SPEC.md`](APPSHEET_UX_SPEC.md)

---

## Trước khi bắt đầu

1. Google Sheet nguồn đã có tab **`FIN_EXPORT_FILTER`** (chạy GAS **Ensure schema** / bootstrap nếu chưa có).
2. App đã thêm **Data source** trỏ đúng spreadsheet và các bảng **`FINANCE_TRANSACTION`**, **`USER_DIRECTORY`**, **`DON_VI`**, **`FIN_EXPORT_FILTER`** (xem thứ tự trong `04_APPSHEET/APPSHEET_DEPLOYMENT_NOTES.md`).
3. Các slice **`ACTIVE_USERS`**, **`ACTIVE_DON_VI`** đã tồn tại (dùng cho Ref).

---

## Phần 1 — Thêm / kiểm tra bảng `FIN_EXPORT_FILTER`

1. Mở **AppSheet** → chọn app → **Data** (hoặc **Data** → **Tables**).
2. **Add table** (nếu chưa có) → chọn spreadsheet → chọn sheet **`FIN_EXPORT_FILTER`**.
3. **Columns** → đặt **Key** = **`ID`** (kiểu Text).
4. Cấu hình cột (rút gọn):

| Cột | Kiểu / Ref |
|-----|-------------|
| `USER_EMAIL` | Text |
| `DATE_FROM` | Date |
| `DATE_TO` | Date |
| `DON_VI_ID` | Ref → `DON_VI` (slice **ACTIVE_DON_VI** nếu đã có) |
| `USER_REF_ID` | Ref → `USER_DIRECTORY` (slice **ACTIVE_USERS**) |
| `NOTE` | Text (tuỳ chọn) |
| `UPDATED_AT` | DateTime (tuỳ chọn) |

5. **Quan trọng — cột `ID` (Key):**
   - **Type** = **Text** (không dùng Yes/No / Enum sai kiểu làm Key).
   - **Initial value** (khi thêm dòng mới) = `USEREMAIL()`  
     → mỗi user **một dòng**, khóa là **chuỗi email**, tránh AppSheet dùng nhầm giá trị boolean làm key (gây lỗi *Could not find row with key false*).
   - Cột **`USER_EMAIL`**: **Initial value** = `USEREMAIL()` (đồng bộ với `ID` nếu bạn dùng cùng quy ước email = id).
6. Cột **Ref** `DON_VI_ID`, `USER_REF_ID`: **không** đặt Initial value / Default là biểu thức trả về **FALSE**; để trống = không chọn.

7. Lưu.

---

## Phần 2 — Tạo slice `FIN_EXPORT_CSV`

1. **Data** → **Slices** → **Add slice**.
2. Đặt tên: **`FIN_EXPORT_CSV`**.
3. **Source table:** `FINANCE_TRANSACTION`.
4. **Row filter** — xóa nội dung cũ, **dán nguyên khối sau** (một dòng trong AppSheet có thể cần bỏ xuống dòng; nếu báo lỗi, thử dán một dòng hoặc dùng phiên bản một dòng ở cuối mục này):

```
AND(
  [IS_DELETED] = FALSE,
  [TRANS_DATE] >= ANY(SELECT(FIN_EXPORT_FILTER[DATE_FROM], [USER_EMAIL] = USEREMAIL())),
  [TRANS_DATE] <= ANY(SELECT(FIN_EXPORT_FILTER[DATE_TO], [USER_EMAIL] = USEREMAIL())),
  IF(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[DON_VI_ID], [USER_EMAIL] = USEREMAIL()))), TRUE, [DON_VI_ID] = ANY(SELECT(FIN_EXPORT_FILTER[DON_VI_ID], [USER_EMAIL] = USEREMAIL()))),
  IF(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL()))), TRUE, [CREATED_BY] = ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL())))
)
```

5. **Lưu** slice.

**Ghi chú:**

- **Không lọc theo người:** để trống **`USER_REF_ID`** (Ref không chọn) — nhánh `IF(..., TRUE, ...)` cho phép mọi `CREATED_BY`.
- **Có lọc theo người tạo:** chọn **`USER_REF_ID`** → chỉ giao dịch có `[CREATED_BY]` trùng.
- **Đơn vị:** để trống **`DON_VI_ID`** = không lọc đơn vị.
- Mỗi user cần **một dòng** trong `FIN_EXPORT_FILTER` có `USER_EMAIL` = email đăng nhập.

**Phiên bản một dòng** (nếu Editor không nhận nhiều dòng):

```
AND([IS_DELETED] = FALSE, [TRANS_DATE] >= ANY(SELECT(FIN_EXPORT_FILTER[DATE_FROM], [USER_EMAIL] = USEREMAIL())), [TRANS_DATE] <= ANY(SELECT(FIN_EXPORT_FILTER[DATE_TO], [USER_EMAIL] = USEREMAIL())), IF(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[DON_VI_ID], [USER_EMAIL] = USEREMAIL()))), TRUE, [DON_VI_ID] = ANY(SELECT(FIN_EXPORT_FILTER[DON_VI_ID], [USER_EMAIL] = USEREMAIL()))), IF(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL()))), TRUE, [CREATED_BY] = ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL()))))
```

**Nếu Editor báo lỗi với `IF`:** dùng tương đương bằng `OR` cho từng nhánh, ví dụ người:  
`OR(ISBLANK(ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL()))), [CREATED_BY] = ANY(SELECT(FIN_EXPORT_FILTER[USER_REF_ID], [USER_EMAIL] = USEREMAIL())))`.

---

## Phần 3 — View cấu hình lọc: `FIN_EXPORT_SETUP`

### Cách A — Deck (khuyến nghị, ít lỗi hơn Form)

1. **UX** → **Views** → **New view**.
2. Tên: **`FIN_EXPORT_SETUP`**.
3. **View type:** **Deck**.
4. **For table:** `FIN_EXPORT_FILTER`.
5. **Security filter** — **dán:**

```
[USER_EMAIL] = USEREMAIL()
```

6. Bật **Allow adding new rows** / **Add** (nếu có) để user tạo dòng đầu tiên; sau khi có dòng, chạm dòng để sửa `DATE_FROM`, `DATE_TO`, `DON_VI_ID`, `USER_REF_ID`.
7. Hiển thị các cột cần chỉnh; ẩn `ID` khỏi UI nếu không muốn sửa (giữ Key = email trong sheet).
8. Lưu view.

### Cách B — Form (nếu dùng Form và gặp lỗi, xem **Phần 8**)

1. **View type:** **Form**.
2. **For table:** `FIN_EXPORT_FILTER`.
3. **Security filter** — giống Cách A (dán cùng công thức trên).
4. **Form behavior:** ưu tiên chế độ **chỉnh một bản ghi đã tồn tại** — tạo **một dòng thủ công** trong Google Sheet trước: cột `ID` = email user (trùng `USER_EMAIL`), `USER_EMAIL` = email, còn lại để trống hoặc điền tạm. Sau đó Form mở đúng key (text), không phải `false`.
5. Cột hiển thị: `DATE_FROM`, `DATE_TO`, `DON_VI_ID`, `USER_REF_ID`, `NOTE`.  
   - **`ID`**: Read-only hoặc ẩn; không gán công thức Yes/No.
6. Lưu view.

---

## Phần 4 — View danh sách export: `FIN_LIST_EXPORT`

1. **UX** → **Views** → **New view**.
2. Tên: **`FIN_LIST_EXPORT`**.
3. **View type:** **Table** (hoặc **Deck**).
4. **For table:** `FINANCE_TRANSACTION`.
5. **Slice:** chọn **`FIN_EXPORT_CSV`**.
6. Chọn cột hiển thị (ví dụ): `TRANS_CODE`, `TRANS_DATE`, `TRANS_TYPE`, `STATUS`, `CATEGORY`, `AMOUNT`, `DON_VI_ID`, `CREATED_BY`.
7. Lưu view.

---

## Phần 5 — Action **Export CSV**

1. **Behavior** → **Actions** → **Add action**.
2. **Action name:** ví dụ **`ACT_FIN_EXPORT_CSV`**.
3. **Do this:** chọn **`App: export this view to a CSV file`** (hoặc tên tương đương trong menu).
4. **Only if / Condition:** (tuỳ chọn) để trống hoặc điều kiện role.
5. **Attach to view:** chọn **`FIN_LIST_EXPORT`** (chỉ view Table chứa dữ liệu cần xuất).
6. **Appearance:** đặt nhãn nút ví dụ **`Xuất CSV`**.
7. Lưu.

**Lưu ý:** Export CSV thường chỉ ổn định trên **trình duyệt web** (mở app bằng link web, không phải mọi app container).

---

## Phần 6 — Người dùng cuối (vận hành)

1. Mở app **bằng trình duyệt** (Chrome…).
2. Vào view **`FIN_EXPORT_SETUP`**:
   - Chọn **Từ ngày / Đến ngày** (`DATE_FROM`, `DATE_TO`).
   - (Tuỳ chọn) Chọn **đơn vị** — để trống = tất cả đơn vị.
   - (Tuỳ chọn) Chọn **người** (`USER_REF_ID`) — **để trống / xóa Ref** = **không lọc theo người** (hiện mọi người tạo trong chu kỳ); nếu chọn = chỉ giao dịch do người đó **tạo** (`CREATED_BY`).
3. **Lưu** bản ghi filter.
4. Vào view **`FIN_LIST_EXPORT`** → kiểm tra danh sách đúng ý.
5. Bấm nút **Xuất CSV** → tải file → mở bằng Excel hoặc **Lưu thành** `.xlsx`.

---

## Phần 7 — Cách tối thiểu (không dùng `FIN_EXPORT_FILTER`)

1. Tạo / dùng view Table **`FIN_LIST`** với slice **`FIN_CONFIRMED`** hoặc **`FIN_DRAFT`**.
2. Tạo Action **Export this view to a CSV file** gắn vào view đó.
3. Không có form chu kỳ/đơn vị/người riêng — chỉ export đúng slice đó.

---

## Liên kết Google

- [Export this view to a CSV file](https://support.google.com/appsheet/answer/11579391?hl=en)

---

## Export ngoài AppSheet (tham khảo)

| Cách | Thao tác |
|------|----------|
| GAS theo kỳ | Spreadsheet → menu **CBV PRO** → **Finance** → **Export kỳ → Sheet trên Drive** |
| Cả tab trong Excel | Mở Google Sheet → **File** → **Download** → **Microsoft Excel (.xlsx)** |

Chi tiết cột export: [`APPSHEET_UX_SPEC.md`](APPSHEET_UX_SPEC.md).

---

## Phần 8 — Xử lý lỗi: *Could not find row with key false*

Thông báo này thường xuất hiện trên view **`FIN_EXPORT_SETUP`** khi AppSheet cố mở một bản ghi với **khóa không phải text hợp lệ** — hay gặp nhất là giá trị boolean **`FALSE`** bị dùng như **Key** hoặc **Ref**.

| Nguyên nhân | Cách xử lý |
|-------------|------------|
| Cột **Key (`ID`)** trống / sai kiểu khi thêm dòng | **Data** → **Columns** → **ID** → Type **Text**, **Initial value** = `USEREMAIL()`. |
| Cột **Yes/No** hoặc biểu thức trả về **FALSE** bị gán nhầm làm Key / Ref | Kiểm tra mọi **Initial value**, **Valid_If**, **Show?** trên cột Key và Ref — không dùng `FALSE` làm key. |
| **Form** mở khi **chưa có dòng** nào thỏa filter | Tạo **một dòng** trong sheet `FIN_EXPORT_FILTER` với `ID` = email user (text), `USER_EMAIL` = email; hoặc chuyển sang **Deck** (Cách A). |
| **Ref** `DON_VI_ID` / `USER_REF_ID` lỗi cấu hình | Đảm bảo Ref trỏ đúng bảng + Key đích; xóa default sai. |

**Thứ tự sửa nhanh:** (1) Đặt **Initial value** của **`ID`** = `USEREMAIL()`. (2) Đổi view sang **Deck** + security filter như Phần 3 Cách A. (3) Seed một dòng mẫu trong Google Sheet cho user đang thử.

---

## Phần 9 — Xử lý lỗi: *Updated row with key … cannot be found*

Ví dụ: `Updated row with key ec986f1f cannot be found`.

AppSheet đang **ghi cập nhật** một dòng có `ID` = giá trị đó, nhưng trong **Google Sheet không còn dòng** trùng Key (đã xóa, đổi Key tay, hoặc lệch bản sau đồng bộ).

| Nguyên nhân | Cách xử lý |
|-------------|------------|
| Xóa / sửa cột **ID** trực tiếp trong Sheet trong khi app còn mở | Không xóa dòng filter tay; không đổi **ID** sau khi đã tạo. Nếu đã xóa: tạo **dòng mới** với `ID` ổn định (khuyến nghị = **email** user, trùng `USER_EMAIL`). |
| Key cũ là **UNIQUEID** / chuỗi ngẫu nhiên, dòng bị xóa | Trong tab `FIN_EXPORT_FILTER`, thêm lại một dòng: **ID** = `USEREMAIL()`, **USER_EMAIL** = `USEREMAIL()`, điền ngày/đơn vị; lưu từ app lần nữa. |
| Cache app lỗi thời | Đóng tab app → mở lại; hoặc **Sync** / làm mới trình duyệt (F5). |
| Hai user cùng sửa một dòng | Tránh sửa cùng một `ID` trên hai thiết bị; mỗi user nên có **một dòng riêng** (`ID` = email của họ). |

**Khuyến nghị phòng ngừa (bảng `FIN_EXPORT_FILTER`):**

- **`ID` = `USEREMAIL()`** (text, cố định theo user) — dễ nhận biết trong Sheet, ít “mồ côi” Key ngẫu nhiên.
- Không xóa dòng filter trong Sheet trừ khi chắc chắn; nếu xóa, tạo lại cùng **ID** (email) từ app hoặc Sheet.

**Kiểm tra nhanh:** Mở Google Sheet → tab **`FIN_EXPORT_FILTER`** → tìm cột **ID** có giá trị trùng với key trong thông báo lỗi. Nếu **không có dòng đó** → tạo lại dòng đúng Key hoặc tạo dòng mới với quy ước **ID = email** rồi lưu từ AppSheet.

---

## Phần 10 — Event-driven core (FINANCE, không đổi thao tác user)

Các thao tác xác nhận / hủy / lưu trữ giao dịch vẫn như các phần trên. Phía GAS ghi thêm **`EVENT_QUEUE`** và (khi có rule trong **`RULE_DEF`**) xử lý batch qua menu **CBV PRO → Bootstrap & init → Process EVENT_QUEUE now** hoặc trigger 5 phút. Action **`SEND_ALERT`** ghi **`ADMIN_AUDIT_LOG`** (audit nội bộ, không bắt user AppSheet đổi gì).

Chi tiết kiến trúc, bảng mẫu `RULE_DEF`, danh sách `EVENT_TYPE`: **`00_OVERVIEW/EVENT_DRIVEN_MIGRATION_PLAN.md`**.
