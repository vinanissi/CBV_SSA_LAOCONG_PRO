# AppSheet HOME_ALERT — Formula Reference

**Audience:** Admin AppSheet cài đặt slice / format rule / security filter / show_if.  
**Phase reference:** DOCS-A.  
**Pair with:** `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`.

> Tất cả công thức bên dưới là **AppSheet expression** (KHÔNG phải Google Sheets formula). Không
> dùng dấu `;` kiểu locale VN/EU — AppSheet luôn dùng `,` để tách tham số. Xem §7 "Lưu ý locale".

---

## 1. Slice formulas

### `HOME_ALERT_ACTIVE`

Filter:
```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE
)
```

### `HOME_ALERT_MY_QUEUE`

Filter (theo email AppSheet):
```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  OR(
    [ASSIGNED_TO] = USEREMAIL(),
    [ASSIGNED_TO] = LOOKUP(USEREMAIL(), "USERS", "EMAIL", "USER_ID")
  )
)
```

> Nếu `ASSIGNED_TO` lưu `USER_ID` chứ không phải email, dùng dòng `LOOKUP(...)`. Nếu lưu email,
> dòng `=USEREMAIL()` là đủ.

### `HOME_ALERT_UNASSIGNED_QUEUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  ISBLANK([ASSIGNED_TO])
)
```

### `HOME_ALERT_ESCALATED_QUEUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  IN([ESCALATION_STATUS], LIST("SUGGESTED", "ESCALATED", "ACKNOWLEDGED"))
)
```

### `HOME_ALERT_BLOCKED_QUEUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [IS_BLOCKED] = TRUE
)
```

### `HOME_ALERT_OVERDUE`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [SLA_STATUS] = "OVERDUE"
)
```

### `HOME_ALERT_BREACHED`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [SLA_STATUS] = "BREACHED"
)
```

### `HOME_ALERT_WAITING`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [STATUS] = "WAITING_RESPONSE"
)
```

### `HOME_ALERT_ADMIN_DEBUG`

```
OR(
  USERROLE() = "Admin",
  USERSETTINGS("Role") = "Admin"
)
```

---

## 2. Format rule formulas

Áp dụng trên slice `HOME_ALERT_ACTIVE` (hoặc trực tiếp trên table với guard active):

### `SLA_BREACHED`

Condition:
```
[SLA_STATUS] = "BREACHED"
```
Suggested style: background = đỏ đậm, text color trắng, icon `error`.

### `SLA_OVERDUE`

Condition:
```
[SLA_STATUS] = "OVERDUE"
```
Suggested style: background = cam, icon `schedule`.

### `DUE_SOON`

Condition:
```
[SLA_STATUS] = "DUE_SOON"
```
Suggested style: background = vàng nhạt, icon `hourglass_empty`.

### `BLOCKED`

Condition:
```
[IS_BLOCKED] = TRUE
```
Suggested style: border xám đậm, icon `block`.

### `ESCALATED`

Condition:
```
IN([ESCALATION_STATUS], LIST("ESCALATED", "ACKNOWLEDGED"))
```
Suggested style: background = tím nhạt, icon `trending_up`.

### `UNASSIGNED`

Condition:
```
ISBLANK([ASSIGNED_TO])
```
Suggested style: italic, border xanh dương, icon `person_add`.

---

## 3. Security filter formulas

### `HOME_ALERT` (row-level)

```
OR(
  USERROLE() = "Admin",
  USERSETTINGS("Role") = "Admin",
  [ASSIGNED_TO] = USEREMAIL(),
  [ASSIGNED_TO] = LOOKUP(USEREMAIL(), "USERS", "EMAIL", "USER_ID"),
  CONTAINS(
    [ASSIGNED_TEAM],
    LOOKUP(USEREMAIL(), "USERS", "EMAIL", "TEAM_ID")
  ),
  IN(USERSETTINGS("Role"), LIST("Supervisor", "Admin"))
)
```

> Thay đổi `USERS` / `EMAIL` / `USER_ID` / `TEAM_ID` cho khớp bảng users thực tế của bạn.

### `HOME_ALERT_SLA_POLICY` & `HOME_ALERT_AUTOMATION_CONFIG` (admin only)

```
OR(
  USERROLE() = "Admin",
  USERSETTINGS("Role") = "Admin"
)
```

### `HOME_ALERT_SLA_METRICS`, `HOME_ALERT_AUTOMATION_RUN_LOG`, `HOME_ALERT_DAILY_SNAPSHOT` (supervisor + admin)

```
OR(
  USERROLE() = "Admin",
  IN(USERSETTINGS("Role"), LIST("Supervisor", "Admin"))
)
```

---

## 4. Show_If formulas (Actions)

Mục đích: ẩn action khi không hợp lệ. KHÔNG dùng để bảo mật — bảo mật làm bằng security filter.

### `Claim`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  ISBLANK([ASSIGNED_TO])
)
```

### `Assign` (supervisor/admin)

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  IN(USERSETTINGS("Role"), LIST("Supervisor", "Admin"))
)
```

### `Mark Waiting`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [STATUS] <> "WAITING_RESPONSE",
  OR(
    [ASSIGNED_TO] = USEREMAIL(),
    IN(USERSETTINGS("Role"), LIST("Supervisor", "Admin"))
  )
)
```

### `Block`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  [IS_BLOCKED] <> TRUE,
  OR(
    [ASSIGNED_TO] = USEREMAIL(),
    IN(USERSETTINGS("Role"), LIST("Supervisor", "Admin"))
  )
)
```

### `Escalate`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  NOT(IN([ESCALATION_STATUS], LIST("ESCALATED", "ACKNOWLEDGED")))
)
```

### `Resolve`

```
AND(
  [IS_ACTIVE] = TRUE,
  [IS_RESOLVED] = FALSE,
  OR(
    [ASSIGNED_TO] = USEREMAIL(),
    IN(USERSETTINGS("Role"), LIST("Supervisor", "Admin"))
  )
)
```

### `Refresh snapshot` (admin only)

```
OR(
  USERROLE() = "Admin",
  USERSETTINGS("Role") = "Admin"
)
```

### `Run safe automation manually` (admin only)

```
OR(
  USERROLE() = "Admin",
  USERSETTINGS("Role") = "Admin"
)
```

---

## 5. Sort/group mapping

| View | Group By | Sort By | Direction |
|------|----------|---------|-----------|
| `HOME_ALERT_OPERATOR_DASHBOARD` | `OPERATOR_DASHBOARD_GROUP` | `OPERATOR_DASHBOARD_SORT` | DESC |
| `HOME_ALERT_MY_QUEUE` | `OPERATOR_DASHBOARD_GROUP` | `OPERATOR_DASHBOARD_SORT` | DESC |
| `HOME_ALERT_UNASSIGNED_QUEUE` | `MODULE_CODE` | `OPERATOR_DASHBOARD_SORT` | DESC |
| `HOME_ALERT_ESCALATED_QUEUE` | `ESCALATION_STATUS` | `SLA_BREACH_LEVEL` | DESC |
| `HOME_ALERT_BLOCKED_QUEUE` | `MODULE_CODE` | `UPDATED_AT` | DESC |
| `HOME_ALERT_SLA_DASHBOARD` | `SLA_STATUS` | `SLA_ELAPSED_MINUTES` | DESC |
| `HOME_ALERT_DAILY_SNAPSHOT` | (none) | `SNAPSHOT_DATE` | DESC |
| `HOME_ALERT_POLICY_ADMIN` | `MODULE_CODE` | `SORT_ORDER` | ASC |
| `HOME_ALERT_AUTOMATION_ADMIN` | (none) | `AUTOMATION_CODE` | ASC |

> Operator deck PHẢI dùng `OPERATOR_DASHBOARD_GROUP` + `OPERATOR_DASHBOARD_SORT`. Đây là contract
> đã lock từ Phase 82. KHÔNG đổi sang `DESKTOP_SORT` / `ATTENTION_LABEL`.

---

## 6. Header / detail mapping (operator)

Deck/Detail/Card view operator dùng đúng:

| AppSheet slot | Column |
|---------------|--------|
| Primary header | `OPERATOR_PRIMARY_TEXT` |
| Secondary header | `OPERATOR_SECONDARY_TEXT` |
| Summary | `OPERATOR_META_TEXT` |
| Next action | `OPERATOR_NEXT_ACTION` |
| Tap action (deck) | View Detail |

Đối với view Detail, có thể bổ sung các nhóm:

- **SLA**: `SLA_STATUS`, `SLA_DUE_AT`, `SLA_TARGET_MINUTES`, `SLA_ELAPSED_MINUTES`,
  `SLA_BREACH_LEVEL`.
- **Escalation**: `ESCALATION_STATUS`, `ESCALATION_LEVEL`, `ESCALATION_REASON`, `ESCALATED_BY`,
  `ESCALATED_TO`, `ESCALATION_NEXT_ACTION`.
- **Assignment**: `ASSIGNED_TO`, `ASSIGNED_TEAM`, `CLAIMED_AT`, `CLAIMED_BY`,
  `LAST_OPERATOR_ACTION`, `LAST_OPERATOR_ACTION_AT`.
- **Link**: `RELATED_RECORD_URL`, `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID`.
- **Note**: `NOTE`, `BLOCKED_REASON`, `STUCK_REASON`.

---

## 7. Lưu ý locale

- **Google Sheets:** nếu spreadsheet locale là VN/EU thì các công thức **Google Sheets** dùng `;`
  (ví dụ `=IF(A1>0; "ok"; "no")`). Đây là formula **trên sheet**, KHÔNG phải AppSheet.
- **AppSheet expression:** **luôn dùng `,`** bất kể locale spreadsheet.
  - Đúng: `IF([SLA_STATUS] = "BREACHED", "URGENT", "OK")`
  - Sai: `IF([SLA_STATUS] = "BREACHED"; "URGENT"; "OK")`
- **Mixing rule:** Không copy công thức Google Sheets vào AppSheet expression rồi đổi dấu phẩy
  ngược lại. Đọc context: AppSheet expression có dấu `[Column]`, không có ô `A1`.

---

## 8. Anti-patterns (tránh)

- ❌ Dùng `LOOKUP(..., FIRST(SELECT(...)))` cho security filter — chậm và lệch ngữ cảnh
  (xem `task-main-pro-production-baseline` rule: phải dùng `ANY(SELECT(...))` cho row-level
  security/filter, không `FIRST`).
- ❌ Bind operator deck vào `DESKTOP_*` / `DISPLAY_*`.
- ❌ Tạo Bot tự động thay đổi `STATUS`, `ASSIGNED_TO`, `ESCALATION_STATUS`, `IS_BLOCKED`.
- ❌ Cho operator quyền edit `SLA_*`, `ESCALATION_*`, `OPERATOR_*`, `IS_STUCK`.
- ❌ Để `Delete` action visible cho operator/supervisor.
- ❌ Cho phép sửa `HOME_ALERT_AUTOMATION_CONFIG.ALLOW_TRIGGER_INSTALL` mà không qua admin review.
