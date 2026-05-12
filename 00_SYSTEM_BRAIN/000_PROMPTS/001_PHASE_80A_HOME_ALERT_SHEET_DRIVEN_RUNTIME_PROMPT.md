## PHASE 80A — HOME_ALERT_SHEET_DRIVEN_RUNTIME (PROMPT LOG)

Bạn đang làm việc trong repo `CBV_SSA_LAOCONG_PRO`, branch hiện tại của TASK+FIN.

Áp dụng tuyệt đối CBV Operational Ecosystem Standard V1: runtime-first, memory-first, append-only, manual-first → auto-later.

## MỤC TIÊU

Xây runtime HOME_ALERT cho AppSheet theo chuẩn:

- GAS tính toán  
- Google Sheet lưu dữ liệu thật  
- AppSheet chỉ hiển thị và bấm thao tác  
- Không dùng Virtual Column  
- Hạn chế tối đa App formula  
- Không dùng AppSheet Bot/Automation

## PHẠM VI

Tạo màn hình cảnh báo vận hành cho AppSheet, gom alert từ:

- TASK_MAIN
- FINANCE_TRANSACTION
- TASK_UPDATE_LOG
- FINANCE_LOG
- CBV_TEST_REPORT nếu đã có
- runtime health/test console nếu đã có

## YÊU CẦU BẮT BUỘC

### 1) Lưu prompt

Lưu prompt này vào `00_SYSTEM_BRAIN/000_PROMPTS/` theo tên file:

- `0xx_PHASE_80A_HOME_ALERT_SHEET_DRIVEN_RUNTIME_PROMPT.md`

Không ghi đè file cũ.

### 2) Tạo/đảm bảo bảng vật lý HOME_ALERT

Tạo sheet/bảng thật, không dùng Virtual Column.

Cột tối thiểu:

- ALERT_ID
- ALERT_CODE
- ALERT_TYPE
- SEVERITY
- PRIORITY_SCORE
- TITLE
- MESSAGE
- MODULE_CODE
- RELATED_ENTITY_TYPE
- RELATED_ENTITY_ID
- RELATED_RECORD_URL
- ACTION_LABEL
- ACTION_TYPE
- ACTION_PAYLOAD_JSON
- STATUS
- IS_ACTIVE
- IS_RESOLVED
- CREATED_AT
- UPDATED_AT
- DUE_AT
- ASSIGNED_TO
- SORT_KEY
- DISPLAY_GROUP
- BADGE_TEXT
- BADGE_COLOR
- TRACE_ID
- SOURCE_HASH
- RESOLVED_AT
- RESOLVED_BY
- NOTE

### 3) GAS runtime

Tạo các hàm tối thiểu:

- `HomeAlert_bootstrap()`
- `HomeAlert_refresh()`
- `HomeAlert_generateFromTask_()`
- `HomeAlert_generateFromFinance_()`
- `HomeAlert_upsertAlert_()`
- `HomeAlert_resolveAlert(alertId, note)`
- `HomeAlert_healthCheck()`
- `HomeAlert_selfTest()`

Yêu cầu:

- idempotent
- append-only log nếu có log sheet
- không xóa alert cũ; chỉ update trạng thái
- có `SOURCE_HASH` để chống trùng alert
- có `TRACE_ID` cho mỗi lượt refresh
- không auto-trigger trước khi test GO

### 4) AppSheet support

Tạo tài liệu hướng dẫn AppSheet:

- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`

Nội dung gồm:

- bảng cần add: HOME_ALERT
- view đề xuất: HOME_ALERT_Dashboard, ALERT_List, ALERT_Detail
- slice đơn giản: IS_ACTIVE = TRUE
- không VC
- không Bot
- không App formula phức tạp
- cách sort theo PRIORITY_SCORE, SORT_KEY
- cách gắn action nếu cần

### 5) Test Console riêng

Tạo Test Console riêng cho HOME_ALERT, không trộn vào business menu.

Cần có:

- `HomeAlert_TestConsole_run()`
- `HomeAlert_TestConsole_showReport()`
- `HomeAlert_TestConsole_copyAiHandoff()`

Report contract:

```json
{
  "ok": true,
  "phase": "PHASE_80A_HOME_ALERT_SHEET_DRIVEN_RUNTIME",
  "status": "GO | GO_WITH_WARNINGS | FAIL",
  "severity": "OK | WARNING | ERROR | CRITICAL",
  "checkedAt": "",
  "runBy": "",
  "traceId": "",
  "testSuite": "HOME_ALERT_RUNTIME",
  "summary": "",
  "checks": [],
  "warnings": [],
  "errors": [],
  "nextStep": "",
  "reportText": "",
  "reportJson": {},
  "contractVersion": "CBV_TEST_CONSOLE_V1"
}
```

### 6) Report append-only

Khi kết thúc, tạo report mới trong `00_SYSTEM_BRAIN/000_REPORTS/`:

- `0xx_PHASE_80A_HOME_ALERT_SHEET_DRIVEN_RUNTIME_REPORT.md`

Không overwrite report cũ.

### 7) AI handoff

Tạo handoff mới:

- `00_SYSTEM_BRAIN/001_HANDOFF/0xx_PHASE_80A_HOME_ALERT_HANDOFF.md`

Gồm:

- files created
- files updated
- test result
- warnings
- next step
- production readiness
- do not change
- AI handoff summary

## KHÔNG ĐƯỢC LÀM

- Không dùng Virtual Column.
- Không tạo AppSheet Bot.
- Không đưa logic alert vào AppSheet.
- Không auto-post TASK sang FIN.
- Không tự tạo production trigger nếu chưa có test GO.
- Không xóa/overwrite prompt/report/audit cũ.
- Không đổi schema TASK/FIN nếu không cần.
- Không merge test runtime vào business runtime.

