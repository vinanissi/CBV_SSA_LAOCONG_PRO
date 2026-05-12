## PHASE 80A — HOME_ALERT_SHEET_DRIVEN_RUNTIME (REPORT)

### Scope

- Sheet-driven runtime cho `HOME_ALERT` (GAS compute → Sheet store → AppSheet display/action)
- Không Virtual Column, không Bot/Automation, hạn chế app formula

### Decisions (runtime-first)

- **Data truth**: `HOME_ALERT` là bảng vật lý trong Google Sheet.
- **Dedupe**: `SOURCE_HASH` (SHA-256 của `sourceKey`) + `ALERT_ID = HAL_<hashPrefix>` để idempotent upsert.
- **Traceability**: mỗi `HomeAlert_refresh()` sinh `TRACE_ID` mới và ghi vào từng alert upsert.
- **Append-only log**: dùng `ADMIN_AUDIT_LOG` qua `logAdminAudit()` cho các sự kiện: BOOTSTRAP / REFRESH / RESOLVE.
- **No delete**: runtime không xoá alert; chỉ INSERT mới hoặc UPDATE trạng thái/fields.

### What was implemented

- **Schema**
  - Thêm `HOME_ALERT` vào `CBV_SCHEMA_MANIFEST` (headers đúng thứ tự yêu cầu).
  - Thêm `HOME_ALERT` vào `CBV_AUDIT_SCHEMA` để self-audit có thể kiểm tra cột tối thiểu.
- **GAS runtime**
  - `HomeAlert_bootstrap()`: ensure sheet `HOME_ALERT` tồn tại + headers.
  - `HomeAlert_refresh()`: generate alerts từ TASK/FINANCE/LOGS và upsert vào sheet.
  - `HomeAlert_generateFromTask_()`: rule `TASK_OVERDUE` (task quá hạn).
  - `HomeAlert_generateFromFinance_()`: rule `FIN_UNCONFIRMED_OLD` (finance NEW quá lâu).
  - `HomeAlert_generateFromLogs_()`: rule log note contains ERROR/EXCEPTION/FAILED/CRITICAL (cửa sổ 3 ngày).
  - `HomeAlert_upsertAlert_()`: update theo `ALERT_ID` (deterministic từ hash).
  - `HomeAlert_resolveAlert(alertId, note)`: resolve + audit.
  - `HomeAlert_healthCheck()`: kiểm tra dependency sheet tồn tại.
  - `HomeAlert_selfTest()`: chạy health/bootstrap/refresh và trả report contract `CBV_TEST_CONSOLE_V1`.
- **Test console**
  - `HomeAlert_TestConsole_run()`
  - `HomeAlert_TestConsole_showReport()`
  - `HomeAlert_TestConsole_copyAiHandoff()`
- **AppSheet doc**
  - `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` (bảng, slice, views, sort, actions manual-first)

### Manual test procedure (operator)

Trong Google Apps Script (bound với Spreadsheet):

1) Chạy `HomeAlert_bootstrap()` (1 lần) để tạo `HOME_ALERT`.
2) Chạy `HomeAlert_TestConsole_run()`.
3) Kiểm tra `HOME_ALERT` có row mới khi có điều kiện alert.
4) Thử resolve: `HomeAlert_resolveAlert('<ALERT_ID>', 'manual resolve')`.

### Test result

- **Runtime unit/self-test**: CHƯA chạy trong repo local (cần môi trường GAS + Spreadsheet).
- **Kỳ vọng**: `HomeAlert_TestConsole_run()` trả `status=GO` nếu đủ sheet dependencies và runtime không throw.

### Warnings

- Refresh hiện **không tự deactivate** alert cũ khi điều kiện không còn đúng (để giữ “manual-first” và tránh thay đổi trạng thái ngoài ý muốn). Operator resolve thủ công qua action hoặc hàm resolve.
- `RELATED_RECORD_URL` đang để trống vì repo không có chuẩn URL deep-link chung cho Task/Finance trong scope phase này.

### Next step

- Chạy test console trong GAS và ghi kết quả GO/FAIL vào lần report tiếp theo.
- Thiết lập AppSheet: add table + slice + views + action resolve theo doc.

