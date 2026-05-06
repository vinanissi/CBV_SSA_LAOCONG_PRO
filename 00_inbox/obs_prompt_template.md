##obs_prompt_template
Bạn là Senior Google Apps Script Architect cho hệ CBV_SSA_LAOCONG_PRO.

MỤC TIÊU:
Triển khai Local Observability Layer cho một module bất kỳ, gọi là MODULE_OBS.

Module hiện tại cần triển khai:
MODULE_CODE = "<ĐIỀN_MODULE_CODE>"
Ví dụ:
- HO_SO
- TASK
- FINANCE
- INVOICE_MEMBER

NGUYÊN TẮC KIẾN TRÚC:
1. Mỗi module có OBS riêng.
2. MAIN_CONTROL không ôm log/test/audit chi tiết của module.
3. MAIN_CONTROL chỉ nhận summary/finding nghiêm trọng khi cần.
4. MODULE_OBS phải tự:
   - health check
   - self test
   - ghi finding
   - ghi audit
   - ghi event trace
   - ghi runtime metric
   - xuất AI diagnostic export
5. Add-only, idempotent, không phá nghiệp vụ cũ.
6. Không rename hàm cũ.
7. Không xóa sheet/cột cũ.
8. Không hardcode DB ID.
9. Không phụ thuộc MAIN_CONTROL để module tự test local.
10. Nếu có connection package thì dùng, nếu không có thì vẫn chạy local OBS được.

CÁC SHEET CẦN TẠO TRONG DB MODULE:

1. <MODULE_PREFIX>_OBS_HEALTH

Headers:
HEALTH_ID
MODULE_CODE
CHECK_CODE
STATUS
SEVERITY
MESSAGE
DATA_JSON
CHECKED_AT
CHECKED_BY

2. <MODULE_PREFIX>_OBS_TEST_RUN

Headers:
RUN_ID
MODULE_CODE
RUN_TYPE
STATUS
TOTAL_TESTS
PASSED
WARNED
FAILED
BLOCKED
STARTED_AT
FINISHED_AT
DURATION_MS
TRIGGERED_BY
SUMMARY_JSON
NOTE

3. <MODULE_PREFIX>_OBS_TEST_RESULT

Headers:
RESULT_ID
RUN_ID
MODULE_CODE
TEST_CODE
TEST_NAME
STATUS
SEVERITY
MESSAGE
EXPECTED
ACTUAL
DATA_JSON
ERROR_CODE
ERROR_MESSAGE
STARTED_AT
FINISHED_AT
DURATION_MS

4. <MODULE_PREFIX>_OBS_FINDING

Headers:
FINDING_ID
RUN_ID
MODULE_CODE
SOURCE_TYPE
SOURCE_CODE
SEVERITY
STATUS
MESSAGE
ACTION_REQUIRED
OWNER
IS_RESOLVED
RESOLVED_AT
RESOLVED_BY
DATA_JSON
CREATED_AT
UPDATED_AT
NOTE

5. <MODULE_PREFIX>_OBS_AUDIT

Headers:
AUDIT_ID
MODULE_CODE
ENTITY_TYPE
ENTITY_ID
ACTION
FIELD_NAME
OLD_VALUE
NEW_VALUE
ACTOR_EMAIL
SOURCE
COMMAND_ID
CORRELATION_ID
DATA_JSON
CREATED_AT

6. <MODULE_PREFIX>_OBS_EVENT_TRACE

Headers:
TRACE_ID
MODULE_CODE
EVENT_ID
EVENT_TYPE
ENTITY_TYPE
ENTITY_ID
DIRECTION
STATUS
SOURCE_MODULE
TARGET_MODULE
CORRELATION_ID
IDEMPOTENCY_KEY
MESSAGE
PAYLOAD_JSON
CREATED_AT

7. <MODULE_PREFIX>_OBS_RUNTIME_METRIC

Headers:
METRIC_ID
MODULE_CODE
METRIC_TYPE
METRIC_NAME
METRIC_VALUE
UNIT
STATUS
SEVERITY
DATA_JSON
RECORDED_AT

8. <MODULE_PREFIX>_OBS_AI_EXPORT

Headers:
EXPORT_ID
MODULE_CODE
RUN_ID
EXPORT_TYPE
STATUS
EXPORT_JSON
EXPORT_MARKDOWN
FILE_ID
FILE_URL
CREATED_AT
CREATED_BY
NOTE

QUY ƯỚC PREFIX:
- Nếu MODULE_CODE = TASK thì MODULE_PREFIX = TASK
- Nếu MODULE_CODE = FINANCE thì MODULE_PREFIX = FIN
- Nếu MODULE_CODE = HO_SO thì MODULE_PREFIX = HOSO
- Nếu MODULE_CODE = INVOICE_MEMBER thì MODULE_PREFIX = INV_MEMBER
Nếu chưa chắc, dùng MODULE_CODE đã normalize, bỏ ký tự không hợp lệ, thay bằng "_".

FILE CẦN TẠO TRONG MODULE:

1. apps-script/<module>/src/300_<PREFIX>_OBS_SCHEMA.js
2. apps-script/<module>/src/301_<PREFIX>_OBS_BOOTSTRAP.js
3. apps-script/<module>/src/302_<PREFIX>_OBS_WRITER.js
4. apps-script/<module>/src/303_<PREFIX>_OBS_HEALTH.js
5. apps-script/<module>/src/304_<PREFIX>_OBS_TEST_RUNNER.js
6. apps-script/<module>/src/305_<PREFIX>_OBS_AI_EXPORT.js
7. apps-script/<module>/src/306_<PREFIX>_OBS_MAIN_CONTROL_CLIENT.js
8. apps-script/<module>/src/307_<PREFIX>_OBS_MENU.js

YÊU CẦU TỪNG FILE:

1. 300_<PREFIX>_OBS_SCHEMA.js

Tạo constant:
<PREFIX>_OBS_SCHEMA_

Chứa:
- MODULE_CODE
- MODULE_PREFIX
- SHEETS
- HEADERS

Public functions:
- <Prefix>Obs_schemaReport()
- <Prefix>Obs_ensureSheets()

Private helpers:
- <Prefix>Obs_openModuleDb_()
- <Prefix>Obs_ensureSheet_(ss, sheetName, headers)
- <Prefix>Obs_ensureHeaders_(sheet, headers)
- <Prefix>Obs_getHeaders_(sheet)
- <Prefix>Obs_makeId_(prefix)

Yêu cầu:
- Idempotent.
- Nếu sheet có rồi chỉ append header thiếu.
- Không đổi thứ tự header cũ.
- Không xóa header.

2. 301_<PREFIX>_OBS_BOOTSTRAP.js

Public functions:
- <Prefix>Obs_bootstrap()
- <Prefix>Obs_bootstrapDryRun()

Nhiệm vụ:
- Dry run báo cáo sheet/cột sẽ tạo.
- Bootstrap tạo sheet/cột OBS.
- Ghi một dòng health sau bootstrap nếu có thể.
- Không làm fail nghiệp vụ nếu OBS lỗi.

3. 302_<PREFIX>_OBS_WRITER.js

Public functions:
- <Prefix>Obs_appendHealth(payload)
- <Prefix>Obs_appendTestRun(payload)
- <Prefix>Obs_appendTestResult(payload)
- <Prefix>Obs_appendFinding(payload)
- <Prefix>Obs_appendAudit(payload)
- <Prefix>Obs_appendEventTrace(payload)
- <Prefix>Obs_appendRuntimeMetric(payload)

Private helpers:
- <Prefix>Obs_appendRow_(sheetName, rowObject)
- <Prefix>Obs_safeJson_(value)
- <Prefix>Obs_now_()
- <Prefix>Obs_user_()

Yêu cầu:
- Ghi sheet bằng header map, không phụ thuộc thứ tự cột.
- Nếu thiếu sheet thì cố gắng ensure sheet.
- Không throw ra ngoài nếu gọi từ business flow; trả object lỗi chuẩn.

4. 303_<PREFIX>_OBS_HEALTH.js

Public functions:
- <Prefix>Obs_healthCheck()
- <Prefix>Obs_healthCheckText()

Kiểm tra tối thiểu:
- mở được module DB
- các sheet OBS tồn tại
- các header bắt buộc tồn tại
- có connection package không nếu module có dùng
- có moduleDbId không
- có mainControlWebAppUrl không nếu module cần emit summary

Output:
{
  ok: true/false,
  code: "...",
  message: "...",
  data: {
    summary: {
      info,
      warn,
      error,
      blocker
    },
    findings: []
  },
  error: null
}

5. 304_<PREFIX>_OBS_TEST_RUNNER.js

Public functions:
- <Prefix>Obs_runSelfTest()
- <Prefix>Obs_runSmokeTest()
- <Prefix>Obs_runSchemaTest()
- <Prefix>Obs_generateSampleData()

Yêu cầu:
- Tạo RUN_ID.
- Ghi <PREFIX>_OBS_TEST_RUN.
- Ghi từng test vào <PREFIX>_OBS_TEST_RESULT.
- Nếu WARN/ERROR/BLOCKER thì ghi <PREFIX>_OBS_FINDING.
- Test không phá dữ liệu thật.
- Nếu tạo sample data thì dùng TEST_ prefix.

Test tối thiểu:
- OBS_SCHEMA_OK
- OBS_HEALTH_OK
- MODULE_DB_OPEN_OK
- CONNECTION_PACKAGE_PRESENT_OR_WARN
- MAIN_CONTROL_URL_PRESENT_OR_WARN
- EVENT_TRACE_WRITE_OK
- AUDIT_WRITE_OK
- AI_EXPORT_BUILD_OK

6. 305_<PREFIX>_OBS_AI_EXPORT.js

Public functions:
- <Prefix>Obs_generateAiDiagnosticExport()
- <Prefix>Obs_buildAiExportJson()
- <Prefix>Obs_buildAiExportMarkdown()

Nội dung export:
{
  "meta": {
    "moduleCode": "",
    "generatedAt": "",
    "generatedBy": ""
  },
  "health": {},
  "latestTestRun": {},
  "findings": [],
  "auditSample": [],
  "eventTraceSample": [],
  "runtimeMetrics": [],
  "recommendations": []
}

Yêu cầu:
- Ghi JSON/Markdown vào <PREFIX>_OBS_AI_EXPORT.
- Nếu có thể thì tạo file JSON/MD trong Drive folder cấu hình; nếu chưa có folder thì chỉ ghi vào sheet.
- Không hardcode folder ID.

7. 306_<PREFIX>_OBS_MAIN_CONTROL_CLIENT.js

Public functions:
- <Prefix>Obs_emitSummaryToMainControl()
- <Prefix>Obs_emitFindingToMainControl(finding)
- <Prefix>Obs_getMainControlConnection()

Yêu cầu:
- Optional.
- Nếu thiếu MAIN_CONTROL URL/token thì trả WARN, không fail.
- Chỉ gửi summary/finding nghiêm trọng.
- Không gửi toàn bộ audit/test result chi tiết.
- Payload event về MAIN_CONTROL nên dùng:
  EVENT_TYPE = MODULE_OBS_SUMMARY
  hoặc MODULE_OBS_FINDING

8. 307_<PREFIX>_OBS_MENU.js

Tạo menu cho module:

Tên menu:
🛡️ <MODULE_CODE> OBS

Menu items:
1. Bootstrap OBS
2. Dry Run Bootstrap
3. Run Health Check
4. Run Self Test
5. Generate Sample Data
6. Generate AI Diagnostic Export
7. Emit Summary to MAIN_CONTROL
8. Open OBS Sheets

Yêu cầu:
- Có hướng dẫn thao tác bằng SpreadsheetApp.getUi().alert()
- Không cần kỹ thuật vẫn dùng được.
- Menu function phải public để Apps Script gọi.

CẦN CẬP NHẬT:
- apps-script/<module>/.clasp.json.example
Thêm filePushOrder cho các file OBS sau file config/db/schema chính và trước menu cuối nếu cần.

- Nếu module có onOpen aggregator, wire thêm:
  build<Prefix>ObsMenu_()
hoặc expose function menu riêng, không phá menu cũ.

RESPONSE CHUẨN:
Nếu module đã có std response riêng thì dùng.
Nếu không có, tạo helper:
<Prefix>Obs_stdResponse_(ok, code, message, data, error)

Không tạo trùng tên global generic như stdResponse_.

STYLE:
- Google Apps Script V8.
- Không dùng thư viện ngoài.
- Guard mọi hàm không chắc tồn tại bằng typeof.
- Không dùng DB ID hardcode.
- Ghi sheet theo header map.
- Dùng try/catch ở public functions.
- Writer OBS không được làm fail nghiệp vụ chính.
- Tất cả timestamps ISO string.
- STATUS chuẩn:
  OK
  WARN
  ERROR
  BLOCKER
  SKIPPED

SAU KHI CODE:
Tạo tài liệu:
docs/<MODULE_CODE>_OBS_IMPLEMENTATION.md

Nội dung:
1. OBS là gì trong module này
2. File đã tạo/sửa
3. Sheet đã tạo
4. Menu thao tác từng bước
5. Hàm test cần chạy
6. Cách xuất dữ liệu gửi ChatGPT
7. Cách module gửi summary về MAIN_CONTROL
8. Rủi ro còn lại
9. Rollback

OUTPUT CUỐI:
- Danh sách file tạo/sửa
- Danh sách hàm public
- Danh sách sheet OBS
- Hướng dẫn chạy:
  1. <Prefix>Obs_bootstrapDryRun()
  2. <Prefix>Obs_bootstrap()
  3. <Prefix>Obs_healthCheck()
  4. <Prefix>Obs_runSelfTest()
  5. <Prefix>Obs_generateAiDiagnosticExport()
- Lưu ý trước khi clasp push