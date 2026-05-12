# Click-by-Click — Tạo Slice (bộ lọc hàng)

**Dành cho:** Người đã thêm tables (xem `CLICK_BY_CLICK_TABLES_AND_COLUMNS.md`).  
**Phase:** APPSHEET-HAND-A — chỉ tài liệu.

> **Cú pháp:** Dưới đây là **AppSheet expression** — dùng dấu phẩy `,` giữa tham số. **Không** dùng dấu `;` như Google Sheets tiếng Việt.

---

## Slice là gì?

**Slice** = một **tập con các dòng** trong một bảng, sau khi áp dụng **điều kiện lọc**.  
Ví dụ slice “Việc của tôi” chỉ hiện các alert được gán cho đúng người đang đăng nhập.

---

## Bước 1 — Mở màn hình Slices

1. **Data** → **Slices**.  
2. Bấm **+** / **New Slice**.

---

## Bước 2 — Mỗi slice cần điền gì?

Khi tạo slice mới, bạn thường cần:

1. **Tên slice** (đặt đúng tên bên dưới để khớp tài liệu chính).  
2. **Source table** (bảng nguồn) — chọn đúng table.  
3. **Row filter** (điều kiện) — **copy dán** khối công thức trong phần dưới.

---

## Các slice cho bảng `HOME_ALERT`

**Source table cho tất cả slice dưới:** `HOME_ALERT`

### `HOME_ALERT_ACTIVE`

**Row filter — copy nguyên:**

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE
)
```

---

### `HOME_ALERT_MY_QUEUE`

**Row filter — copy nguyên** (giả định `ASSIGNED_TO` và `CLAIMED_BY` đang so sánh được với **email** đăng nhập):

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  OR(
    [ASSIGNED_TO] = USEREMAIL(),
    [CLAIMED_BY] = USEREMAIL()
  )
)
```

> Nếu hai cột trên lưu **USER_ID** (Ref), thay bằng phiên bản có `LOOKUP` như trong `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` mục `HOME_ALERT_MY_QUEUE`.

---

### `HOME_ALERT_UNASSIGNED_QUEUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  ISBLANK([ASSIGNED_TO])
)
```

---

### `HOME_ALERT_ESCALATED_QUEUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  IN([ESCALATION_STATUS], LIST("SUGGESTED", "ESCALATED", "ACKNOWLEDGED"))
)
```

---

### `HOME_ALERT_BLOCKED_QUEUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [IS_BLOCKED] = TRUE
)
```

---

### `HOME_ALERT_OVERDUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [SLA_STATUS] = "OVERDUE"
)
```

---

### `HOME_ALERT_BREACHED`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [SLA_STATUS] = "BREACHED"
)
```

---

### `HOME_ALERT_WAITING`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [STATUS] = "WAITING_RESPONSE"
)
```

---

## Slice cho bảng `MASTER_CODE`

**Source table:** `MASTER_CODE`

### `MC_MODULE_CODE`

**Row filter — copy nguyên:**

```
AND(
  [MASTER_GROUP] = "MODULE_CODE",
  [IS_ACTIVE] = TRUE
)
```

> Nếu sheet có cột `IS_DELETED`, nên thêm: `, [IS_DELETED] <> TRUE` vào trong `AND(...)` (xem `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §6B).

---

## Slice cho bảng `ENUM_DICTIONARY`

**Source table:** `ENUM_DICTIONARY`

### `ENUM_SLA_STATUS`

**Row filter — copy nguyên:**

```
AND(
  [ENUM_GROUP] = "SLA_STATUS",
  [IS_ACTIVE] = TRUE
)
```

> Có thể thêm `[IS_DELETED] <> TRUE` nếu có cột soft delete.

---

## Checklist cuối file

- [ ] Đã tạo đủ slice `HOME_ALERT_*` ở trên (8 slice).  
- [ ] Đã tạo `MC_MODULE_CODE` (và các slice `MC_*` khác nếu team cần — xem Formula Reference §6B).  
- [ ] Đã tạo `ENUM_SLA_STATUS` (và các slice `ENUM_*` khác nếu cần).  
- [ ] Mỗi slice đã dán đúng **Row filter**, không có dấu `;`.  
- [ ] Preview một view tạm thời gắn slice `HOME_ALERT_ACTIVE` — thấy dữ liệu hoặc danh sách trống hợp lệ.

**Bước tiếp theo:** `CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md`.
