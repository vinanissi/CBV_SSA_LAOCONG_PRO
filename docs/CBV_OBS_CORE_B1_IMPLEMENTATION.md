## CBV OBS Core B1 Implementation

### 1. Scope

Phase **OBS-B1**: tạo **CBV_OBS_CORE tối thiểu** để các module (TASK/FINANCE/HO_SO/INVOICE_MEMBER/…) có thể reuse.

Bao gồm:

- Schema defaults + ensure (add-only, idempotent)
- Writer append-by-header-map (no-throw)
- Menu helpers (open sheet + alert summary ngắn)

Không bao gồm:

- Test engine core
- Health engine core (beyond schema report)
- AI export core
- Module adapters (TASK_OBS/…)

---

### 2. Files Created

- `apps-script/core-runtime-lib/src/300_CBV_OBS_CORE_SCHEMA.js`
- `apps-script/core-runtime-lib/src/301_CBV_OBS_CORE_WRITER.js`
- `apps-script/core-runtime-lib/src/305_CBV_OBS_CORE_MENU_HELPERS.js`

Nếu có:

- cập nhật `apps-script/core-runtime-lib/.clasp.json.example` để thêm 3 file vào `filePushOrder`.

---

### 3. Public API

#### Schema / bootstrap

- `CBV_Obs_getDefaultHeaders()`
- `CBV_Obs_normalizeConfig(config)`
- `CBV_Obs_ensureSheets(config)`
- `CBV_Obs_schemaReport(config)`

#### Writer (append-only, no-throw)

- `CBV_Obs_appendHealth(config, payload)`
- `CBV_Obs_appendTestRun(config, payload)`
- `CBV_Obs_appendTestResult(config, payload)`
- `CBV_Obs_appendFinding(config, payload)`
- `CBV_Obs_appendAudit(config, payload)`
- `CBV_Obs_appendEventTrace(config, payload)`
- `CBV_Obs_appendRuntimeMetric(config, payload)`
- `CBV_Obs_appendAiExport(config, payload)`
- `CBV_Obs_appendDashboardRow(config, payload)`
- `CBV_Obs_appendOperatorGuideRow(config, payload)`

#### Menu helpers

- `CBV_Obs_openSheet(config, sheetType)`
- `CBV_Obs_showAlert(title, message)`
- `CBV_Obs_showResultAlert(title, result)`
- `CBV_Obs_formatSummaryForAlert(result)`
- `CBV_Obs_freezeAndResizeSheet(sheet)`

---

### 4. Config Contract

Config tối thiểu (bắt buộc):

```js
var taskObsConfig = {
  moduleCode: 'TASK',
  modulePrefix: 'TASK',
  dbResolver: function() {
    // IMPORTANT: module tự quyết định lấy DB ID ở đâu.
    // Core không phụ thuộc PropertiesService để resolve DB.
    return SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('CBV_TASK_DB_ID')
    );
  }
};
```

Các key bắt buộc:

- `moduleCode` (string)
- `modulePrefix` (string)
- `dbResolver` (function)

Optional:

- `sheets` để override tên sheet.

---

### 5. Default Sheet Names

Nếu `config.sheets` không cung cấp, core sẽ default theo:

`<MODULE_PREFIX>_OBS_<TYPE>`

Ví dụ với `modulePrefix='TASK'`:

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

### 6. Writer Behavior

- **Write theo header map**, không phụ thuộc thứ tự cột.
- **Ensure sheet/header** best-effort trước khi append.
- **Không throw** ra ngoài public function.
- Default fields (tóm tắt):
  - health: `HEALTH_ID`, `MODULE_CODE`, `CHECKED_AT`, `CHECKED_BY`
  - finding: `FINDING_ID`, `MODULE_CODE`, `STATUS=OPEN`, `IS_RESOLVED=FALSE`, `CREATED_AT`, `UPDATED_AT`
  - audit/eventTrace/runtimeMetric/aiExport: tự điền ID + timestamps tương ứng

---

### 7. Menu Helper Behavior

- `CBV_Obs_openSheet(config, sheetType)`:
  - mở sheet theo `config.sheets[sheetType]` hoặc default
  - freeze header row, auto-resize nhẹ
  - nếu không thể activate UI (không phải active spreadsheet) vẫn trả response có `url` để operator mở
- `CBV_Obs_showResultAlert(...)`:
  - chỉ hiển thị summary ngắn `ok/code/message`
  - nếu có `data.counts` thì hiển thị PASS/WARN/ERROR/BLOCKER

---

### 8. What This Phase Does Not Do

- Không tạo menu riêng cho từng module.
- Không tạo self-test engine core.
- Không tạo AI export engine core.
- Không tích hợp MAIN_CONTROL / control plane.

---

### 9. How Future Modules Should Use It

Ví dụ usage (module tự quyết định DB resolver):

```js
var taskObsConfig = {
  moduleCode: 'TASK',
  modulePrefix: 'TASK',
  dbResolver: function() {
    return SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('CBV_TASK_DB_ID')
    );
  }
};

CBV_Obs_ensureSheets(taskObsConfig);

CBV_Obs_appendFinding(taskObsConfig, {
  SOURCE_TYPE: 'SELF_TEST',
  SOURCE_CODE: 'TASK_DB_OPEN',
  SEVERITY: 'WARN',
  MESSAGE: 'Example finding'
});
```

---

### 10. Next Phase Recommendation

Phase tiếp theo (OBS-C) nên làm:

- `TASK_OBS_CONFIG` (config + dbResolver cho TASK)
- `TASK_OBS_ADAPTER` (TaskObs_* wrappers gọi `CBV_Obs_*`)
- `TASK_OBS_MENU` (menu operator-driven cho TASK)

Sau khi TASK_OBS ổn định mới mở rộng core:

- `CBV_OBS_CORE_TEST_ENGINE`
- `CBV_OBS_CORE_AI_EXPORT`
- `CBV_OBS_CORE_HEALTH` (engine checks + persist)

