# Click-by-Click — Tạo View & Dashboard

**Dành cho:** Người đã có slice (`CLICK_BY_CLICK_SLICES.md`).  
**Phase:** APPSHEET-HAND-A — chỉ tài liệu.

---

## View là gì?

**View** = một **màn hình** trong app (danh sách, thẻ, chi tiết, bảng…).  
Người dùng bấm icon menu để chuyển giữa các view.

---

## Dashboard là gì?

**Dashboard** = màn hình tổng hợp (thường nhiều biểu đồ / nhiều khối).  
Ở đây `HOME_ALERT_SLA_DASHBOARD` dùng để xem tình trạng SLA tổng quan (tuỳ team cấu hình widget).

---

## Bước 1 — Mở UX → Views

1. Trong AppSheet Editor, bấm **UX** (trải nghiệm người dùng).  
2. Bấm **Views**.  
3. Bấm **+** / **New View**.

---

## Bước 2 — Tạo từng view (lặp lại)

Với mỗi view dưới đây:

1. **New View**.  
2. **View name** — đặt **đúng** tên trong cột “Tên view” (để đồng bộ tài liệu chính).  
3. **For table** / **Based on** — chọn bảng nguồn (cột “Bảng”).  
4. **View type** — chọn loại (cột “Loại”).  
5. **Slice** (nếu có ô chọn) — chọn slice tương ứng.  
6. **Save**.

### Danh sách view cần có

| Tên view | Bảng | Loại gợi ý | Slice / Ghi chú |
|----------|------|------------|-----------------|
| `HOME_ALERT_OPERATOR_DASHBOARD` | `HOME_ALERT` | **Deck** | `HOME_ALERT_ACTIVE` |
| `HOME_ALERT_MY_QUEUE` | `HOME_ALERT` | Deck | `HOME_ALERT_MY_QUEUE` |
| `HOME_ALERT_UNASSIGNED_QUEUE` | `HOME_ALERT` | Deck | `HOME_ALERT_UNASSIGNED_QUEUE` |
| `HOME_ALERT_ESCALATED_QUEUE` | `HOME_ALERT` | Deck | `HOME_ALERT_ESCALATED_QUEUE` |
| `HOME_ALERT_BLOCKED_QUEUE` | `HOME_ALERT` | Deck | `HOME_ALERT_BLOCKED_QUEUE` |
| `HOME_ALERT_SLA_DASHBOARD` | (tuỳ cấu hình) | **Dashboard** | Có thể ghép slice OVERDUE/BREACHED — làm theo admin |
| `HOME_ALERT_DAILY_SNAPSHOT` | `HOME_ALERT_DAILY_SNAPSHOT` | Table / Deck | (không dùng slice HOME_ALERT) |
| `HOME_ALERT_POLICY_ADMIN` | `HOME_ALERT_SLA_POLICY` | Table | Slice admin (tạo riêng hoặc dùng security filter) |
| `HOME_ALERT_AUTOMATION_ADMIN` | `HOME_ALERT_AUTOMATION_CONFIG` | Table | Slice admin |

Giao diện AppSheet có thể gọi “Deck” là **Cards** / **Gallery** — chọn loại tương đương hiển thị **thẻ**.

---

## Bước 3 — Cấu hình Deck operator (`HOME_ALERT_OPERATOR_DASHBOARD`)

Chọn view `HOME_ALERT_OPERATOR_DASHBOARD` → phần cấu hình **Deck / Card**.

Điền **đúng tên cột** sau (không dùng cột legacy):

| Ô trong AppSheet | Tên cột trên Sheet |
|------------------|-------------------|
| **Primary title / header** | `OPERATOR_PRIMARY_TEXT` |
| **Secondary title / subtitle** | `OPERATOR_SECONDARY_TEXT` |
| **Summary / body** | `OPERATOR_META_TEXT` |
| **Action / next line** (nếu có ô “Subtitle 2” hoặc tương đương) | `OPERATOR_NEXT_ACTION` |
| **Group by** | `OPERATOR_DASHBOARD_GROUP` |
| **Sort by** | `OPERATOR_DASHBOARD_SORT` — chiều **DESC** (giảm dần) |

**Lặp lại** mapping tương tự cho các deck `MY_QUEUE`, `UNASSIGNED`, `ESCALATED`, `BLOCKED` để giao diện đồng nhất.

---

## Bước 4 — Cấm dùng cột legacy trên deck operator

**Không** điền vào deck operator các cột:

- `DISPLAY_*`  
- `CARD_*`  
- `UX_*`  
- `DESKTOP_*`  

Đây là **quy tắc contract** — vi phạm sẽ lệch với GAS runtime và tài liệu Phase 82+.

---

## Bước 5 — Format rule (ví dụ nền đỏ khi breach)

1. Vào **UX** → **Format rules** (hoặc trong view có mục Format).  
2. **New format rule**.  
3. **Apply to** — chọn view/slice phù hợp (ví dụ `HOME_ALERT_OPERATOR_DASHBOARD` hoặc slice `HOME_ALERT_ACTIVE`).  
4. **Condition** — copy:

```
[SLA_STATUS] = "BREACHED"
```

5. Đặt tên rule: `SLA_BREACHED_RED`.  
6. Chọn màu nền đỏ (hoặc style team quy định).  
7. **Save**.

Có thể thêm rule **OVERDUE** / **DUE_SOON** theo `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §2.

---

## Checklist cuối file

- [ ] Đã tạo đủ **9** view trong bảng (hoặc ghi rõ view nào deferred).  
- [ ] `HOME_ALERT_OPERATOR_DASHBOARD` là **Deck** + slice **HOME_ALERT_ACTIVE**.  
- [ ] Deck operator dùng **4 dòng OPERATOR_*** + group/sort đúng.  
- [ ] **Không** bind `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*` cho operator deck.  
- [ ] Đã thêm ít nhất **1** format rule ví dụ (`SLA_BREACHED_RED`).  
- [ ] Preview: thấy thẻ alert đọc được chữ.

**Bước tiếp theo:** `CLICK_BY_CLICK_ACTIONS_SECURITY.md`.
