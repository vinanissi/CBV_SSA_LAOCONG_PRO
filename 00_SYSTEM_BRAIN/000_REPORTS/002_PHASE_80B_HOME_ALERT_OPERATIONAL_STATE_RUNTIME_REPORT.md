## PHASE 80B — HOME_ALERT_OPERATIONAL_STATE_RUNTIME (REPORT)

### Goal

Nâng `HOME_ALERT` từ bảng hiển thị cảnh báo (80A) lên **Operational State Runtime** với vòng đời:

```txt
OPEN
ACKNOWLEDGED
IN_PROGRESS
WAITING_RESPONSE
ESCALATED
RESOLVED
AUTO_CLEARED
EXPIRED
```

### Decisions (manual-first, append-only)

- **State machine**: định nghĩa transition hợp lệ, chặn transition sai.
- **Manual-first refresh**: `HomeAlert_refresh()` chỉ cập nhật “computed fields” (TITLE/MESSAGE/SEVERITY/PRIORITY_SCORE/…) và **không đè** `STATUS` nếu alert đã chuyển sang trạng thái vận hành (ACK/IN_PROGRESS/WAITING/ESCALATED/RESOLVED/...).
- **Append-only**: không xoá alert; cập nhật trạng thái và timestamps/actors.
- **Auto-later**: `AUTO_CLEARED` và `EXPIRED` có hàm hỗ trợ nhưng mặc định **không bật** trong refresh (options).

### Schema changes (append-only columns)

Thêm các cột operational vào `HOME_ALERT` (append cuối bảng, không phá dữ liệu cũ):

- `ACKNOWLEDGED_AT`, `ACKNOWLEDGED_BY`
- `STATE_CHANGED_AT`, `STATE_CHANGED_BY`
- `ESCALATED_AT`
- `EXPIRES_AT`
- `AUTO_CLEARED_AT`, `AUTO_CLEARED_BY`
- `LAST_ACTION`

### Runtime changes

- **Refresh options**:
  - `HomeAlert_refresh({ autoClearMissing: false, autoExpire: false })` (default manual-first)
- **Operational transitions** (GAS functions):
  - `HomeAlert_acknowledgeAlert(alertId, note)`
  - `HomeAlert_startProgress(alertId, note)`
  - `HomeAlert_waitResponse(alertId, note)`
  - `HomeAlert_escalateAlert(alertId, note)`
  - `HomeAlert_resolveAlert(alertId, note)`
  - `HomeAlert_autoClearAlert(alertId, note)`
  - `HomeAlert_expireAlert(alertId, note)`
- **Validation**:
  - `HomeAlert_validateStateMachine_()` trong `HomeAlert_selfTest()`

### AppSheet guidance update

AppSheet dùng các action kiểu “data-change” để chuyển trạng thái, không bot/automation, không VC.
Chi tiết: `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`.

### Test result

- **NOT RUN (local)** — cần chạy trong GAS/Spreadsheet:
  - `HomeAlert_TestConsole_run()`

### Warnings

- Nếu bật `autoClearMissing` / `autoExpire` cần vận hành cẩn thận; hiện mặc định tắt để đảm bảo manual-first.

### Next step

- Chạy `HomeAlert_bootstrap()` để appends các cột mới.
- Chạy `HomeAlert_TestConsole_run()` để lấy report GO/FAIL cho phase 80B.
- Cập nhật AppSheet actions ACK/IN_PROGRESS/WAIT/ESCALATE/RESOLVE theo doc.

