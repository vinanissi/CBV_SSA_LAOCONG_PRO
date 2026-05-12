# HOME_ALERT — AppSheet Setup (sheet-driven runtime)

Mục tiêu: AppSheet **chỉ hiển thị + bấm thao tác**, dữ liệu thật nằm ở Google Sheet `HOME_ALERT`, logic tạo alert nằm ở GAS (`HomeAlert_refresh()`).

## 1) Bảng cần add

- `HOME_ALERT`

Không dùng Virtual Column.

## 2) Slice tối thiểu

Tạo slice `HOME_ALERT_ACTIVE`:

- **Row filter condition**: `[IS_ACTIVE] = TRUE`

## 3) Views đề xuất

- **HOME_ALERT_Dashboard** (type: Dashboard)
  - Primary: `ALERT_List` (slice: `HOME_ALERT_ACTIVE`)
  - Detail: `ALERT_Detail`
- **ALERT_List** (type: Table / Deck)
  - Source: `HOME_ALERT_ACTIVE`
  - Sort: `PRIORITY_SCORE` (desc), sau đó `SORT_KEY` (asc), sau đó `UPDATED_AT` (desc)
- **ALERT_Detail** (type: Detail)
  - Source: `HOME_ALERT` (hoặc `HOME_ALERT_ACTIVE` tuỳ nhu cầu)

## 4) UX đề xuất (không formula phức tạp)

- **Title/Label**: dùng cột `TITLE`
- **Summary**: dùng cột `MESSAGE`
- **Group**: dùng `DISPLAY_GROUP`
- **Badge**: dùng `BADGE_TEXT` + `BADGE_COLOR`

Không tạo App formula phức tạp; tránh VC.

## 5) Actions (tuỳ chọn, manual-first)

### A) Action Resolve (recommended)

Tạo action `ResolveAlert` (table: `HOME_ALERT`) theo hướng “data-change”:

- Set values of some columns:
  - `[STATUS]` = `"RESOLVED"`
  - `[IS_ACTIVE]` = `FALSE`
  - `[IS_RESOLVED]` = `TRUE`
  - `[RESOLVED_AT]` = `NOW()`
  - `[RESOLVED_BY]` = `USEREMAIL()` *(hoặc map sang internal id nếu hệ thống có)*

Ghi chú:
- Đây là thao tác manual trên Sheet; không bot/automation.
- Nếu muốn chuẩn hoá resolve qua GAS (đảm bảo audit/trace), có thể tạo action gọi webhook tới `HomeAlert_resolveAlert(alertId, note)` (chỉ khi hệ thống đã có tuyến gọi GAS an toàn).

### B) Open Related URL (optional)

Nếu có `RELATED_RECORD_URL`, tạo action “External: go to a website”:

- Target: `[RELATED_RECORD_URL]`

## 6) Vận hành manual

- Chạy `HomeAlert_bootstrap()` một lần để tạo sheet + headers (nếu chưa có).
- Chạy `HomeAlert_refresh()` theo nhu cầu (menu / manual run).
- Không tạo Bot, không tạo trigger tự động trước khi test console đạt `GO`.

