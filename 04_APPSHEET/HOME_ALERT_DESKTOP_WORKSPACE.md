# HOME_ALERT — Desktop Operational Workspace (Phase 80D + 80E + **80F**)

Tài liệu này định nghĩa **2 view tách biệt** cho HOME_ALERT trên AppSheet desktop:

1. `HOME_ALERT_OPERATOR_DASHBOARD` — operator view: **Phase 80F chuẩn cuối** — chỉ cột operator canonical trong `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` (§A–B); **không** bind `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*` vào Deck operator.
2. `HOME_ALERT_ADMIN_DEBUG` — admin debug view, được phép xem raw + legacy + enrichment.

**Chuẩn cột (Phase 80F):** `04_APPSHEET/HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` — `OPERATOR_*` là chính thức; `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` là **legacy / backward compatible / Admin Debug only**.

Mục tiêu:

- 3 giây hiểu việc cần xử lý.
- Cockpit operator không có cảm giác raw database / debug view.
- **Không lộ** `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY` trên UI operator — chỉ dùng **Sort by** backend.
- Detail panel thân thiện cho người vận hành.
- Raw / debug fields chỉ tồn tại trong admin debug view, **không trộn vào operator UX**.

Tham chiếu: `CBV Operational Ecosystem Standard V1` — runtime-first, manual-first, không VC/Bot.

---

## 1) `HOME_ALERT_OPERATOR_DASHBOARD` (Operator)

Đây là cockpit chính cho người vận hành. Không hiển thị raw fields; **Phase 80F:** bám `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` — **Group by** = `ATTENTION_LABEL`; **Sort by** = `DESKTOP_SORT` DESC (ẩn UI); không lộ `CARD_SORT` / `SORT_KEY`.

### 1.1 Cấu trúc

- **View type:** `Dashboard` (desktop-first).
- **Containers:**
  - Primary: `ALERT_Deck` (deck of active alerts).
  - Secondary: `ALERT_Detail` (operator-friendly detail panel).
- **For this data:** `HOME_ALERT`.
- **Show if:** áp dụng cho mọi user thuộc nhóm operator (filter theo group thật của repo).

### 1.2 Slice

Reuse `HOME_ALERT_ACTIVE` (`[IS_ACTIVE] = TRUE`).

### 1.3 `ALERT_Deck` (deck view) — **Phase 80F (chuẩn cuối)**

- **View type:** `Deck`.
- **Source:** `HOME_ALERT_ACTIVE`.
- **Primary header:** `OPERATOR_PRIMARY_TEXT` *(sort key **không** được dùng làm header)*.
- **Secondary header:** `OPERATOR_SECONDARY_TEXT`.
- **Summary column:** `OPERATOR_META_TEXT`.
- **Group by:** `ATTENTION_LABEL` *(chuẩn 80F; không dùng `DESKTOP_GROUP` / `CARD_GROUP` trên operator Deck)*.
- **Sort by:** `DESKTOP_SORT` **DESC** — cấu hình sort trên view; **Show? = OFF** cho `DESKTOP_SORT`, `CARD_SORT`, `SORT_KEY` (không đưa vào cột hiển thị).
- **Icon:** `ATTENTION_ICON` *(tuỳ chọn; không bắt buộc `DISPLAY_ICON` trên operator)*.

### 1.3b Legacy — Phase 80E / 80D (chỉ khi chưa adopt 80F)

- **80E tạm:** Group có thể từng dùng `DESKTOP_GROUP` hoặc `ATTENTION_LABEL` — sau 80F chỉ còn `ATTENTION_LABEL`.
- **80D baseline:** Primary `DESKTOP_TITLE`, Secondary `DESKTOP_SUBTITLE`, Summary `DESKTOP_PRIMARY_LINE`, Group `DESKTOP_GROUP`, Sort `DESKTOP_SORT` DESC — vẫn **ẩn** các cột sort khỏi mọi vùng hiển thị text (chỉ Sort by).

### 1.4 `ALERT_Detail` (operator-friendly) — **Phase 80F (chuẩn cuối)**

Chỉ show các field operator-friendly theo `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` §B. Raw / debug / **sort** fields phải `Show? = OFF`.

| Show | Field |
|------|-------|
| ✅ | `OPERATOR_PRIMARY_TEXT` |
| ✅ | `OPERATOR_SECONDARY_TEXT` |
| ✅ | `OPERATOR_META_TEXT` |
| ✅ | `OPERATOR_NEXT_ACTION` |
| ✅ | `ATTENTION_LABEL` |
| ✅ | `ATTENTION_REASON` |
| ✅ | `ACTION_FOCUS` |
| ✅ | `ACTION_HINT` |
| ✅ | `OWNER_LABEL` |
| ✅ | `STATUS` |
| ✅ | `DUE_AT` |
| ✅ | `NOTE` |

**Ẩn (bắt buộc):** `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`, `ALERT_ID`, `ALERT_CODE`, `ALERT_TYPE`, `SOURCE_HASH`, `TRACE_ID`, `ACTION_PAYLOAD_JSON`, `ALERT_FINGERPRINT`, `ALERT_GROUP_KEY`, `RELATED_ENTITY_ID`, `LAST_ACTION`, `DESKTOP_DETAIL_DEBUG_VISIBLE`, `OPERATOR_HIDE_SORT_KEYS` *(cờ nội bộ, không cần show)*.

### 1.4b Baseline Phase 80D detail (legacy)

Nếu chưa adopt 80E: dùng bảng `DESKTOP_DETAIL_*` + `DISPLAY_FOOTER` như tài liệu 80D; vẫn **ẩn** mọi sort key.

### 1.5 Actions hiển thị

Reuse Phase 80B actions (`AckAlert`, `StartProgress`, `WaitResponse`, `EscalateAlert`, `ResolveAlert`). Operator chỉ thấy action phù hợp với `STATUS` hiện tại (dùng `Only if this condition is true` theo state machine).

### 1.6 Cấm

- Không hiển thị raw fields ở operator dashboard.
- **Không hiển thị** `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY` như text/label/header — chỉ dùng **Sort by** của view.
- Không dùng Virtual Column.
- Không dùng AppSheet Bot/Automation.
- Không trộn operator UX với debug schema.

### 1.7 Checklist — tránh lộ sort key + legacy trên operator (Phase 80F)

- [ ] Đã đọc `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md`.
- [ ] Deck operator: Primary/Secondary/Summary = `OPERATOR_*` only; **Group** = `ATTENTION_LABEL`; **Sort** = `DESKTOP_SORT` DESC (hidden column).
- [ ] **Không** bind `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` (trừ sort config) vào operator Deck.
- [ ] Trong `ALERT_Deck`, **Primary / Secondary / Summary** không trỏ tới `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`.
- [ ] **Sort by** = `DESKTOP_SORT` DESC (hoặc policy sort khác), nhưng các cột sort có **Show? = OFF** trên view operator.
- [ ] Không dùng sort key trong **Show_if**, **Formatting rules** hiển thị text cho operator.
- [ ] Deck dùng `OPERATOR_PRIMARY_TEXT` / `OPERATOR_SECONDARY_TEXT` / `OPERATOR_META_TEXT` (GAS sinh).
- [ ] Detail operator dùng danh sách §1.4; sort columns ẩn.
- [ ] Chạy `HomeAlert_bootstrap()` + `HomeAlertDisplayStandard_TestConsole_run()` để chốt chuẩn 80F.

**Nguyên tắc:** sort key chỉ để **sắp xếp hàng**, không dùng làm title/header/summary cho operator.

---

## 2) `HOME_ALERT_ADMIN_DEBUG` (Admin only)

View riêng cho admin / kỹ sư runtime. Đây là nơi duy nhất được phép xem raw / debug fields.

### 2.1 Cấu trúc

- **View type:** `Table` hoặc `Detail` (admin chọn).
- **For this data:** `HOME_ALERT` (KHÔNG dùng slice operator).
- **Show if:** chỉ admin (dùng `USERROLE() = "ADMIN"` hoặc field role thật của repo).
- **Position:** menu bên (không trộn vào dashboard operator).

### 2.2 Fields hiển thị (admin debug)

Tất cả fields raw / runtime / state đều được phép `Show? = ON`:

- `ALERT_ID`, `ALERT_CODE`, `ALERT_TYPE`, `SEVERITY`, `PRIORITY_SCORE`
- `TITLE`, `MESSAGE`, `MODULE_CODE`
- `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID`, `RELATED_RECORD_URL`
- `ACTION_LABEL`, `ACTION_TYPE`, `ACTION_PAYLOAD_JSON`
- `STATUS`, `IS_ACTIVE`, `IS_RESOLVED`
- `CREATED_AT`, `UPDATED_AT`, `DUE_AT`, `EXPIRES_AT`
- `ASSIGNED_TO`, `SORT_KEY`, `DISPLAY_GROUP`, `BADGE_TEXT`, `BADGE_COLOR`
- `TRACE_ID`, `SOURCE_HASH`, `LAST_ACTION`
- `RESOLVED_AT`, `RESOLVED_BY`, `NOTE`
- `ACKNOWLEDGED_AT`, `ACKNOWLEDGED_BY`
- `STATE_CHANGED_AT`, `STATE_CHANGED_BY`
- `ESCALATED_AT`, `AUTO_CLEARED_AT`, `AUTO_CLEARED_BY`
- Các cột UX/Card/Desktop/Attention/Operator (`DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*`, `ATTENTION_*`, `ACTION_FOCUS`, `ACTION_HINT`, `ACTION_PRIORITY`, `OWNER_*`, `OPERATOR_*`) — admin quan sát để debug enrichment.
- Phase 81 — điều phối: `ASSIGNMENT_*`, `QUEUE_*`, `WORKLOAD_KEY`, `OPERATOR_DASHBOARD_*`, `CLAIMED_*`, `LAST_OPERATOR_ACTION*`, `IS_BLOCKED`, `BLOCKED_REASON`, v.v.

### 2.3 Cấm

- Không tạo Bot dựa trên view này.
- Không tạo VC để map debug ↔ operator (giữ tách biệt).
- Không cho phép operator role vào view này.

---

## 3) Vận hành & manual-first

- Sau khi append schema `DESKTOP_*` / `OPERATOR_*` ở GAS (`HomeAlert_bootstrap()`), chạy `HomeAlert_refresh()` để enrich.
- Trên AppSheet, cấu hình 2 view ở trên theo doc; không tạo trigger.
- Khi cần debug, admin mở `HOME_ALERT_ADMIN_DEBUG`, không kéo raw fields ngược vào operator view.
- Test console: `HomeAlertDesktop_TestConsole_run()` (80D), `HomeAlertAttention_TestConsole_run()` (80E), `HomeAlertDisplayStandard_TestConsole_run()` (80F).

## 4) Operational coordination (Phase 81)

Tham chiếu: `HOME_ALERT_ASSIGNMENT_RUNTIME_STANDARD.md`.

### 4.1 `HOME_ALERT_OPERATOR_DASHBOARD` (coordination mode)

Song song với chế độ **attention (80F)** (`ATTENTION_LABEL` + `DESKTOP_SORT`), có thể bật **coordination Deck**:

- **Primary:** `OPERATOR_PRIMARY_TEXT`  
- **Secondary:** `OPERATOR_SECONDARY_TEXT`  
- **Summary:** `OPERATOR_META_TEXT`  
- **Group by:** `OPERATOR_DASHBOARD_GROUP`  
- **Sort by:** `OPERATOR_DASHBOARD_SORT` **DESC** (cột sort — **Show? = OFF** nếu không muốn lộ số composite)

Không dùng AppSheet formula để tính workload hay queue; toàn bộ từ GAS.

### 4.2 Queue views

Tạo slice theo cột vật lý GAS đã enrich (`ASSIGNMENT_QUEUE`, `IS_BLOCKED`, `STATUS`, …) cho các view:

- `HOME_ALERT_MY_QUEUE`, `HOME_ALERT_UNASSIGNED_QUEUE`, `HOME_ALERT_ESCALATED_QUEUE`, `HOME_ALERT_BLOCKED_QUEUE` (định nghĩa trong `HOME_ALERT_APPSHEET_SETUP.md` §11).

### 4.3 `HOME_ALERT_WORKLOAD_DASHBOARD`

- **Source:** `HOME_ALERT_WORKLOAD`.  
- **Refresh:** manual chạy `HomeAlertWorkload_refresh()` (menu / script editor).  
- Không trigger production trong phase này.

### 4.4 Test

- `HomeAlertAssignment_TestConsole_run()` — schema assignment + workload + action probes + regression 80B/80E/80F.

## 5) Online Drive archive

- Folder online: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`.
- Script Property đề xuất: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`.
- Phase 80D chưa tự động upload; admin / runtime sẽ thêm trigger Drive export ở phase sau khi thiết kế quyền + an toàn.
