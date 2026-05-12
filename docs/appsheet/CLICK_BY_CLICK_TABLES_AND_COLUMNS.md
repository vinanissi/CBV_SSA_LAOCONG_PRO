# Click-by-Click — Thêm bảng (Tables) và chỉnh cột (Columns)

**Dành cho:** Người làm theo sau khi đã tạo app (xem `CLICK_BY_CLICK_HOME_ALERT_SETUP.md`).  
**Phase:** APPSHEET-HAND-A — chỉ tài liệu.

---

## “Table” trong AppSheet là gì?

Mỗi **Table** = một **tab** trong Google Sheet.  
Thêm Table = báo cho AppSheet: “Hãy đọc tab này trong app.”

---

## Bước 1 — Mở màn hình Tables

1. Mở app của bạn trong AppSheet Editor.  
2. Bấm **Data** (menu trái).  
3. Bấm **Tables**.

Bạn sẽ thấy danh sách các bảng đã có.

---

## Bước 2 — Thêm một bảng mới (chuỗi thao tác chuẩn)

Lặp lại chuỗi sau **cho từng tab** trong danh sách bên dưới.

1. Bấm **+** hoặc **New Table** / **Add table** (tùy giao diện).  
2. Chọn nguồn **Google Sheets**.  
3. Chọn **đúng file Spreadsheet** (nếu được hỏi lại).  
4. Chọn **tên tab** (sheet name) trong danh sách — ví dụ `HOME_ALERT`.  
5. Bấm **Add this table** / **Add** / **OK**.  
6. Đợi AppSheet đồng bộ vài giây.

---

## Bước 3 — Danh sách tab cần có trong app

Thêm lần lượt (nếu chưa có):

| # | Tên tab trong Google Sheet | Ghi chú ngắn |
|---|---------------------------|---------------|
| 1 | `HOME_ALERT` | Bảng chính cho operator |
| 2 | `HOME_ALERT_SLA_POLICY` | Chính sách SLA (admin) |
| 3 | `HOME_ALERT_SLA_METRICS` | Số liệu (thường chỉ đọc) |
| 4 | `HOME_ALERT_AUTOMATION_CONFIG` | Cấu hình automation (admin) |
| 5 | `HOME_ALERT_DAILY_SNAPSHOT` | Snapshot ngày |
| 6 | `ENUM_DICTIONARY` | Từ điển enum |
| 7 | `USER_DIRECTORY` | Danh bạ user |
| 8 | `MASTER_CODE` | Mã chuẩn |
| 9 | `DON_VI` | Đơn vị |
| 10 | `TEAM_DIRECTORY` | Team |
| 11 | `ROLE_PERMISSION_MATRIX` | Ma trận quyền (admin) |
| 12 | `FEATURE_FLAG` | Bật tắt tính năng (admin) |
| 13 | `SYSTEM_REGISTRY` | Registry (admin) |

Nếu một tab **không tồn tại** trong Sheet, không thể thêm — báo admin chạy bootstrap / tạo tab trước.

---

## Bước 4 — Regenerate Structure (rất quan trọng)

Sau khi thêm hoặc sửa cột trên Google Sheet:

1. Vào **Data → Tables**.  
2. Chọn một table (ví dụ `HOME_ALERT`).  
3. Bấm **Columns** (Cột).  
4. Tìm nút **Regenerate structure** / **Regenerate Structure** / **Refresh column structure** và bấm.  
5. Đợi xong, kiểm tra danh sách cột mới có đủ không.

**Nếu bỏ qua bước này:** AppSheet có thể **không thấy cột mới**, Ref và công thức sẽ sai.

---

## Bước 5 — Đặt Key và Label (từng bảng)

Vào **Data → Tables → [chọn bảng] → Columns**. Tìm cột đúng tên và gán **Key** / **Label** trong phần cấu hình cột (thường có ô “Key?”, “Label?”, hoặc trong **Row labels** của table).

### `HOME_ALERT`

| Mục | Giá trị |
|-----|----------|
| **Key** | `ALERT_ID` |
| **Label** (hiển thị nhanh) | `OPERATOR_PRIMARY_TEXT` |

### `USER_DIRECTORY`

| Mục | Giá trị |
|-----|----------|
| **Key** | `USER_ID` **hoặc** `ID` nếu chưa có cột `USER_ID` điền |
| **Label** | `DISPLAY_NAME` (nếu trống thì dùng `FULL_NAME` — có thể tạo cột ảo sau) |

### `TEAM_DIRECTORY`

| Mục | Giá trị |
|-----|----------|
| **Key** | `TEAM_ID` |
| **Label** | `TEAM_NAME` |

### `MASTER_CODE` / `ENUM_DICTIONARY` / các bảng khác

Làm theo `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` §3A (Key/Label fallback). Nguyên tắc: **Key = cột ID ổn định**, **Label = cột tên hiển thị cho người đọc**.

---

## Bước 6 — Ví dụ chỉnh kiểu cột (Column type)

Vào **Columns** của table `HOME_ALERT`, chọn từng cột sau và chỉnh **Type**:

### `ASSIGNED_TO`

1. Bấm vào cột `ASSIGNED_TO`.  
2. **Type** = **Ref** (tham chiếu).  
3. **Source table** = `USER_DIRECTORY`.  
4. Lưu.

### `ASSIGNED_TEAM`

1. **Type** = **Ref**.  
2. **Source table** = `TEAM_DIRECTORY`.

### `SLA_STATUS`

1. **Type** = **Enum** hoặc **Text** + Valid_If (tuỳ chiến lược team).  
2. Nếu dùng Enum: nhập danh sách giá trị đúng với Sheet (ví dụ `ON_TRACK`, `OVERDUE`, …) — tốt nhất đồng bộ với `ENUM_DICTIONARY` (xem `APPSHEET_REFERENCE_BINDING_CHECKLIST.md`).

### `ENABLED` (trên `HOME_ALERT_AUTOMATION_CONFIG`)

1. **Type** = **Yes/No**.

---

## Cảnh báo thường gặp (đọc trước khi báo lỗi)

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|-------------|-------------------------|------------|
| Không thấy cột mới | Chưa **Regenerate Structure** | Làm Bước 4 |
| Báo Key trùng / Key trống | Hai dòng cùng Key hoặc Key trống | Sửa dữ liệu trên Sheet |
| Ref sai bảng | Chọn nhầm Source table | Sửa lại Ref |
| Type sai | Chọn Enum nhưng giá trị Sheet khác | Đổi type hoặc chuẩn hóa dữ liệu |

---

## Checklist cuối file

- [ ] Đã thêm đủ **13** bảng (hoặc ghi lại bảng nào chưa có trong Sheet).  
- [ ] Đã **Regenerate Structure** cho mỗi bảng sau khi Sheet đổi cột.  
- [ ] `HOME_ALERT`: Key = `ALERT_ID`, Label = `OPERATOR_PRIMARY_TEXT`.  
- [ ] `USER_DIRECTORY` / `TEAM_DIRECTORY`: Key/Label đúng.  
- [ ] `ASSIGNED_TO` = Ref → `USER_DIRECTORY`; `ASSIGNED_TEAM` = Ref → `TEAM_DIRECTORY` (nếu dùng Ref).  
- [ ] `SLA_STATUS` và flag `ENABLED` đúng kiểu cột.  
- [ ] Preview app **không** báo lỗi đỏ nghiêm trọng về cột.

**Bước tiếp theo:** `CLICK_BY_CLICK_SLICES.md`.
