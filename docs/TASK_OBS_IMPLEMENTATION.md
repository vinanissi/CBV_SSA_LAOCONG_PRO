## TASK OBS Implementation

### 1. Scope

Phase **OBS-C1**: triển khai `TASK_OBS` như adopter đầu tiên dùng **CBV_OBS_CORE B1**.

Mục tiêu:

- Không copy/paste toàn bộ MAIN_CONTROL_OBS
- TASK_OBS chỉ là adapter/wrapper gọi `CBV_Obs_*`
- Chạy local trong **TASK DB**
- Menu operator-driven, popup ngắn, dữ liệu chi tiết nằm ở sheet

---

### 2. Files Created

- `apps-script/task/src/300_TASK_OBS_CONFIG.js`
- `apps-script/task/src/301_TASK_OBS_ADAPTER.js`
- `apps-script/task/src/307_TASK_OBS_MENU.js`

Updated:

- `apps-script/task/.clasp.json.example` (filePushOrder)

---

### 3. Required Script Properties

Bắt buộc:

- `CBV_TASK_DB_ID`: Spreadsheet ID của TASK DB (Google Sheets)

Tuỳ chọn (không bắt buộc, thiếu chỉ WARN):

- `CBV_MAIN_CONTROL_WEBAPP_URL`
- `CBV_MAIN_WEBAPP_TOKEN`

---

### 4. Sheets Created (default)

TASK_OBS sẽ tạo trong TASK DB (theo `TaskObs_getConfig().sheets`):

- `TASK_OBS_HEALTH`
- `TASK_OBS_TEST_RUN`
- `TASK_OBS_TEST_RESULT`
- `TASK_OBS_FINDING`
- `TASK_OBS_AUDIT`
- `TASK_OBS_EVENT_TRACE`
- `TASK_OBS_RUNTIME_METRIC`
- `TASK_OBS_AI_EXPORT`
- `TASK_OBS_DASHBOARD`
- `TASK_OBS_OPERATOR_GUIDE`

---

### 5. Menu Operations

Menu: **`🛡️ TASK OBS`**

1. Bootstrap OBS
2. Dry Run Bootstrap
3. Run Health Check
4. Run Self Test
5. Generate Sample Data
6. Generate AI Diagnostic Export
7. Open Findings
8. Open Test Results
9. Open AI Export
10. Open Audit Logs
11. Operator Guide

Nguyên tắc UX:

- popup ngắn: ok/code/message (+ PASS/WARN/ERROR/BLOCKER nếu có)
- nếu lỗi: popup “Có lỗi. Mở TASK_OBS_FINDING.”

---

### 6. Test Flow

Self-test (`TaskObs_runSelfTest`) chạy tối thiểu:

- `OBS_CORE_PRESENT`
- `TASK_DB_ID_PRESENT`
- `TASK_DB_OPEN_OK`
- `OBS_SCHEMA_OK`
- `HEALTH_OK`
- `WRITE_FINDING_OK`
- `WRITE_AUDIT_OK`
- `WRITE_EVENT_TRACE_OK`
- `AI_EXPORT_BUILD_OK`

Mỗi test ghi vào:

- `TASK_OBS_TEST_RESULT`

Nếu WARN/ERROR/BLOCKER sẽ ghi thêm:

- `TASK_OBS_FINDING`

---

### 7. AI Diagnostic Export

`TaskObs_generateAiDiagnosticExport()`:

- build JSON + Markdown (local)
- ghi `TASK_OBS_AI_EXPORT` qua `CBV_Obs_appendAiExport`
- không tạo Drive file ở Phase C1

---

### 8. How TASK uses CBV_OBS_CORE

TASK_OBS gọi các hàm core:

- `CBV_Obs_ensureSheets`, `CBV_Obs_schemaReport`
- `CBV_Obs_append*` (health/testRun/testResult/finding/audit/eventTrace/runtimeMetric/aiExport)
- `CBV_Obs_openSheet`, `CBV_Obs_showResultAlert` (nếu có)

Nếu thiếu core function, health/self-test sẽ báo **ERROR/BLOCKER** rõ và ghi vào findings.

---

### 9. What This Phase Does Not Do

- Không refactor TASK business logic.
- Không gọi network sang MAIN_CONTROL (chỉ stub payload).
- Không triển khai test engine/AI export core version đầy đủ (chỉ đủ dùng để kiểm chứng B1).

---

### 10. Next Phase

Phase tiếp theo đề xuất:

- Chuẩn hoá `TASK_OBS_DASHBOARD` (refresh/upsert)
- Bổ sung `CBV_OBS_CORE_TEST_ENGINE` + `CBV_OBS_CORE_AI_EXPORT` (Phase B2/B3)
- Sau khi TASK_OBS ổn định, mới triển khai adopter tiếp theo (FINANCE_OBS hoặc HO_SO_OBS).

