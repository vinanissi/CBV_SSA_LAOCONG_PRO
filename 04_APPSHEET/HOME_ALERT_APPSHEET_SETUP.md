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
- **ALERT_List** (type: Deck)
  - Source: `HOME_ALERT_ACTIVE`
  - Primary header: `DISPLAY_TITLE`
  - Secondary header: `DISPLAY_SUBTITLE`
  - Summary column: `DISPLAY_SUMMARY`
  - Group by: `CARD_GROUP`
  - Sort: `CARD_SORT` (asc)
- **ALERT_Detail** (type: Detail)
  - Source: `HOME_ALERT` (hoặc `HOME_ALERT_ACTIVE` tuỳ nhu cầu)

## 4) UX đề xuất (không formula phức tạp)

- **Title/Label**: dùng cột `TITLE`
- **Summary**: dùng cột `MESSAGE`
- **Group**: dùng `DISPLAY_GROUP`
- **Badge**: dùng `BADGE_TEXT` + `BADGE_COLOR`

Không tạo App formula phức tạp; tránh VC.

## 4.1) Operational cockpit fields (GAS-generated)

Ưu tiên hiển thị các cột UX (do GAS tính):

- `DISPLAY_TITLE`, `DISPLAY_SUBTITLE`, `DISPLAY_SUMMARY`, `DISPLAY_FOOTER`
- `DISPLAY_ICON`, `DISPLAY_COLOR`, `DISPLAY_BADGE`, `DISPLAY_ACTION_TEXT`
- `CARD_GROUP`, `CARD_SORT`

## 5) Actions (tuỳ chọn, manual-first)

### A) Operational actions (recommended)

Tạo các action (table: `HOME_ALERT`) theo hướng “data-change” (không bot/automation):

#### 1) Acknowledge

- Name: `AckAlert`
- Set:
  - `[STATUS]` = `"ACKNOWLEDGED"`
  - `[ACKNOWLEDGED_AT]` = `NOW()`
  - `[ACKNOWLEDGED_BY]` = `USEREMAIL()`
  - `[STATE_CHANGED_AT]` = `NOW()`
  - `[STATE_CHANGED_BY]` = `USEREMAIL()`
  - `[IS_ACTIVE]` = `TRUE`
  - `[IS_RESOLVED]` = `FALSE`

#### 2) Start progress

- Name: `StartProgress`
- Set:
  - `[STATUS]` = `"IN_PROGRESS"`
  - `[STATE_CHANGED_AT]` = `NOW()`
  - `[STATE_CHANGED_BY]` = `USEREMAIL()`

#### 3) Waiting response

- Name: `WaitResponse`
- Set:
  - `[STATUS]` = `"WAITING_RESPONSE"`
  - `[STATE_CHANGED_AT]` = `NOW()`
  - `[STATE_CHANGED_BY]` = `USEREMAIL()`

#### 4) Escalate

- Name: `EscalateAlert`
- Set:
  - `[STATUS]` = `"ESCALATED"`
  - `[ESCALATED_AT]` = `NOW()`
  - `[STATE_CHANGED_AT]` = `NOW()`
  - `[STATE_CHANGED_BY]` = `USEREMAIL()`

#### 5) Resolve

- Name: `ResolveAlert`
- Set:
  - `[STATUS]` = `"RESOLVED"`
  - `[IS_ACTIVE]` = `FALSE`
  - `[IS_RESOLVED]` = `TRUE`
  - `[RESOLVED_AT]` = `NOW()`
  - `[RESOLVED_BY]` = `USEREMAIL()` *(hoặc map sang internal id nếu hệ thống có)*
  - `[STATE_CHANGED_AT]` = `NOW()`
  - `[STATE_CHANGED_BY]` = `USEREMAIL()`

Ghi chú:
- Đây là thao tác manual trên Sheet; không bot/automation.
- Nếu muốn chuẩn hoá transition qua GAS (đảm bảo audit/trace chuẩn), có thể tạo action gọi webhook tới các hàm:
  - `HomeAlert_acknowledgeAlert(alertId, note)`
  - `HomeAlert_startProgress(alertId, note)`
  - `HomeAlert_waitResponse(alertId, note)`
  - `HomeAlert_escalateAlert(alertId, note)`
  - `HomeAlert_resolveAlert(alertId, note)`
  *(chỉ khi hệ thống đã có tuyến gọi GAS an toàn)*.

### B) Open Related URL (optional)

Nếu có `RELATED_RECORD_URL`, tạo action “External: go to a website”:

- Target: `[RELATED_RECORD_URL]`

## 6) Vận hành manual

- Chạy `HomeAlert_bootstrap()` một lần để tạo sheet + headers (nếu chưa có).
- Chạy `HomeAlert_refresh()` theo nhu cầu (menu / manual run).
- Nếu muốn dùng operational state runtime đầy đủ: dùng các action ACK/IN_PROGRESS/WAIT/ESCALATE/RESOLVE ở trên (không bot).
- Không tạo Bot, không tạo trigger tự động trước khi test console đạt `GO`.

## 7) Hide raw fields (Detail UX)

Trong `ALERT_Detail`, ẩn các cột raw (hoặc đánh dấu “Show?” = OFF) để chỉ để lại cột thân thiện:

- `SOURCE_HASH`
- `TRACE_ID`
- `ACTION_PAYLOAD_JSON`
- `RELATED_ENTITY_ID`

Nếu hệ thống có các cột sau thì cũng ẩn (không bắt buộc tồn tại):

- `ALERT_FINGERPRINT`
- `ALERT_GROUP_KEY`

Chỉ show các cột UX: `DISPLAY_*`, `CARD_*`, và một số field vận hành (STATUS, ASSIGNED_TO, DUE_AT, NOTE, timestamps).

