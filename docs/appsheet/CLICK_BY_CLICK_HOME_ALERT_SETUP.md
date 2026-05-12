# Click-by-Click — Tạo app AppSheet HOME_ALERT (bước đầu)

**Dành cho:** Người mới, chỉ cần làm theo từng bước.  
**Không cần:** Biết lập trình.  
**Cặp đọc tiếp:** `CLICK_BY_CLICK_TABLES_AND_COLUMNS.md` → `CLICK_BY_CLICK_SLICES.md` → …  
**Phase:** APPSHEET-HAND-A (chỉ tài liệu — không đổi code GAS).

---

## AppSheet là gì? (1 phút đọc)

**AppSheet** là dịch vụ của Google để biến **Google Sheet** (bảng tính) thành **ứng dụng trên điện thoại hoặc máy tính**.  
Bạn vẫn lưu dữ liệu trên Sheet; AppSheet chỉ **hiển thị** và cho phép **bấm nút** (ví dụ “Nhận việc”) một cách dễ nhìn hơn so với mở Sheet thuần.

**HOME_ALERT** là tên một **tab** trong Sheet — sau khi cài xong, app sẽ đọc tab đó để hiện danh sách cảnh báo cho nhân viên vận hành.

---

## Bạn cần chuẩn bị gì?

| Thứ cần | Giải thích đơn giản |
|----------|---------------------|
| **Tài khoản Google** | Email đăng nhập được (Gmail / Workspace). |
| **Google Spreadsheet** | File Sheet đã **nối với script** CBV (đúng file mà team đã deploy GAS). Bạn phải có quyền **Xem + Sửa** (Editor). |
| **Trình duyệt** | Chrome hoặc Edge (khuyến nghị). |
| **Thời gian** | Khoảng 30–60 phút cho bước đầu (tạo app + kiểm tra bảng). |

Nếu bạn **không** thấy tab `HOME_ALERT` trong Sheet, nhờ admin chạy bootstrap trên GAS trước — đừng tự tạo tab sai tên.

---

## Bước 1 — Mở trang AppSheet

1. Mở trình duyệt.  
2. Gõ địa chỉ: **https://www.appsheet.com**  
3. Bấm **Đăng nhập** (Sign in) bằng **cùng** tài khoản Google có quyền sửa Spreadsheet.

---

## Bước 2 — Tạo app mới

1. Sau khi đăng nhập, tìm nút kiểu **Create** / **Make a new app** / **My apps** rồi **Create app** (giao diện Google đôi khi đổi tên, nhưng ý là **tạo app mới**).  
2. Chọn kiểu **Start with your data** (bắt đầu với dữ liệu của bạn) — *không* chọn mẫu trống nếu có lựa chọn rõ ràng như vậy.  
3. Khi được hỏi nguồn dữ liệu, chọn **Google Sheets** (hoặc **Google Drive** rồi chọn Sheet).  
4. **Chọn đúng file Spreadsheet** CBV của team (tên file do admin cung cấp).  
5. Bấm **Select** / **Choose** / **Continue** để AppSheet đọc cấu trúc Sheet.

Đợi vài chục giây để AppSheet tạo app.

---

## Bước 3 — Đặt tên app và lưu

1. Ở góc trên thường có ô **App name** — đặt tên dễ nhớ, ví dụ: `CBV HOME_ALERT Pilot`.  
2. Bấm **Save** (Lưu) nếu có — một số giao diện tự lưu sau vài giây.

---

## Bước 4 — Kiểm tra bảng `HOME_ALERT` đã vào app chưa

1. Trong menu bên trái (hoặc trên cùng), tìm mục **Data** (Dữ liệu).  
2. Bấm **Tables** (Bảng).  
3. Trong danh sách, tìm dòng có tên **`HOME_ALERT`**.  
   - **Nếu thấy:** tốt — sang bước 5.  
   - **Nếu không thấy:** có thể AppSheet chưa import đủ tab — xem file `CLICK_BY_CLICK_TABLES_AND_COLUMNS.md` phần “Thêm bảng mới”.

---

## Bước 5 — Xem trước app (Preview)

1. Tìm nút **Preview** (Xem trước) — thường ở góc phải trên.  
2. Bấm **Preview**.  
3. Cửa sổ giả lập điện thoại hoặc bảng điều khiển sẽ mở.  
4. Kiểm tra: có **danh sách** hoặc **màn hình trống nhưng không báo lỗi đỏ** không.

---

## Bước 6 — Mở app trên điện thoại (tùy chọn nhưng nên làm)

1. Trên máy tính, trong AppSheet, tìm mục **Users** / **Deploy** / **Share** (tên menu có thể khác theo phiên bản).  
2. Chọn **Install** / **Get link** để lấy **link cài đặt** hoặc **mã QR**.  
3. Mở link trên điện thoại (cùng tài khoản Google) và làm theo hướng dẫn **Add to Home screen** / **Install app** nếu có.

---

## Bước 7 — Lưu lại và thoát an toàn

1. Bấm **Save** nếu còn dấu * chưa lưu.  
2. Có thể đóng tab trình duyệt — app đã nằm trên cloud AppSheet.

---

## Checklist cuối file (đánh dấu khi xong)

- [ ] Đã đăng nhập **appsheet.com** bằng đúng Google account.  
- [ ] Đã tạo app **từ đúng Spreadsheet** CBV.  
- [ ] Đã vào **Data → Tables** và **thấy** bảng `HOME_ALERT` (hoặc đã ghi chú để thêm sau theo hướng dẫn bảng).  
- [ ] **Preview** mở được, **không** có thông báo lỗi sync đỏ nghiêm trọng.  
- [ ] Đã **Save** tên app.  
- [ ] (Tuỳ chọn) Đã thử mở app trên **điện thoại**.

**Bước tiếp theo:** Mở file `CLICK_BY_CLICK_TABLES_AND_COLUMNS.md` để thêm đủ các bảng và chỉnh cột.
