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

## 8) Desktop Operational Workspace (Phase 80D)

Tham chiếu: `CBV Operational Ecosystem Standard V1` — runtime-first, manual-first, không VC/Bot/Trigger.

Mục tiêu UX trên desktop:

- 3 giây hiểu việc cần xử lý.
- Cockpit rõ ràng, không có cảm giác raw database.
- Detail panel thân thiện cho người vận hành.

### 8.1 Schema bổ sung (GAS sinh)

Các cột vật lý được append vào `HOME_ALERT` (không thay thế `DISPLAY_*`/`CARD_*`/`UX_*` cũ):

| Cột | Mục đích |
|-----|----------|
| `DESKTOP_TITLE` | Tiêu đề chính cho deck card (icon + tên ngắn nghiệp vụ) |
| `DESKTOP_SUBTITLE` | Mô tả nghiệp vụ ngắn (đã strip prefix kỹ thuật) |
| `DESKTOP_PRIMARY_LINE` | Dòng trạng thái chính (vd: `Quá hạn 50 ngày · IN_PROGRESS`) |
| `DESKTOP_SECONDARY_LINE` | Ưu tiên + phụ trách (vd: `Ưu tiên: Medium · Phụ trách: USR_001`) |
| `DESKTOP_META_LINE` | Module / entity / thời gian cập nhật |
| `DESKTOP_ACTION_LINE` | `Việc cần làm: …` |
| `DESKTOP_DETAIL_TITLE` | Tiêu đề trong detail panel |
| `DESKTOP_DETAIL_SUMMARY` | Câu mô tả tự nhiên cho operator |
| `DESKTOP_DETAIL_CONTEXT` | Nguồn / mã liên quan |
| `DESKTOP_DETAIL_NEXT_ACTION` | Gợi ý bước tiếp theo theo state |
| `DESKTOP_DETAIL_DEBUG_VISIBLE` | Flag, mặc định `FALSE` cho operator |
| `DESKTOP_GROUP` | Group label desktop (đồng nhất với `CARD_GROUP`) |
| `DESKTOP_SORT` | Sort key desktop (`<priority 6-digit>_<YYYYMMDDHHMMSS>`) |
| `DESKTOP_IS_OPERATOR_VIEW` | Flag cờ operator-friendly view |

### 8.2 ALERT_List (operator cockpit)

> **Phase 80E (khuyến nghị):** dùng cấu hình **§9 Operator Attention** (`OPERATOR_*`, ẩn sort key) — đây là chuẩn operator mới.  
> Đoạn dưới là **baseline Phase 80D** (deck `DESKTOP_*`) nếu chưa adopt 80E.

- **View type:** `Deck`.
- **Source:** `HOME_ALERT_ACTIVE` (slice `[IS_ACTIVE] = TRUE`).
- **Primary header:** `DESKTOP_TITLE`.
- **Secondary header:** `DESKTOP_SUBTITLE`.
- **Summary column:** `DESKTOP_PRIMARY_LINE` (ưu tiên) hoặc `DESKTOP_SECONDARY_LINE`.
- **Group by:** `DESKTOP_GROUP`.
- **Sort by:** `DESKTOP_SORT` (DESC để priority cao nổi lên trước).
- **Image / Icon:** dùng `DISPLAY_ICON` (đã có sẵn từ Phase 80C).

Không tạo App formula phức tạp, không VC.

### 8.3 ALERT_Detail (operator-friendly)

Chỉ show các operator-friendly fields (mark “Show?” = ON):

- `DESKTOP_DETAIL_TITLE`
- `DESKTOP_DETAIL_SUMMARY`
- `DESKTOP_DETAIL_CONTEXT`
- `DESKTOP_DETAIL_NEXT_ACTION`
- `STATUS`
- `ASSIGNED_TO`
- `DUE_AT`
- `NOTE`
- `DISPLAY_FOOTER`

Ẩn raw / debug fields (mark “Show?” = OFF):

- `ALERT_ID`
- `ALERT_CODE`
- `ALERT_TYPE`
- `SOURCE_HASH`
- `TRACE_ID`
- `ACTION_PAYLOAD_JSON`
- `ALERT_FINGERPRINT` *(nếu hệ thống có)*
- `ALERT_GROUP_KEY` *(nếu hệ thống có)*
- `RELATED_ENTITY_ID`
- `LAST_ACTION`

Raw fields **chỉ mở cho Admin Debug view riêng** (xem `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md`).

### 8.4 Cấm

- Không dùng AppSheet Virtual Column cho desktop UX.
- Không dùng AppSheet Bot/Automation.
- Không đưa logic vào App formula phức tạp.
- Không trộn operator UX với debug schema trong cùng một view.

### 8.5 Online Drive output target

Folder online archive cho `000_SYSTEM_BRAIN`:

- URL: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- Script Property đề xuất: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- **Không upload tự động** ở phase này. Chỉ chuẩn bị cấu hình + tài liệu hóa.
- Khi cần export, dùng manual run theo runbook (chưa tạo trigger).

## 9) Operator Attention Runtime (Phase 80E)

Mục tiêu: operator **3 giây** biết việc nào cần xử lý trước; **không lộ** field kỹ thuật sort (`CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`). Các cột sort chỉ dùng trong cấu hình **Sort by** của view — **không** đặt làm Primary/Secondary/Summary/Label.

GAS: `HomeAlert_enrichAttentionFields_()` (gọi sau `DESKTOP_*` trong `HomeAlert_enrichDesktopUxFields_()`). Test: `HomeAlertAttention_TestConsole_run()`.

### 9.1 Schema bổ sung (append-only)

| Cột | Mục đích |
|-----|----------|
| `ATTENTION_LEVEL` | `CRITICAL` / `WARNING` / `WAITING` / `INFO` |
| `ATTENTION_LABEL` | Nhãn ngắn (vd: Cần xử lý ngay) |
| `ATTENTION_ICON` | Icon attention |
| `ATTENTION_COLOR` | Màu AppSheet (Red/Orange/Yellow/Blue) |
| `ATTENTION_REASON` | Lý do ngắn (vd: Task quá hạn 50 ngày) |
| `ACTION_FOCUS` | Hành động trọng tâm (vd: Nhận xử lý) |
| `ACTION_HINT` | Gợi ý thao tác (vd: Bấm Nhận xử lý hoặc…) |
| `ACTION_PRIORITY` | Số ưu tiên 0–100 (từ `PRIORITY_SCORE`) |
| `OWNER_LABEL` | Chuỗi phụ trách (vd: Phụ trách: USR_001) |
| `OWNER_QUEUE` | Queue logic (vd: TASK_QUEUE) |
| `OPERATOR_PRIMARY_TEXT` | Dòng chính deck (attention + headline) |
| `OPERATOR_SECONDARY_TEXT` | Dòng phụ (subtitle nghiệp vụ) |
| `OPERATOR_META_TEXT` | Meta một dòng (quá hạn · status · phụ trách) |
| `OPERATOR_NEXT_ACTION` | Câu “👉 …” bước tiếp theo |
| `OPERATOR_HIDE_SORT_KEYS` | `TRUE` — nhắc ẩn sort key trên UI operator |

### 9.2 `ALERT_List` — **operator view** (không lộ sort key)

**Không show** (Show? = OFF trên toàn bộ view operator; không dùng làm header/summary/label):

- `CARD_SORT`
- `DESKTOP_SORT`
- `SORT_KEY`

Các cột trên **chỉ** dùng trong **Sort by** của view (backend sort), không dùng làm title/header/summary.

**Cấu hình đề xuất (Deck):**

- **Source:** `HOME_ALERT_ACTIVE`
- **Primary header:** `OPERATOR_PRIMARY_TEXT`
- **Secondary header:** `OPERATOR_SECONDARY_TEXT`
- **Summary column:** `OPERATOR_META_TEXT`
- **Group by:** `DESKTOP_GROUP` **hoặc** `ATTENTION_LABEL`
- **Sort by:** `DESKTOP_SORT` **DESC** *(cột vẫn tồn tại trên sheet; không hiển thị trong UI)*
- **Icon (tuỳ chọn):** `ATTENTION_ICON` hoặc `DISPLAY_ICON`

### 9.3 `ALERT_Detail` — **operator view**

**Chỉ show** (Show? = ON):

- `OPERATOR_PRIMARY_TEXT`
- `OPERATOR_SECONDARY_TEXT`
- `OPERATOR_META_TEXT`
- `OPERATOR_NEXT_ACTION`
- `ATTENTION_REASON`
- `ACTION_FOCUS`
- `ACTION_HINT`
- `OWNER_LABEL`
- `STATUS`
- `DUE_AT`
- `NOTE`

**Ẩn** (Show? = OFF):

- `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`
- `ALERT_ID`, `ALERT_CODE`, `ALERT_TYPE`
- `SOURCE_HASH`, `TRACE_ID`, `ACTION_PAYLOAD_JSON`
- `ALERT_FINGERPRINT`, `ALERT_GROUP_KEY` *(nếu có)*
- `RELATED_ENTITY_ID`, `LAST_ACTION`

### 9.4 Cấm (80E)

- Không Virtual Column, không Bot, không formula phức tạp cho attention.
- Không hiển thị sort key string cho operator (chỉ sort backend).
- Raw/debug chỉ trong Admin Debug view (`HOME_ALERT_DESKTOP_WORKSPACE.md`).
