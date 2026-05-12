# HOME_ALERT — Desktop Operational Workspace (Phase 80D)

Tài liệu này định nghĩa **2 view tách biệt** cho HOME_ALERT trên AppSheet desktop:

1. `HOME_ALERT_OPERATOR_DASHBOARD` — operator view, chỉ DESKTOP_* + minimal ops.
2. `HOME_ALERT_ADMIN_DEBUG` — admin debug view, được phép xem raw/runtime fields.

Mục tiêu:

- 3 giây hiểu việc cần xử lý.
- Cockpit operator không có cảm giác raw database / debug view.
- Detail panel thân thiện cho người vận hành.
- Raw / debug fields chỉ tồn tại trong admin debug view, **không trộn vào operator UX**.

Tham chiếu: `CBV Operational Ecosystem Standard V1` — runtime-first, manual-first, không VC/Bot.

---

## 1) `HOME_ALERT_OPERATOR_DASHBOARD` (Operator)

Đây là cockpit chính cho người vận hành. Không hiển thị raw fields.

### 1.1 Cấu trúc

- **View type:** `Dashboard` (desktop-first).
- **Containers:**
  - Primary: `ALERT_Deck` (deck of active alerts).
  - Secondary: `ALERT_Detail` (operator-friendly detail panel).
- **For this data:** `HOME_ALERT`.
- **Show if:** áp dụng cho mọi user thuộc nhóm operator (filter theo group thật của repo).

### 1.2 Slice

Reuse `HOME_ALERT_ACTIVE` (`[IS_ACTIVE] = TRUE`).

### 1.3 `ALERT_Deck` (deck view)

- **View type:** `Deck`.
- **Source:** `HOME_ALERT_ACTIVE`.
- **Primary header:** `DESKTOP_TITLE`.
- **Secondary header:** `DESKTOP_SUBTITLE`.
- **Summary column:** `DESKTOP_PRIMARY_LINE` (ưu tiên) hoặc `DESKTOP_SECONDARY_LINE`.
- **Group by:** `DESKTOP_GROUP`.
- **Sort by:** `DESKTOP_SORT` (DESC để priority cao + cập nhật mới nổi lên trước).
- **Icon:** `DISPLAY_ICON` (đã có từ Phase 80C).

### 1.4 `ALERT_Detail` (operator-friendly)

Chỉ show các field operator-friendly. Tất cả raw / debug fields phải `Show? = OFF`.

| Show | Field | Mục đích |
|------|-------|----------|
| ✅ | `DESKTOP_DETAIL_TITLE` | Tiêu đề trong detail panel |
| ✅ | `DESKTOP_DETAIL_SUMMARY` | Mô tả tự nhiên cho operator |
| ✅ | `DESKTOP_DETAIL_CONTEXT` | Nguồn / mã liên quan |
| ✅ | `DESKTOP_DETAIL_NEXT_ACTION` | Gợi ý bước tiếp theo |
| ✅ | `STATUS` | Trạng thái thao tác |
| ✅ | `ASSIGNED_TO` | Phụ trách |
| ✅ | `DUE_AT` | Hạn xử lý |
| ✅ | `NOTE` | Ghi chú thao tác |
| ✅ | `DISPLAY_FOOTER` | Footer card (module/assignee/hint) |
| ❌ | `ALERT_ID` | raw key, ẩn |
| ❌ | `ALERT_CODE` | raw code, ẩn |
| ❌ | `ALERT_TYPE` | raw classification, ẩn |
| ❌ | `SOURCE_HASH` | dedupe hash, ẩn |
| ❌ | `TRACE_ID` | trace, ẩn |
| ❌ | `ACTION_PAYLOAD_JSON` | raw JSON, ẩn |
| ❌ | `ALERT_FINGERPRINT` | *(nếu có)* dedupe, ẩn |
| ❌ | `ALERT_GROUP_KEY` | *(nếu có)* grouping, ẩn |
| ❌ | `RELATED_ENTITY_ID` | raw ID, ẩn (operator dùng `DESKTOP_DETAIL_CONTEXT`) |
| ❌ | `LAST_ACTION` | runtime audit, ẩn |
| ❌ | `DESKTOP_DETAIL_DEBUG_VISIBLE` | flag cho debug view, ẩn |

### 1.5 Actions hiển thị

Reuse Phase 80B actions (`AckAlert`, `StartProgress`, `WaitResponse`, `EscalateAlert`, `ResolveAlert`). Operator chỉ thấy action phù hợp với `STATUS` hiện tại (dùng `Only if this condition is true` theo state machine).

### 1.6 Cấm

- Không hiển thị raw fields ở operator dashboard.
- Không dùng Virtual Column.
- Không dùng AppSheet Bot/Automation.
- Không trộn operator UX với debug schema.

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
- Các cột UX/Card/Desktop (`DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*`) — admin có thể quan sát để debug enrichment.

### 2.3 Cấm

- Không tạo Bot dựa trên view này.
- Không tạo VC để map debug ↔ operator (giữ tách biệt).
- Không cho phép operator role vào view này.

---

## 3) Vận hành & manual-first

- Sau khi append schema `DESKTOP_*` ở GAS (`HomeAlert_bootstrap()`), chạy `HomeAlert_refresh()` để enrich.
- Trên AppSheet, cấu hình 2 view ở trên theo doc; không tạo trigger.
- Khi cần debug, admin mở `HOME_ALERT_ADMIN_DEBUG`, không kéo raw fields ngược vào operator view.
- Test console: `HomeAlertDesktop_TestConsole_run()` để chốt GO/FAIL phase 80D.

## 4) Online Drive archive

- Folder online: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`.
- Script Property đề xuất: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`.
- Phase 80D chưa tự động upload; admin / runtime sẽ thêm trigger Drive export ở phase sau khi thiết kế quyền + an toàn.
