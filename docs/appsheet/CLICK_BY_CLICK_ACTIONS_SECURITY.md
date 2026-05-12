# Click-by-Click — Actions & Security Filter

**Dành cho:** Người đã có view cơ bản.  
**Phase:** APPSHEET-HAND-A — chỉ tài liệu.  
**Nhắc:** AppSheet expression dùng dấu phẩy `,` — không dùng `;`.

---

## Action là gì?

**Action** = việc xảy ra khi người dùng **bấm một nút** (ví dụ “Nhận việc”).  
Action có thể **sửa một vài cột** của dòng hiện tại (theo quyền và security filter).

**Lưu ý quan trọng:** CBV HOME_ALERT — **thay đổi trạng thái nghiệp vụ** tốt nhất qua **GAS / webhook** đã được team cấu hình.  
Các ví dụ dưới là **mẫu tối giản** để bạn hiểu cách bấm trong AppSheet; admin có thể thay bằng **Behavior → Action** gọi **Webhook** thay vì set cột trực tiếp.

---

## Security Filter là gì?

**Security filter** = điều kiện **ẩn hàng** mà user không được quyền xem.  
Khác với **Show_If** (chỉ ẩn nút). Bảo mật thật phải làm ở **Security filter**.

---

## Bước 1 — Tạo Action mới

1. Bấm **Behavior** (Hành vi).  
2. Bấm **Actions**.  
3. Bấm **+** / **New Action**.

---

## Bước 2 — Đặt tên và chọn loại

1. **Action name** — đặt đúng tên trong bảng dưới (ví dụ `ACT_CLAIM_ALERT`).  
2. **For a row of** — chọn table `HOME_ALERT`.  
3. **Do this** — chọn **Set the values of some columns in this row** (hoặc **Data: set row values**) nếu làm mẫu set cột; nếu dùng webhook, chọn **Call a webhook** theo hướng dẫn admin.

---

## Các action nên có (tên gợi ý)

| Tên action | Mục đích người dùng hiểu |
|------------|-------------------------|
| `ACT_CLAIM_ALERT` | Nhận việc / claim |
| `ACT_MARK_WAITING` | Đánh dấu đang chờ |
| `ACT_BLOCK_ALERT` | Chặn / block |
| `ACT_RESOLVE_ALERT` | Đóng / resolve |
| `ACT_REFRESH_SNAPSHOT` | Gọi làm mới snapshot (thường admin / webhook) |

---

## Ví dụ — `ACT_CLAIM_ALERT` (Set cột — mẫu minh họa)

**Chỉ dùng khi** team cho phép AppSheet ghi trực tiếp và các cột đang lưu **email** trong `ASSIGNED_TO` / `CLAIMED_BY`.

Trong action, thêm các bước **Set column value**:

| Cột | Giá trị (expression) |
|-----|----------------------|
| `ASSIGNED_TO` | `USEREMAIL()` |
| `CLAIMED_BY` | `USEREMAIL()` |
| `CLAIMED_AT` | `NOW()` |
| `LAST_OPERATOR_ACTION` | `"CLAIM"` |

> Nếu `ASSIGNED_TO` là **Ref USER_ID**, không dùng `USEREMAIL()` trực tiếp — dùng `LOOKUP(USEREMAIL(), "USER_DIRECTORY", "EMAIL", "USER_ID")` hoặc action webhook.

**Show_If** (ẩn nút khi không claim được) — ví dụ:

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  ISBLANK([ASSIGNED_TO])
)
```

(Chi tiết đầy đủ trong `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §4.)

---

## Bước 3 — Security filter cho bảng `HOME_ALERT`

1. **Security** → **Table security** (hoặc **Data** → table `HOME_ALERT` → **Security filter**).  
2. Dán **Row filter expression** (điều chỉnh theo dữ liệu thật).

### Operator — ví dụ copy (đơn giản hóa)

```
OR(
  LOOKUP(USEREMAIL(), "USER_DIRECTORY", "EMAIL", "IS_ADMIN") = TRUE,
  [ASSIGNED_TO] = USEREMAIL(),
  [CLAIMED_BY] = USEREMAIL(),
  ISBLANK([ASSIGNED_TO])
)
```

**Ý nghĩa từng phần (đơn giản):**

- **Admin** luôn xem được (nhánh `IS_ADMIN`).  
- Người được **gán** (`ASSIGNED_TO`) hoặc **đã claim** (`CLAIMED_BY`) thấy dòng.  
- Dòng **chưa ai nhận** (`ASSIGNED_TO` trống) có thể thấy để queue mở — *tuỳ chính sách team*; có thể bỏ nhánh `ISBLANK` nếu chỉ supervisor thấy unassigned.

> Nếu cột lưu **USER_ID**, thay `= USEREMAIL()` bằng so sánh qua `LOOKUP` như `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §6B.

### Supervisor — khung mẫu

Dùng thêm nhánh **team** (xem Formula Reference §6B `IN([ASSIGNED_TEAM], SELECT(...))`).  
Cấu hình chính xác theo `TEAM_DIRECTORY` thực tế.

### Admin

Thường đã gộp trong `OR` nhánh `IS_ADMIN` như trên.

---

## Bước 4 — Những thứ tuyệt đối không bật

| Cấm | Vì sao |
|-----|--------|
| **AppSheet Bot** tự đổi trạng thái | Trái nguyên tắc CBV HOME_ALERT |
| **Auto assign / auto resolve / auto escalate** trong AppSheet | Trái Phase 84 / ecosystem |
| Cho operator sửa bảng **policy / automation / matrix** | Rủi ro — chỉ admin |

---

## Checklist cuối file

- [ ] Đã tạo các action `ACT_*` (hoặc webhook tương đương theo chính sách).  
- [ ] Đã cấu hình **Security filter** cho `HOME_ALERT`.  
- [ ] Đã có nhánh **admin** (`IS_ADMIN`) trong filter (hoặc tương đương).  
- [ ] Đã kiểm tra **Show_If** cho nút Claim / Resolve không hiện sai case.  
- [ ] **Không** bật AppSheet Bot.  
- [ ] Preview: user thường **không** thấy alert của người khác (thử 2 tài khoản nếu có).

**Hoàn tất chuỗi click-by-click:** Quay lại `CLICK_BY_CLICK_HOME_ALERT_SETUP.md` checklist và chạy thử end-to-end.
