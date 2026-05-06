## CBV OBS Core Foundation Design

### 1. Executive Summary

`MAIN_CONTROL_OBS` đã đạt trạng thái **operator-driven** (chạy qua menu), **add-only + idempotent**, và có đủ các trụ cột observability cục bộ: schema ensure, structured sheets, health, self-test, findings, audit, event trace, runtime metrics, AI export, dashboard, open helpers.

Mục tiêu tiếp theo là **không copy/paste OBS** cho từng module (TASK/FINANCE/HO_SO/INVOICE_MEMBER), mà xây dựng một nền dùng chung:

- **CBV_OBS_CORE / OBS FOUNDATION**: engine + helpers generic
- **Module adapter**: mỗi module chỉ cấu hình `moduleCode/modulePrefix/dbResolver` + optional main-control integration
- Từng module chỉ export một số hàm “operator-friendly” và menu riêng (hoặc gắn vào menu aggregator của module).

Khuyến nghị: **Có nên code CBV_OBS_CORE ngay? → Có**, nhưng theo lộ trình an toàn: làm core lib trước, áp dụng module mới (TASK_OBS) trước, **chưa refactor MAIN_CONTROL_OBS** ở giai đoạn đầu.

---

### 2. Current MAIN_CONTROL_OBS Inventory

Inventory theo file (đã scan):

#### `apps-script/main-control/src/300_MC_OBS_SCHEMA.js`

- **Constant**: `MC_OBS_SCHEMA_`
  - `MODULE_CODE='MAIN_CONTROL'`, `MODULE_PREFIX='MC'`
  - `SHEETS`: `MC_OBS_HEALTH`, `MC_OBS_TEST_RUN`, `MC_OBS_TEST_RESULT`, `MC_OBS_FINDING`, `MC_OBS_AUDIT`, `MC_OBS_EVENT_TRACE`, `MC_OBS_RUNTIME_METRIC`, `MC_OBS_AI_EXPORT`, `MC_OBS_DASHBOARD`, `MC_OBS_OPERATOR_GUIDE`
  - `HEADERS`: định nghĩa header arrays cho từng sheet
- **Public**:
  - `MC_Obs_schemaReport()`
  - `MC_Obs_ensureSheets()`
- **Private helpers**:
  - `MC_Obs_openModuleDb_()` (strict open qua `CBV_CORE_DB_ID`)
  - `MC_Obs_ensureSheet_()`, `MC_Obs_ensureHeaders_()`, `MC_Obs_getHeaders_()`, `MC_Obs_makeId_()`
  - `MC_Obs_stdResponse_()` (delegate `MC_stdResponse_` nếu có)

#### `apps-script/main-control/src/301_MC_OBS_BOOTSTRAP.js`

- **Public**:
  - `MC_Obs_bootstrapDryRun()` → gọi `MC_Obs_schemaReport()`
  - `MC_Obs_bootstrap()` → gọi `MC_Obs_ensureSheets()` và ghi 1 dòng health `OBS_BOOTSTRAP` (best-effort, không throw)

#### `apps-script/main-control/src/302_MC_OBS_WRITER.js`

- **Public append APIs** (structured sheet writes):
  - `MC_Obs_appendHealth(payload)`
  - `MC_Obs_appendTestRun(payload)`
  - `MC_Obs_appendTestResult(payload)`
  - `MC_Obs_appendFinding(payload)`
  - `MC_Obs_appendAudit(payload)`
  - `MC_Obs_appendEventTrace(payload)`
  - `MC_Obs_appendRuntimeMetric(payload)`
- **Core writer**:
  - `MC_Obs_appendRow_(sheetName,rowObject)`:
    - ensure sheets best-effort
    - write by header map (`cbvCoreV2AppendRowByHeaders_` nếu có; fallback header row mapping)
    - normalize IDs/timestamps + JSON stringify
    - **never throw**
- Helpers: `MC_Obs_safeJson_`, `MC_Obs_now_`, `MC_Obs_user_`

#### `apps-script/main-control/src/303_MC_OBS_HEALTH.js`

- **Public**:
  - `MC_Obs_healthCheck()`: kiểm tra properties + open core db + obs schema + control plane presence + connection package + registry headers; ghi `MC_OBS_HEALTH` best-effort
  - `MC_Obs_healthCheckText()` (string output; không phải nguồn chính)
- **Observations**:
  - check list mang tính MAIN_CONTROL/control-plane rõ rệt (CBV_* keys, registry, connection package).

#### `apps-script/main-control/src/304_MC_OBS_TEST_RUNNER.js`

- **Public**:
  - `MC_Obs_runSelfTest()`, `MC_Obs_runSmokeTest()`, `MC_Obs_runSchemaTest()`
  - `MC_Obs_generateSampleData()` (chỉ ghi OBS sheets)
- **Test engine**:
  - `MC_Obs_runTestsImpl_(runType)`:
    - tạo `RUN_ID`
    - append `MC_OBS_TEST_RUN`
    - chạy list test definitions
    - append `MC_OBS_TEST_RESULT` từng test
    - nếu WARN/ERROR/BLOCKER → append `MC_OBS_FINDING`
    - refresh dashboard best-effort
- **Test inventory**: gồm các test thuần OBS (schema, health, write audit/trace, ai export build) và test control-plane presence.

#### `apps-script/main-control/src/305_MC_OBS_AI_EXPORT.js`

- **Public**:
  - `MC_Obs_generateAiDiagnosticExport()`
  - `MC_Obs_buildAiExportJson()`
  - `MC_Obs_buildAiExportMarkdown()`
- **Export contents**:
  - `meta`, `health`, `controlPlane`, `latestTestRun`, `findings`, `auditSample`, `eventTraceSample`, `runtimeMetrics`, `recommendations`
- **Persistence**:
  - ghi `MC_OBS_AI_EXPORT` (structured)
  - optional Drive file theo ScriptProperty `MC_OBS_AI_EXPORT_FOLDER_ID` (không hardcode)
  - refresh dashboard best-effort

#### `apps-script/main-control/src/306_MC_OBS_MODULE_CLIENT.js`

- **Public**:
  - `MC_Obs_pullModuleSummary(moduleCode)` (stub, no network; đọc `CBV_MODULE_REGISTRY`)
  - `MC_Obs_pullRegisteredModulesSummary()` (stub, no network)
  - `MC_Obs_emitFindingToSelf(finding)` (ghi `MC_OBS_FINDING`)

#### `apps-script/main-control/src/307_MC_OBS_MENU.js`

- **Menu installer**: `buildMainControlObsMenu_()` tạo menu nhóm theo operator
- **Menu action wrapper**: `MC_Obs_menuActionWrapper_()`:
  - popup ngắn
  - ghi audit/metric/event trace nhẹ (OBS sheets)
  - lỗi → tạo finding, popup “Có lỗi. Mở OBS Findings.”
  - refresh/open dashboard theo options
- **Dashboard**:
  - `MC_Obs_refreshDashboard()`, `MC_Obs_openDashboard()`
- **Open sheet helpers**:
  - `MC_Obs_openSheetByName(sheetName)` + wrappers open findings/export/logs
- **Setup/repair**:
  - `MC_Obs_setupWebAppUrl()`, `MC_Obs_setupScriptProperties()`, `MC_Obs_setupConnectionPackageSheet()`, `MC_Obs_repairRegistryHeaders()`
- **Operator guide**:
  - `MC_Obs_showOperatorGuide()` + sheet `MC_OBS_OPERATOR_GUIDE`

#### `apps-script/main-control/src/90_BOOTSTRAP_MENU.js`

- `onOpen(e)` gọi nhiều `build*Menu_()` và đã wire thêm `buildMainControlObsMenu_()` (try/catch).

#### Docs

- `docs/MAIN_CONTROL_OBS_IMPLEMENTATION.md`: mô tả file/sheet/menu + cách chạy.
- `docs/MAIN_CONTROL_OBS_OPERATOR_RUNBOOK.md`: runbook operator-only (menu path).

---

### 3. What Can Be Generic

Nhóm có thể generic hoá thành **OBS CORE** (tương ứng mục A):

#### 3.1 Schema & sheet bootstrap (generic)

- Schema manifest + headers:
  - sheets: `*_OBS_HEALTH`, `*_OBS_TEST_RUN`, `*_OBS_TEST_RESULT`, `*_OBS_FINDING`, `*_OBS_AUDIT`, `*_OBS_EVENT_TRACE`, `*_OBS_RUNTIME_METRIC`, `*_OBS_AI_EXPORT`
  - optional: `*_OBS_DASHBOARD`, `*_OBS_OPERATOR_GUIDE`
- Ensure sheet:
  - create sheet if missing
  - append missing headers only
  - never reorder/delete columns

#### 3.2 Writer: append-by-header-map (generic)

- `appendRow(sheetName,rowObject)`:
  - resolves DB via `config.dbResolver()`
  - reads header map
  - fills ID/timestamp defaults
  - safe JSON stringify fields
  - best-effort, no-throw

#### 3.3 Standard append APIs (generic)

- append health/testRun/testResult/finding/audit/eventTrace/runtimeMetric/aiExport
- normalize field names & defaults

#### 3.4 Health summary framework (generic)

- A generic health runner:
  - input: list of checks (functions)
  - output: structured `{summary, findings[]}`
  - persist to `*_OBS_HEALTH`

#### 3.5 Test runner engine (generic)

- Test definition structure (code/name/fn)
- A test engine that:
  - creates runId
  - writes test run + results
  - maps non-OK results into findings
  - supports `SELF/SMOKE/SCHEMA` run profiles

#### 3.6 AI export builder (generic)

Generic export scaffolding:
- `meta`
- `health`
- `latestTestRun`
- `findings` sample
- `audit/eventTrace/runtimeMetrics` samples
- `recommendations`

Allow module to inject:
- additional section(s) (e.g., domain summary)
- custom recommendations
- optional Drive export via config folder resolver

#### 3.7 Dashboard refresh basic (generic)

Dashboard in key/value rows:
- last health code + blocker count
- last test run status
- findings totals / blocker approximate
- last AI export
- suggested next action

#### 3.8 Open sheet helpers (generic)

- open sheet by name, freeze header, autosize safe
- open findings/test results/export/logs shortcuts

#### 3.9 Menu pattern (generic)

Menu builder:
- group structure (Bootstrap/Health/Tests/Findings/Export/Logs/Setup/Guide)
- wrapper for actions:
  - short popup
  - structured logging to OBS sheets
  - open findings on error
  - refresh dashboard

---

### 4. What Must Stay MAIN_CONTROL-Specific

Nhóm cần giữ riêng `MAIN_CONTROL` (tương ứng mục B), vì gắn với control-plane + role của MAIN_CONTROL:

- Checks về ScriptProperties keys:
  - `CBV_CORE_DB_ID`, `CBV_CONFIG_DB_ID`, `CBV_MAIN_CONTROL_WEBAPP_URL`, `CBV_MAIN_WEBAPP_TOKEN`
- Kiểm tra control plane schema tồn tại:
  - `MC_CONTROL_PLANE_SCHEMA_`, `MC_Schema_report`, `MC_Schema_ensureControlPlaneSheets`
- Kiểm tra các sheet control plane:
  - `CBV_CONNECTION_PACKAGE`
  - `CBV_MODULE_REGISTRY` + extended headers
- WebApp action routing checks (dù runtime không verify hết)
- Module registry / connection package logic riêng của MAIN_CONTROL
- Module-client / OBS aggregator behavior (phase sau): MAIN_CONTROL pull summary từ module khác qua WebApp URL/token (cần tránh circular dependency)

Kết luận: CBV_OBS_CORE nên cung cấp **hook points** để MAIN_CONTROL add extra checks; không nhét vào core.

---

### 5. Proposed CBV_OBS_CORE Architecture

#### 5.1 Package location

Ưu tiên đặt vào `apps-script/core-runtime-lib/src/` để reuse:

Option A (nếu repo hỗ trợ folder):

- `apps-script/core-runtime-lib/src/obs/CBV_OBS_CORE_SCHEMA.js`
- `apps-script/core-runtime-lib/src/obs/CBV_OBS_CORE_WRITER.js`
- `apps-script/core-runtime-lib/src/obs/CBV_OBS_CORE_HEALTH.js`
- `apps-script/core-runtime-lib/src/obs/CBV_OBS_CORE_TEST_ENGINE.js`
- `apps-script/core-runtime-lib/src/obs/CBV_OBS_CORE_AI_EXPORT.js`
- `apps-script/core-runtime-lib/src/obs/CBV_OBS_CORE_MENU_HELPERS.js`

Option B (flat naming theo quy ước hiện hữu):

- `apps-script/core-runtime-lib/src/300_CBV_OBS_CORE_SCHEMA.js`
- `apps-script/core-runtime-lib/src/301_CBV_OBS_CORE_WRITER.js`
- `apps-script/core-runtime-lib/src/302_CBV_OBS_CORE_HEALTH.js`
- `apps-script/core-runtime-lib/src/303_CBV_OBS_CORE_TEST_ENGINE.js`
- `apps-script/core-runtime-lib/src/304_CBV_OBS_CORE_AI_EXPORT.js`
- `apps-script/core-runtime-lib/src/305_CBV_OBS_CORE_MENU_HELPERS.js`

#### 5.2 Layering rules (để tránh circular dependency)

- **CBV_OBS_CORE** không import/assume MAIN_CONTROL.
- Module adapter có thể “opt-in” integration:
  - enrich health checks với main-control connection package
  - nhưng các call network phải optional, guarded, và không fail core flows.

#### 5.3 Naming strategy (tránh trùng global functions)

Vì GAS global namespace dễ collision, core nên dùng prefix **`CBV_Obs*`** và module wrappers dùng prefix riêng (ví dụ `TaskObs_*`).

---

### 6. Proposed Config Object

Chuẩn hoá config (gợi ý giữ gần spec bạn đưa, bổ sung một số field thực tế từ MAIN_CONTROL_OBS):

```js
var CBV_OBS_MODULE_CONFIG = {
  moduleCode: 'TASK',
  modulePrefix: 'TASK', // for IDs, menu text

  // REQUIRED: strict DB resolver (no ActiveSpreadsheet fallback unless explicitly allowed)
  dbResolver: function () {
    // return { ok:true, ss, dbId } or throw? (core should treat as safe return)
  },

  // OPTIONAL: main control integration (phase later)
  mainControl: {
    enabled: false,
    webAppUrl: '',  // optional
    token: ''       // optional
  },

  // REQUIRED: sheet names + headers mapping (or derived)
  sheets: {
    health: 'TASK_OBS_HEALTH',
    testRun: 'TASK_OBS_TEST_RUN',
    testResult: 'TASK_OBS_TEST_RESULT',
    finding: 'TASK_OBS_FINDING',
    audit: 'TASK_OBS_AUDIT',
    eventTrace: 'TASK_OBS_EVENT_TRACE',
    runtimeMetric: 'TASK_OBS_RUNTIME_METRIC',
    aiExport: 'TASK_OBS_AI_EXPORT',

    dashboard: 'TASK_OBS_DASHBOARD',          // optional
    operatorGuide: 'TASK_OBS_OPERATOR_GUIDE'  // optional
  },

  // OPTIONAL: JSON fields per sheet (so writer knows stringify keys)
  jsonFields: {
    health: ['DATA_JSON'],
    testRun: ['SUMMARY_JSON'],
    testResult: ['DATA_JSON'],
    finding: ['DATA_JSON'],
    audit: ['DATA_JSON'],
    eventTrace: ['PAYLOAD_JSON'],
    runtimeMetric: ['DATA_JSON'],
    aiExport: ['EXPORT_JSON']
  },

  // OPTIONAL: Drive export folder resolver
  drive: {
    exportFolderIdPropKey: 'TASK_OBS_AI_EXPORT_FOLDER_ID'
  }
};
```

---

### 7. Proposed Generic API

API core (đúng định hướng bạn đưa, bổ sung vài helper cần thiết):

- Schema
  - `CBV_Obs_schemaReport(config)`
  - `CBV_Obs_ensureSheets(config)`
- Writer (append-only)
  - `CBV_Obs_appendHealth(config, payload)`
  - `CBV_Obs_appendTestRun(config, payload)`
  - `CBV_Obs_appendTestResult(config, payload)`
  - `CBV_Obs_appendFinding(config, payload)`
  - `CBV_Obs_appendAudit(config, payload)`
  - `CBV_Obs_appendEventTrace(config, payload)`
  - `CBV_Obs_appendRuntimeMetric(config, payload)`
- Health & tests
  - `CBV_Obs_healthCheck(config, checks)`
  - `CBV_Obs_runSelfTest(config, tests)` (engine; module provides tests)
- Export
  - `CBV_Obs_generateAiExport(config, options)`
  - `CBV_Obs_buildAiExportJson(config, options)`
  - `CBV_Obs_buildAiExportMarkdown(config, options)`
- Operator UX helpers (generic)
  - `CBV_Obs_refreshDashboard(config, options)`
  - `CBV_Obs_openSheet(config, sheetName)`
  - `CBV_Obs_buildMenu(config, options)`
  - `CBV_Obs_menuActionWrapper(config, actionCode, introText, fn, opts)`

Design constraints (rút ra từ MAIN_CONTROL_OBS):
- **no throw** ra ngoài ở writer/menu wrapper
- **short popup**; detailed data phải đi vào sheet
- **idempotent add-only** schema ensure
- respect load-order (`filePushOrder`) → core functions phải self-contained, guard `typeof`.

---

### 8. Module Adapter Pattern

Mẫu wrapper/adapter cho module (TASK/FINANCE/…):

#### 8.1 Files (example TASK)

- `apps-script/task/src/300_TASK_OBS_CONFIG.js`
  - define `TASK_OBS_CONFIG_` (CBV_OBS_MODULE_CONFIG for TASK)
- `apps-script/task/src/301_TASK_OBS_ADAPTER.js`
  - expose minimal public API:
    - `TaskObs_bootstrap()`
    - `TaskObs_healthCheck()`
    - `TaskObs_runSelfTest()`
    - `TaskObs_generateAiDiagnosticExport()`
  - internal mapping to `CBV_Obs_*`
- `apps-script/task/src/307_TASK_OBS_MENU.js`
  - install menu `🛡️ TASK OBS` using `CBV_Obs_buildMenu(TASK_OBS_CONFIG_)`

#### 8.2 Module-only checks/tests

Module adapter supplies:
- module-specific health checks (e.g. TASK schema slices, permissions, etc.)
- module-specific tests (schema presence, no destructive actions)
- optional main-control connection (phase later)

---

### 9. Migration Roadmap

Theo đúng phased approach bạn đưa (khuyến nghị giữ nguyên):

#### Phase OBS-A (now)
- Không sửa MAIN_CONTROL_OBS.
- Tạo mapping report (doc này) + identify reusable parts.

#### Phase OBS-B
- Implement `CBV_OBS_CORE` trong `core-runtime-lib`.
- Không áp dụng ngay vào MAIN_CONTROL.

#### Phase OBS-C
- Implement `TASK_OBS` dựa trên `CBV_OBS_CORE` như module đầu tiên.
- MAIN_CONTROL_OBS giữ nguyên.

#### Phase OBS-D
- Khi TASK_OBS ổn định, cân nhắc refactor MAIN_CONTROL_OBS dùng core (optional).
- Nếu refactor: làm dạng “strangler”: giữ API `MC_Obs_*` nhưng delegate sang `CBV_Obs_*` rồi migrate dần.

---

### 10. Risk Analysis

Các rủi ro chính khi xây OBS CORE (kèm hướng giảm thiểu):

1. **PropertiesService context khác nhau** giữa bound scripts:
   - Mitigation: config-driven; core không assume keys; module adapter quyết định prop keys.
2. **DB resolver đa dạng** (module DB riêng vs core DB):
   - Mitigation: `config.dbResolver()` bắt buộc; core không fallback trừ khi module cho phép.
3. **Global function name collisions** trong GAS:
   - Mitigation: core prefix `CBV_Obs*`, module prefix `TaskObs*`; tránh generic như `stdResponse_`.
4. **filePushOrder / load order**:
   - Mitigation: core files ở đầu; module adapter push sau core; `typeof` guards cho optional deps.
5. **Menu aggregator**:
   - Mitigation: module menu installer riêng; onOpen chỉ call installer nếu tồn tại.
6. **Performance / quota khi ghi log nhiều**:
   - Mitigation: “low-spam telemetry”: 1 audit + 1 metric per menu action; event trace only for key actions; sampling nếu cần.
7. **Schema drift** giữa module OBS và core OBS:
   - Mitigation: core owns header definitions; module uses same header set; allow module extra columns add-only.
8. **Circular dependency MAIN_CONTROL ↔ module OBS**:
   - Mitigation: core không phụ thuộc MAIN_CONTROL; main-control integration là optional plugin layer.
9. **Sorting “finding mới lên đầu”** có thể tốn và phá expectation người dùng:
   - Mitigation: chỉ sort khi user bấm “Open Findings”, giới hạn phạm vi; hoặc dùng view/filter thay vì sort.
10. **Drive permissions** cho AI export:
   - Mitigation: Drive export optional; sheet-only export là baseline.

---

### 11. Test Plan

Test plan để validate CBV_OBS_CORE + module adapters:

#### 11.1 Core unit-style (manual but repeatable)
- Fake config:
  - dbResolver trả về spreadsheet test
  - sheet names prefix `TEST_OBS_*`
- Tests:
  - schema ensure: create sheets + append missing headers only
  - writer: append by header map (with missing columns; with JSON fields)
  - “no throw”: force failures (missing db id, missing sheet) vẫn trả response + ghi finding best-effort

#### 11.2 Integration TASK_OBS (first adopter)
- Bootstrap via menu only
- Health via menu only
- Self-test via menu only
- AI export via menu only
- Validate: output always in sheets, popup short, open findings on error

#### 11.3 Regression MAIN_CONTROL_OBS
- Không thay đổi trong Phase OBS-B/C
- Chỉ verify vẫn chạy độc lập.

---

### 12. Recommendation: Next Coding Phase

**Có nên code CBV_OBS_CORE ngay không? → Có**, vì:

- MAIN_CONTROL_OBS đã chứng minh pattern hoạt động (operator-driven + structured sheets).
- Rủi ro lớn nhất là namespace/load-order; giải được bằng core prefix + config-driven + filePushOrder discipline.

**Phase code đầu tiên đề xuất (nhỏ nhất, add-only, ít rủi ro):**

1. Tạo `CBV_OBS_CORE_SCHEMA` + `CBV_OBS_CORE_WRITER` (2 file đầu tiên).
2. Tạo `CBV_OBS_CORE_MENU_HELPERS` (action wrapper + open sheet).
3. Tạo `TASK_OBS_CONFIG` + `TASK_OBS_MENU` tối thiểu (bootstrap + open findings + ai export).
4. Sau đó mới thêm `CBV_OBS_CORE_TEST_ENGINE` + `CBV_OBS_CORE_AI_EXPORT`.

Tiêu chí “done” cho Phase đầu:
- TASK vận hành 100% qua menu
- writer no-throw
- schema ensure idempotent
- export copy-friendly

