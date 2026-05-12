# AppSheet HOME_ALERT — Install Guide

**Audience:** Admin / Runtime Owner cài đặt AppSheet HOME_ALERT lần đầu hoặc khi tái cấu trúc app.  
**Phase:** DOCS-A (sau Phase 82/83/84) + **APPSHEET-REF-A** (binding reference/enum sau Phase REF-A runtime).  
**Reference:** CBV Operational Ecosystem Standard V1.  
**Tag baseline:** `v2.4.4-HOME-ALERT-SAFE-AUTOMATION` trở lên; binding reference/enum: `v2.4.6-OPERATIONAL-REFERENCE-LAYER` trở lên.

> ⚠️ App này KHÔNG dùng AppSheet Bot. Không cài automation trong AppSheet. Mọi automation thật chỉ chạy trong GAS Safe Automation Runtime (Phase 84).

---

## 1. Mục tiêu app

HOME_ALERT là **dashboard vận hành thật** cho operator/supervisor xử lý các cảnh báo (alert) sinh
ra từ TASK / FINANCE / HOSO / runtime check. Mỗi alert có:

- Trạng thái vận hành (OPEN / ACKNOWLEDGED / IN_PROGRESS / WAITING_RESPONSE / ESCALATED / RESOLVED)
- Trạng thái SLA (ON_TRACK / DUE_SOON / OVERDUE / BREACHED) + breach level
- Trạng thái escalation (NONE / SUGGESTED / ESCALATED / ACKNOWLEDGED / RESOLVED)
- Operator display contract (`OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`,
  `OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`, `OPERATOR_DASHBOARD_GROUP`, `OPERATOR_DASHBOARD_SORT`)

App phải thể hiện đúng các trường operator, không bind vào legacy column (DISPLAY_*, CARD_*, UX_*,
DESKTOP_*) trong operator deck.

---

## 2. Source spreadsheet

- Sử dụng đúng spreadsheet bound với scriptId trong `.clasp.json` (xem `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO\.clasp.json`).
- Phải chạy `HomeAlert_bootstrap()` trong GAS **trước khi** add tables vào AppSheet (để mọi cột
  manifest đã tồn tại; xem `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md`).

Nếu spreadsheet đổi (ví dụ sandbox vs production), tạo **AppSheet app riêng** thay vì rebind — KHÔNG migrate destructive.

---

## 3. Tables cần add

| Table | Vai trò | Update mode (gợi ý) |
|-------|---------|---------------------|
| `HOME_ALERT` | Bảng alert chính, operator-facing | Updates + Deletes (chỉ admin slice) |
| `HOME_ALERT_SLA_POLICY` | Registry SLA per ALERT_CODE / SEVERITY | Updates (admin only) |
| `HOME_ALERT_SLA_METRICS` | Snapshot SLA per day (read-only) | Read-only |
| `HOME_ALERT_AUTOMATION_CONFIG` | Cấu hình runner Phase 84 | Updates (admin only) |
| `HOME_ALERT_AUTOMATION_RUN_LOG` | Log run automation (append-only) | Read-only |
| `HOME_ALERT_DAILY_SNAPSHOT` | Snapshot operational mỗi ngày | Read-only |
| `TASK_MAIN` *(optional)* | Để mở record cha từ alert | Theo TASK_MAIN PRO baseline |

> AppSheet "Updates only" để tránh xóa hàng từ phía AppSheet; deletes chỉ enable trên admin slice nếu cần.

---

## 3A. Reference / Enum Binding sau REF-A (PHASE APPSHEET-REF-A)

**Mục đích:** AppSheet đọc đúng lớp reference/enum đã chuẩn hóa ở spreadsheet (REF-A), không thêm runtime GAS mới, không mở ENV-A, không bật automation mới.  
**Tài liệu chi tiết công thức:** `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §6B. **Checklist thực hiện:** `APPSHEET_REFERENCE_BINDING_CHECKLIST.md`. **Thiết kế lớp reference:** `operations/OPERATIONAL_REFERENCE_LAYER_DESIGN.md`.

### 1) Tables reference cần add vào AppSheet

| Table | Ghi chú |
|-------|---------|
| `ENUM_DICTIONARY` | Giá trị enum hợp lệ theo `ENUM_GROUP` |
| `USER_DIRECTORY` | Danh bạ người dùng / operator |
| `MASTER_CODE` | Mã chuẩn theo `MASTER_GROUP` (MODULE, ALERT, ACTION, …) |
| `DON_VI` | Đơn vị tổ chức |
| `TEAM_DIRECTORY` | Team vận hành (gắn `DON_VI_ID`) |
| `ROLE_PERMISSION_MATRIX` | Ma trận quyền (admin) |
| `FEATURE_FLAG` | Bật/tắt tính năng (admin) |
| `SYSTEM_REGISTRY` | Registry tài nguyên hệ thống (admin) |

### 2) Table mode khuyến nghị

| Table | Update mode |
|-------|-------------|
| `ENUM_DICTIONARY` | **Read-only** |
| `MASTER_CODE` | **Read-only** |
| `DON_VI` | **Read-only** hoặc **Admin-only** edit |
| `TEAM_DIRECTORY` | **Read-only** hoặc **Admin-only** edit |
| `USER_DIRECTORY` | **Read-only** hoặc **Admin-only** edit |
| `ROLE_PERMISSION_MATRIX` | **Admin-only** |
| `FEATURE_FLAG` | **Admin-only** |
| `SYSTEM_REGISTRY` | **Admin-only** |

### 3) Key / Label mapping

Trên spreadsheet REF-A, một số cột “Key chuẩn” trùng ý nghĩa với tên AppSheet sau đây; nếu sheet **chưa** có cột tên đúng, dùng cột fallback bên phải.

**ENUM_DICTIONARY**

- **Key (AppSheet):** `ENUM_ID` — map tới cột thực tế **`ID`** (chuẩn hiện tại). Nếu sau này thêm cột `ENUM_ID` riêng thì đổi Key sang cột đó.
- **Label:** `ENUM_LABEL` (fallback: `DISPLAY_TEXT`).
- **Fallback key tổng hợp (virtual column / expression):** `CONCATENATE([ENUM_GROUP], "|", IF(ISBLANK([ENUM_CODE]), [ENUM_VALUE], [ENUM_CODE]))` — `ENUM_CODE` trùng hoặc bổ sung cho `ENUM_VALUE`.

**USER_DIRECTORY**

- **Key:** `USER_ID` — map tới **`ID`** nếu chưa có cột `USER_ID` (REF-A có thể append `USER_ID`; nếu trống thì dùng `ID`).
- **Label:** `DISPLAY_NAME` với fallback: `IF(ISBLANK([DISPLAY_NAME]), [FULL_NAME], [DISPLAY_NAME])`.

**MASTER_CODE**

- **Key:** `MASTER_ID` — map tới **`ID`** nếu chưa có `MASTER_ID` điền sẵn.
- **Label:** `MASTER_LABEL` với fallback: `IF(ISBLANK([MASTER_LABEL]), IF(ISBLANK([MASTER_CODE]), [CODE], [MASTER_LABEL]), [MASTER_LABEL])` — tức ưu tiên `MASTER_LABEL`, sau đó cột alias `MASTER_CODE` (nếu có), cuối cùng `CODE`.

**DON_VI**

- **Key:** `DON_VI_ID` — map tới **`ID`** nếu `DON_VI_ID` trống.
- **Label:** `DON_VI_NAME` với fallback: `IF(ISBLANK([DON_VI_NAME]), [NAME], [DON_VI_NAME])`.

**TEAM_DIRECTORY**

- **Key:** `TEAM_ID`
- **Label:** `TEAM_NAME`

### 4) Reference binding cho `HOME_ALERT`

| Column | Binding khuyến nghị |
|--------|----------------------|
| `ASSIGNED_TO` | **Ref** → `USER_DIRECTORY` (Key `USER_ID` / `ID`; hiển thị theo label §3) |
| `CLAIMED_BY` | **Ref** → `USER_DIRECTORY` |
| `ASSIGNED_BY` | **Ref** → `USER_DIRECTORY` |
| `ESCALATED_BY` | **Ref** → `USER_DIRECTORY` |
| `RESOLVED_BY` | **Ref** → `USER_DIRECTORY` |
| `ASSIGNED_TEAM` | **Ref** → `TEAM_DIRECTORY` (`TEAM_ID`) — nếu đang lưu text legacy, dần chuyển sang Ref |
| `MODULE_CODE` | **Valid_If** hoặc **Ref** slice `MASTER_CODE` nhóm `MODULE_CODE` (xem Formula Reference §6B) |
| `ALERT_CODE` | **Valid_If** / slice `MASTER_CODE` nhóm `ALERT_CODE` |
| `ACTION_TYPE` | **Valid_If** / slice `MASTER_CODE` nhóm `ACTION_CODE` |
| `STATUS` | **Enum** từ `ENUM_DICTIONARY` nhóm `ALERT_STATUS` (hoặc Valid_If tương đương) |
| `SLA_STATUS` | **Enum** nhóm `SLA_STATUS` |
| `ESCALATION_STATUS` | **Enum** nhóm `ESCALATION_STATUS` |
| `ATTENTION_LEVEL` | **Enum** nhóm `ATTENTION_LEVEL` |

### 5) Reference binding cho `HOME_ALERT_SLA_POLICY`

| Column | Binding |
|--------|---------|
| `ALERT_CODE` | `MASTER_CODE` nhóm `ALERT_CODE` |
| `MODULE_CODE` | `MASTER_CODE` nhóm `MODULE_CODE` |
| `SEVERITY` | `ENUM_DICTIONARY` nhóm `SEVERITY` |
| `SLA_POLICY` | `MASTER_CODE` nhóm `SLA_POLICY_CODE` (hoặc enum cố định đã thỏa manifest — thống nhất một nguồn) |
| `ESCALATE_TO_TEAM` | `TEAM_DIRECTORY` |
| `ESCALATE_TO_USER` | `USER_DIRECTORY` |
| `ACTIVE` | **Yes/No** |

### 6) Reference binding cho `HOME_ALERT_AUTOMATION_CONFIG`

| Column | Binding |
|--------|---------|
| `AUTOMATION_CODE` | `MASTER_CODE` nhóm `AUTOMATION_CODE` |
| `AUTOMATION_TYPE` | `ENUM_DICTIONARY` nhóm `AUTOMATION_TYPE` |
| `ENABLED`, `SAFE_MODE`, `ALLOW_WRITE`, `ALLOW_TRIGGER_INSTALL` | **Yes/No** |
| `FUNCTION_NAME` | **Text**, read-only trong AppSheet |

### 7) Reference binding cho `TASK_MAIN` *(nếu table có trong app)*

| Column | Binding |
|--------|---------|
| `OWNER_ID` | `USER_DIRECTORY` |
| `REPORTER_ID` | `USER_DIRECTORY` |
| `DON_VI_ID` | `DON_VI` |
| `STATUS` | `ENUM_DICTIONARY` nhóm `TASK_STATUS` (nếu có) |
| `PRIORITY` | `ENUM_DICTIONARY` nhóm `PRIORITY` |

### 8) Operator dashboard contract (giữ nguyên)

- Primary header = **`OPERATOR_PRIMARY_TEXT`**
- Secondary header = **`OPERATOR_SECONDARY_TEXT`**
- Summary = **`OPERATOR_META_TEXT`**
- Next action = **`OPERATOR_NEXT_ACTION`**
- Group by = **`OPERATOR_DASHBOARD_GROUP`**
- Sort by = **`OPERATOR_DASHBOARD_SORT`** **DESC**

### 9) Cấm dùng legacy display cho operator deck

Không bind operator deck vào: `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` (chỉ dùng ngoài operator-facing nếu thật sự cần, có phê duyệt).

---

## 4. Column role / type gợi ý

### HOME_ALERT (operator-facing)

| Column | Type | Role | Note |
|--------|------|------|------|
| `ALERT_ID` | Text | KEY | Read-only |
| `ALERT_CODE` | Text | LABEL ưu tiên thứ 2 | Read-only |
| `ALERT_TYPE` | Enum | — | TASK / FINANCE / HOSO / RUNTIME |
| `SEVERITY` | Enum | — | LOW / NORMAL / HIGH / CRITICAL |
| `STATUS` | Enum | — | OPEN / ACKNOWLEDGED / IN_PROGRESS / WAITING_RESPONSE / ESCALATED / RESOLVED |
| `IS_ACTIVE` | Yes/No | — | Read-only |
| `IS_RESOLVED` | Yes/No | — | Read-only |
| `MODULE_CODE` | Ref hoặc Text + Valid_If | — | Khuyến nghị: slice `MASTER_CODE` nhóm `MODULE_CODE` |
| `RELATED_ENTITY_TYPE` | Text | — | Read-only |
| `RELATED_ENTITY_ID` | Text | Ref (nếu link TASK_MAIN) | Optional |
| `RELATED_RECORD_URL` | URL | — | Open record cha |
| `ASSIGNED_TO` | Ref | — | `USER_DIRECTORY` (Key `USER_ID` / `ID`) |
| `ASSIGNED_TEAM` | Ref hoặc Text | — | Khuyến nghị: `TEAM_DIRECTORY` (`TEAM_ID`) |
| `CREATED_AT` | DateTime | — | Read-only |
| `UPDATED_AT` | DateTime | — | Read-only |
| `DUE_AT` | DateTime | — | Read-only (set bởi nguồn) |
| `RESOLVED_AT` | DateTime | — | Read-only |
| `NOTE` | LongText | — | Operator note |
| **OPERATOR_PRIMARY_TEXT** | Text | **Primary header** | Read-only |
| **OPERATOR_SECONDARY_TEXT** | Text | **Secondary header** | Read-only |
| **OPERATOR_META_TEXT** | Text | **Summary** | Read-only |
| **OPERATOR_NEXT_ACTION** | Text | **Next action** | Read-only |
| **OPERATOR_DASHBOARD_GROUP** | Text | Group by | Read-only |
| **OPERATOR_DASHBOARD_SORT** | Text | Sort by (DESC) | Read-only |
| `SLA_POLICY` | Text | — | Read-only |
| `SLA_TARGET_MINUTES` | Number | — | Read-only |
| `SLA_DUE_AT` | DateTime | — | Read-only |
| `SLA_STATUS` | Enum | — | ON_TRACK / DUE_SOON / OVERDUE / BREACHED |
| `SLA_BREACH_LEVEL` | Number | — | 0 / 1 / 2 |
| `SLA_ELAPSED_MINUTES` | Number | — | Read-only |
| `ESCALATION_LEVEL` | Number | — | Read-only |
| `ESCALATION_STATUS` | Enum | — | NONE / SUGGESTED / ESCALATED / ACKNOWLEDGED / RESOLVED |
| `ESCALATION_REASON` | LongText | — | Read-only |
| `ESCALATED_BY` | Ref (USERS) | — | Read-only |
| `ESCALATED_TO` | Ref (USERS) | — | Read-only |
| `ESCALATION_NEXT_ACTION` | Text | — | Read-only policy hint |
| `IS_STUCK` | Yes/No | — | Read-only |
| `STUCK_REASON` | LongText | — | Read-only |
| `IS_BLOCKED` | Yes/No | — | Read-only (set bởi GAS markBlocked) |
| `BLOCKED_REASON` | LongText | — | Read-only |
| `ASSIGNMENT_QUEUE` | Text | — | Read-only (UNASSIGNED_QUEUE / MY_QUEUE / TEAM_QUEUE / ...) |
| `ESCALATED_AT` | DateTime | — | Read-only |

> Mọi trường operator runtime (`OPERATOR_*`, `SLA_*`, `ESCALATION_*`, `IS_STUCK`, `IS_BLOCKED`, …) **read-only** trong AppSheet. Việc thay đổi chúng phải đi qua GAS action.

### HOME_ALERT_SLA_POLICY

| Column | Type | Note |
|--------|------|------|
| `POLICY_ID` | Text | KEY |
| `POLICY_CODE` | Text | LABEL |
| `ALERT_CODE` | Text | — |
| `ALERT_TYPE` | Text | — |
| `MODULE_CODE` | Text | — |
| `SEVERITY` | Enum | LOW / NORMAL / HIGH / CRITICAL |
| `SLA_POLICY` | Enum | FROM_CREATED / USE_DUE_AT / NONE |
| `TARGET_MINUTES` | Number | — |
| `DUE_SOON_MINUTES` | Number | — |
| `BREACH_LEVEL_1_MINUTES` | Number | — |
| `BREACH_LEVEL_2_MINUTES` | Number | — |
| `ESCALATE_AFTER_MINUTES` | Number | — |
| `ESCALATE_TO_TEAM` | Text | — |
| `ESCALATE_TO_USER` | Ref (USERS) | — |
| `PRIORITY_WEIGHT` | Number | — |
| `ACTIVE` | Yes/No | — |
| `SORT_ORDER` | Number | — |
| `NOTE` | LongText | — |
| `CREATED_AT/CREATED_BY/UPDATED_AT/UPDATED_BY` | Audit | Read-only |
| `IS_DELETED` | Yes/No | Soft delete |

### HOME_ALERT_SLA_METRICS *(read-only)*

`METRIC_ID` (KEY), `METRIC_DATE`, `METRIC_SCOPE`, `MODULE_CODE`, `ALERT_CODE`, `POLICY_CODE`,
`ACTIVE_COUNT`, `ON_TRACK_COUNT`, `DUE_SOON_COUNT`, `OVERDUE_COUNT`, `BREACHED_COUNT`,
`ESCALATED_COUNT`, `STUCK_COUNT`, `BLOCKED_COUNT`, `AVG_ELAPSED_MINUTES`, `MAX_ELAPSED_MINUTES`,
`OPERATOR_OVERLOAD_COUNT`, `SUMMARY_JSON`, `LAST_REFRESH_AT`, `TRACE_ID`.

### HOME_ALERT_AUTOMATION_CONFIG

`CONFIG_ID` (KEY), `AUTOMATION_CODE` (LABEL), `AUTOMATION_TYPE`, `FUNCTION_NAME`, `ENABLED`,
`SAFE_MODE`, `FREQUENCY_MINUTES`, `SCHEDULE_LABEL`, `LAST_RUN_AT`, `LAST_STATUS`, `LAST_TRACE_ID`,
`LAST_ERROR`, `RUN_COUNT`, `MAX_RUNTIME_SECONDS`, `ALLOW_WRITE`, `ALLOW_NOTIFICATION`,
`ALLOW_TRIGGER_INSTALL`, `NOTE`, audit fields, `IS_DELETED`.

> Trong AppSheet, các flag `ALLOW_WRITE`, `ALLOW_NOTIFICATION`, `ALLOW_TRIGGER_INSTALL`,
> `SAFE_MODE` chỉ được edit bởi admin.

### HOME_ALERT_AUTOMATION_RUN_LOG *(read-only)*

`RUN_ID` (KEY), `AUTOMATION_CODE`, `FUNCTION_NAME`, `STARTED_AT`, `FINISHED_AT`, `DURATION_MS`,
`STATUS`, `SEVERITY`, `TRACE_ID`, `INPUT_JSON`, `OUTPUT_JSON`, `ERROR_MESSAGE`, `SAFE_MODE`,
`ALLOW_WRITE`, `RUN_BY`, `CREATED_AT`.

### HOME_ALERT_DAILY_SNAPSHOT *(read-only)*

`SNAPSHOT_ID` (KEY), `SNAPSHOT_DATE`, count columns, `TOP_ALERT_CODES_JSON`, `TOP_OPERATORS_JSON`,
`SUMMARY_TEXT`, `RECOMMENDED_ACTIONS_TEXT`, `TRACE_ID`, `CREATED_AT/BY`.

---

## 5. Key columns

| Table | Key column |
|-------|-----------|
| `HOME_ALERT` | `ALERT_ID` |
| `HOME_ALERT_SLA_POLICY` | `POLICY_ID` |
| `HOME_ALERT_SLA_METRICS` | `METRIC_ID` |
| `HOME_ALERT_AUTOMATION_CONFIG` | `CONFIG_ID` |
| `HOME_ALERT_AUTOMATION_RUN_LOG` | `RUN_ID` |
| `HOME_ALERT_DAILY_SNAPSHOT` | `SNAPSHOT_ID` |

---

## 6. Slices cần tạo

> Mọi slice operator dựa trên `IS_ACTIVE=TRUE` và `IS_DELETED ≠ TRUE`.  
> Cú pháp AppSheet — chi tiết formula xem `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`.

| Slice | Mục đích | Filter chính |
|-------|----------|--------------|
| `HOME_ALERT_ACTIVE` | Tất cả alert active | `[IS_ACTIVE] = TRUE` AND `[IS_RESOLVED] = FALSE` |
| `HOME_ALERT_MY_QUEUE` | Việc của tôi | active AND `[ASSIGNED_TO] = USEREMAIL()` (hoặc theo USER_ID map) |
| `HOME_ALERT_UNASSIGNED_QUEUE` | Chưa ai nhận | active AND `ISBLANK([ASSIGNED_TO])` |
| `HOME_ALERT_ESCALATED_QUEUE` | Đã escalated | active AND `IN([ESCALATION_STATUS], LIST("SUGGESTED","ESCALATED","ACKNOWLEDGED"))` |
| `HOME_ALERT_BLOCKED_QUEUE` | Đang block | active AND `[IS_BLOCKED] = TRUE` |
| `HOME_ALERT_OVERDUE` | SLA quá hạn | active AND `[SLA_STATUS] = "OVERDUE"` |
| `HOME_ALERT_BREACHED` | SLA vỡ | active AND `[SLA_STATUS] = "BREACHED"` |
| `HOME_ALERT_WAITING` | Đang chờ phản hồi | active AND `[STATUS] = "WAITING_RESPONSE"` |
| `HOME_ALERT_ADMIN_DEBUG` | Admin only | `USERROLE() = "Admin"` |

---

## 7. Views cần tạo

| View | Loại view | Slice nguồn | Group / Sort |
|------|-----------|-------------|--------------|
| `HOME_ALERT_OPERATOR_DASHBOARD` | Deck (primary) | `HOME_ALERT_ACTIVE` | Group: `OPERATOR_DASHBOARD_GROUP` · Sort: `OPERATOR_DASHBOARD_SORT` DESC |
| `HOME_ALERT_MY_QUEUE` | Deck | `HOME_ALERT_MY_QUEUE` | Cùng config |
| `HOME_ALERT_UNASSIGNED_QUEUE` | Deck | `HOME_ALERT_UNASSIGNED_QUEUE` | Cùng config |
| `HOME_ALERT_ESCALATED_QUEUE` | Deck | `HOME_ALERT_ESCALATED_QUEUE` | Cùng config |
| `HOME_ALERT_BLOCKED_QUEUE` | Deck | `HOME_ALERT_BLOCKED_QUEUE` | Cùng config |
| `HOME_ALERT_SLA_DASHBOARD` | Dashboard | composite (OVERDUE + BREACHED + DUE_SOON inline charts/decks) | — |
| `HOME_ALERT_DAILY_SNAPSHOT` | Table / Detail | `HOME_ALERT_DAILY_SNAPSHOT` | Sort: `SNAPSHOT_DATE` DESC |
| `HOME_ALERT_POLICY_ADMIN` | Table | `HOME_ALERT_SLA_POLICY` (admin) | Sort: `SORT_ORDER` ASC |
| `HOME_ALERT_AUTOMATION_ADMIN` | Table | `HOME_ALERT_AUTOMATION_CONFIG` (admin) | Sort: `AUTOMATION_CODE` ASC |

Detail views nên hiển thị: `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`,
`OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`, SLA fields, escalation fields, link
`RELATED_RECORD_URL`, `NOTE`.

---

## 8. Operator display mapping

| AppSheet slot | HOME_ALERT column |
|---------------|-------------------|
| Primary header | `OPERATOR_PRIMARY_TEXT` |
| Secondary header | `OPERATOR_SECONDARY_TEXT` |
| Summary | `OPERATOR_META_TEXT` |
| Next action | `OPERATOR_NEXT_ACTION` |
| Group by | `OPERATOR_DASHBOARD_GROUP` |
| Sort by | `OPERATOR_DASHBOARD_SORT` DESC |

Áp dụng cho mọi deck operator. KHÔNG đổi sang `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*`.

---

## 9. Không dùng cho operator deck

Các cột sau là **legacy / display-only**, KHÔNG bind vào operator deck:

- `DISPLAY_TITLE`, `DISPLAY_SUBTITLE`, `DISPLAY_STATUS`, `DISPLAY_BADGE`, `DISPLAY_ICON`,
  `DISPLAY_COLOR`, `DISPLAY_ACTION_TEXT`, `DISPLAY_PRIORITY_LABEL`, `DISPLAY_TIME_AGO`,
  `DISPLAY_ASSIGNEE`, `DISPLAY_SUMMARY`, `DISPLAY_FOOTER`
- `CARD_GROUP`, `CARD_SORT`, `CARD_LAYOUT`
- `UX_VISIBLE`, `UX_GROUP_ORDER`, `UX_ACTION_HINT`
- `DESKTOP_TITLE`, `DESKTOP_SUBTITLE`, `DESKTOP_PRIMARY_LINE`, `DESKTOP_SECONDARY_LINE`,
  `DESKTOP_META_LINE`, `DESKTOP_ACTION_LINE`, `DESKTOP_DETAIL_*`, `DESKTOP_GROUP`, `DESKTOP_SORT`,
  `DESKTOP_IS_OPERATOR_VIEW`

> Có thể giữ trên admin debug slice để compare khi cần, không hiển thị cho operator.

---

## 10. Format rules

Tạo các format rule trên `HOME_ALERT_ACTIVE`:

| Rule | Condition (AppSheet) | Style |
|------|----------------------|-------|
| `SLA_BREACHED` | `[SLA_STATUS] = "BREACHED"` | Background đỏ đậm, icon cảnh báo |
| `SLA_OVERDUE` | `[SLA_STATUS] = "OVERDUE"` | Background cam |
| `DUE_SOON` | `[SLA_STATUS] = "DUE_SOON"` | Background vàng |
| `BLOCKED` | `[IS_BLOCKED] = TRUE` | Border xám đậm, icon block |
| `ESCALATED` | `IN([ESCALATION_STATUS], LIST("ESCALATED","ACKNOWLEDGED"))` | Background tím / icon mũi tên lên |
| `UNASSIGNED` | `ISBLANK([ASSIGNED_TO])` | Border xanh, italic |

---

## 11. Actions nên tạo

Mỗi action operator gọi **GAS function** (qua App Action → "External" hoặc URL bot riêng bằng
webhook GAS đã có). KHÔNG dùng AppSheet Bot.

| Action | GAS function | Visibility |
|--------|--------------|------------|
| `Claim` | `HomeAlert_claimAlert(ALERT_ID, note)` | active AND `ISBLANK([ASSIGNED_TO])` |
| `Assign` | `HomeAlert_assignAlert(ALERT_ID, userId, note)` | supervisor/admin |
| `Mark Waiting` | `HomeAlert_markWaiting(ALERT_ID, note)` | assignee only |
| `Escalate` | `HomeAlert_suggestEscalations` hoặc `HomeAlert_escalateByPolicy(ALERT_ID, payload)` | assignee/supervisor |
| `Block` | `HomeAlert_markBlocked(ALERT_ID, reason)` | assignee only |
| `Resolve` | `HomeAlert_resolveAlert(ALERT_ID, note)` | assignee/supervisor |
| `Refresh snapshot` | `HomeAlertDailyOperationalSnapshot_generate()` | admin only |
| `Run safe automation manually` | `HomeAlertSafeAutomation_runOne(AUTOMATION_CODE)` hoặc `_runDue()` | admin only |

> Implement bằng "Open URL" → endpoint webhook (đã có `99_APPSHEET_WEBHOOK.js`) hoặc dùng AppSheet
> action type "Data: set values" **chỉ** cho trường note client-side rồi gọi webhook GAS thực thi.

---

## 12. Action implementation policy

- **Ưu tiên gọi GAS function/runtime** thông qua webhook đã thiết lập trong `99_APPSHEET_WEBHOOK.js`.
- **Không AppSheet Bot.** Không tạo Bot, Event, Process, Task trong AppSheet automation.
- **Không auto assign / auto resolve / auto escalate.** Mọi quyết định cần human-in-the-loop.
- Mỗi action ghi rõ confirmation (ví dụ `Confirm: "Resolve alert?"` trước khi gọi webhook) để tránh
  thao tác nhầm.
- Action chạy fail phải để alert nguyên trạng và log lỗi vào `HOME_ALERT_AUTOMATION_RUN_LOG` hoặc
  admin audit (GAS chịu trách nhiệm log, không phải AppSheet).

---

## 13. Security filter mẫu

Đặt Security filter trên **table** `HOME_ALERT` (không phải slice — để chặn từ gốc):

```
OR(
  USERROLE() = "Admin",
  USEREMAIL() = [ASSIGNED_TO],
  CONTAINS([ASSIGNED_TEAM], LOOKUP(USEREMAIL(), USERS, EMAIL, TEAM_ID)),
  IN(USERSETTINGS("Role"), LIST("Supervisor","Admin"))
)
```

Trường hợp cụ thể:

- **Operator** thấy: alert được gán cho mình OR đang trong team mình.
- **Supervisor** thấy: tất cả alert trong team(s) mình quản lý.
- **Admin** thấy tất cả.

Trên `HOME_ALERT_SLA_POLICY`, `HOME_ALERT_AUTOMATION_CONFIG`:

```
OR(
  USERROLE() = "Admin",
  USERSETTINGS("Role") = "Admin"
)
```

`HOME_ALERT_SLA_METRICS`, `HOME_ALERT_AUTOMATION_RUN_LOG`, `HOME_ALERT_DAILY_SNAPSHOT` → cho phép
supervisor + admin xem (read-only).

> Chi tiết công thức xem `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`.

---

## 14. Checklist sau khi cài

- [ ] `HomeAlert_bootstrap()` đã chạy thành công (cột manifest đầy đủ).
- [ ] 6 bảng đã add vào AppSheet (`HOME_ALERT`, `HOME_ALERT_SLA_POLICY`, `HOME_ALERT_SLA_METRICS`,
      `HOME_ALERT_AUTOMATION_CONFIG`, `HOME_ALERT_AUTOMATION_RUN_LOG`, `HOME_ALERT_DAILY_SNAPSHOT`).
- [ ] Key column từng bảng đúng theo §5.
- [ ] 9 slice ở §6 đã tạo và test với 1 sample alert.
- [ ] 9 view ở §7 đã tạo; group/sort theo `OPERATOR_DASHBOARD_GROUP` / `OPERATOR_DASHBOARD_SORT`.
- [ ] Deck/Detail bind đúng `OPERATOR_*` (không legacy).
- [ ] 6 format rule ở §10 đã active.
- [ ] 8 action ở §11 đã tạo, đều gọi GAS function, không có bot.
- [ ] Security filter §13 đã active; test với 1 user operator thật + 1 user supervisor thật.
- [ ] Không có AppSheet Bot / Event / Process nào enable.
- [ ] Operator pilot mở `HOME_ALERT_OPERATOR_DASHBOARD` và thấy đúng alert của mình.
- [ ] Admin mở `HOME_ALERT_POLICY_ADMIN` và `HOME_ALERT_AUTOMATION_ADMIN` thành công.
- [ ] Đọc `HOME_ALERT_OPERATOR_MANUAL.md` + `HOME_ALERT_SUPERVISOR_MANUAL.md` với pilot trước
      go-live.
