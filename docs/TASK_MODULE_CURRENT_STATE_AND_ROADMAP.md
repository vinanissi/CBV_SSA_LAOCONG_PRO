# TASK Module Current State & Roadmap

## 1. Executive Summary

Module `apps-script/task` **đã có business layer đáng kể** (repository/validation/service/bootstrap/audit-repair/system tests/migration helper) và đã có **TASK_OBS** (adapter + menu) kèm **vendored runtime CBV_OBS_CORE B1** để chạy độc lập trong TASK project.

Tuy nhiên, ở trạng thái hiện tại, TASK **chưa đủ điều kiện để “tách module riêng và push/test runtime”** vì **chưa có `.clasp.json` thật** và `scriptId` trong `.clasp.json.example` vẫn là placeholder. Ngoài ra, business code TASK đang phụ thuộc vào nhiều core/shared runtime ngoài phạm vi `apps-script/task/src` (ví dụ `CBV_CONFIG`, `_sheet/_rows/_appendRecord/_updateRow`, `cbvResponse/cbvNow/cbvUser/cbvMakeId`, shared event bridge…), nên nếu “tách” theo nghĩa runtime độc lập thì vẫn cần chuẩn hoá dependency boundary.

**Khuyến nghị phase code tiếp theo:** chọn **Option A (Phase T0 — Deployment Binding + chạy TASK_OBS sạch trước)**. Không nên xây tiếp business schema/webhook/webapp khi chưa bind/push được và chưa có OBS baseline xanh.

## 2. Current TASK File Inventory

Inventory dưới đây dựa trên file thực tế trong `apps-script/task/src` và `apps-script/task/.clasp.json.example` (load order).

### 2.1 Danh sách file `apps-script/task/src`

> Phân loại:
> - **Business**: repository/validation/service/bootstrap/migration/status snapshot…
> - **OBS**: `TaskObs_*` + `CBV_Obs_*` vendored
> - **System test**: audit/repair/test runner + fixtures
> - **Debug**: helper để chạy manual test

#### `20_TASK_REPOSITORY.js`
- **Vai trò**: Data access layer cho các bảng TASK (sheet ops), tránh business logic.
- **Public functions (chính)**:
  - `taskFindById`, `taskGetChecklistItems`, `taskFindChecklistById`
  - `donViFindById`, `taskFindHtxById`
  - `taskAppendMain`, `taskUpdateMain`
  - `taskAppendChecklist`, `taskUpdateChecklist`
  - `taskAppendAttachment`, `taskFindAttachmentById`, `taskUpdateAttachment`
  - `taskAppendUpdateLog`
- **Loại**: Business (repository).
- **Phụ thuộc**:
  - `CBV_CONFIG.SHEETS.*`
  - Shared repository helpers: `_sheet`, `_rows`, `_findById`, `_appendRecord`, `_updateRow`
- **Rủi ro load order**:
  - Không phụ thuộc file TASK khác nhiều, nhưng **phụ thuộc core/shared runtime** phải được push cùng project.
  - Nếu thiếu `_sheet/_rows/...` → repository trả `null/[]` và service sẽ hỏng logic cao hơn.

#### `20_TASK_VALIDATION.js`
- **Vai trò**: Validation & workflow rules: transitions, required checklist, refs.
- **Public functions (chính)**:
  - `assertActiveTaskTypeId`, `assertActiveDonViId`
  - `validateTaskTransition`
  - `ensureTaskEditable`, `ensureTaskCanComplete`
  - `assertValidUpdateType`
  - `validateTaskPayload`, `validateTaskForCreate`, `validateTaskForUpdate`
- **Loại**: Business (validation).
- **Phụ thuộc**:
  - `CBV_CONFIG.SHEETS.MASTER_CODE`
  - `donViFindById`, `taskFindById`, `taskGetChecklistItems`
  - Shared validation helpers: `ensureRequired`, `cbvAssert`, `assertActiveUserId`, `assertValidEnumValue`
- **Rủi ro load order**: phụ thuộc `20_TASK_REPOSITORY.js` và core validation helpers.

#### `20_TASK_STATUS_SNAPSHOT.js`
- **Vai trò**: Snapshot `TASK_MAIN.STATUS` (Document/Script Properties) để phát hiện thay đổi trực tiếp trên sheet/AppSheet không đi qua service → emit event.
- **Public functions (chính)**:
  - `cbvTaskStatusSnapshotSet_`
  - `cbvTaskStatusSnapshotSyncFromSheet_`
- **Loại**: Business (audit/trace/event support).
- **Phụ thuộc**:
  - `PropertiesService`, `SpreadsheetApp`
  - `CBV_CONFIG.SHEETS.TASK_MAIN`
  - `cbvTryEmitCoreEvent_` (core event queue)
  - Optional constants: `CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED`
- **Rủi ro load order**: thấp trong file TASK; nhưng **phụ thuộc core event emitter**.

#### `20_TASK_SERVICE.js`
- **Vai trò**: Business API cho TASK (create/update/status/checklist/attachment/logging + forward event best-effort).
- **Public functions (đã thấy trong file)**:
  - Overdue helpers: `taskMainIsOverdue`, `taskMainOverdueDisplay`, `taskMainWithOverdueFields`
  - Progress: `calculateProgress`, `syncTaskProgress`
  - Core mutations (đã thấy): `createTask`, `updateTask` (file còn dài; có khả năng còn `setTaskStatus`, checklist ops, attachment ops…)
- **Loại**: Business (service).
- **Phụ thuộc** (high impact):
  - Repository: `taskFindById`, `taskAppendMain`, `taskUpdateMain`, `taskAppendUpdateLog`, `taskGetChecklistItems`, ...
  - Validation: `ensureRequired`, `ensureMaxLength`, `ensureTaskEditable`, `assertValidEnumValue`, ...
  - Core utils: `cbvMakeId`, `cbvNow`, `cbvUser`, `cbvResponse`, `cbvAssert`
  - Shared-with / privacy (comment & TODO): `45_SHARED_WITH_SERVICE` (không nằm trong TASK folder)
  - Core event: `cbvTryEmitCoreEvent_` + constants `CBV_CORE_EVENT_TYPE_TASK_CREATED`, ...
  - MAIN_CONTROL bridge (best-effort): `mainEventTryForward_`
  - Optional user mapping: `mapCurrentUserEmailToInternalId`
- **Rủi ro load order**:
  - **Cao** nếu filePushOrder không đảm bảo repository/validation load trước (hiện đang đúng).
  - **Cao** nếu project TASK không push kèm core runtime có `cbvResponse/cbvNow/...` và shared helpers.

#### `20_TASK_MIGRATION_HELPER.js`
- **Vai trò**: Migration helper từ sheet legacy (ví dụ `BANG_CONG_VIEC`) sang model normalize; add-only, không phá sheet cũ; có audit log.
- **Public functions (chính)**:
  - `analyzeTaskMigrationSource`
  - `buildTaskMigrationReport`
  - (file còn dài; likely có `executeTaskMigration` hoặc tương tự trong phần còn lại)
- **Loại**: Business (migration tooling).
- **Phụ thuộc**:
  - `SpreadsheetApp.getActive()`
  - Likely audit to `ADMIN_AUDIT_LOG` (mô tả đầu file)
  - Possibly `03_USER_MIGRATION_HELPER` (mô tả)
- **Rủi ro load order**: trung bình; chủ yếu là core audit/repo helpers.

#### `90_BOOTSTRAP_TASK.js`
- **Vai trò**: Bootstrap tối thiểu cho TASK tables (`TASK_MAIN`, `TASK_CHECKLIST`, `TASK_ATTACHMENT`, `TASK_UPDATE_LOG`) dựa trên schema manifest.
- **Public functions**: `taskBootstrapSheets`
- **Loại**: Business (bootstrap).
- **Phụ thuộc**: `ensureSheetExists`, `getSchemaHeaders`, `ensureHeadersMatchOrReport`, `_writeHeaders` (core schema/bootstrap helpers).
- **Rủi ro load order**: trung bình; cần core bootstrap/schema runtime có sẵn.

#### `95_TASK_SYSTEM_BOOTSTRAP.js`
- **Vai trò**: PRO bootstrap nâng cao (DON_VI + seed + TASK_TYPE + mở rộng TASK_MAIN schema) + audit helpers.
- **Public functions (đã thấy)**:
  - `getDonViSheetName`
  - `ensureDonViSheet`, `ensureSeedDonVi`
  - `ensureSeedTaskType`
  - `ensureTaskMainSchemaPro`
  - `buildActiveSlicesSpecImpl`
  - `selfAuditDonVi` (file còn dài)
- **Loại**: Business (bootstrap + audit utilities).
- **Phụ thuộc**: `CBV_CONFIG`, `SpreadsheetApp`, core utils (`cbvNow/cbvUser/cbvMakeId`).
- **Rủi ro load order**: trung bình.

#### `96_TASK_SYSTEM_AUDIT_REPAIR.js`
- **Vai trò**: Self audit và safe repair (append missing columns only) cho các sheet task system.
- **Public functions (đã thấy)**:
  - `selfAuditTaskSystemFull`
  - `repairTaskSystemSafelyFull`
- **Loại**: System audit/repair (business support).
- **Phụ thuộc**:
  - `CBV_SCHEMA_MANIFEST` + `getSchemaHeaders` / `loadSheetDataSafe`
  - `CBV_CONFIG.SHEETS.*`
  - `SpreadsheetApp.getActive()`
- **Rủi ro load order**: trung bình; cần schema manifest + loader helpers.

#### `97_TASK_SYSTEM_TEST_ASSERTIONS.js`
- **Vai trò**: Test assertions helpers (portable).
- **Public functions**: `logTestResult`, `assertEquals`, `assertTrue`, `assertNotEmpty`, `assertRefExists`, `assertValidEnum`
- **Loại**: System test.
- **Phụ thuộc**: minimal.
- **Rủi ro load order**: thấp.

#### `97_TASK_SYSTEM_TEST_MOCK.js`
- **Vai trò**: Mock data fixtures (good/bad).
- **Public functions**: `getMockDonViGood`, `getMockUserGood`, `getMockTaskTypeGood`, `getMockTaskGood`, `getMockUserBadEnum`, `getMockTaskDoneNoTimestamp`, `getMockTaskBadStatus`, `validateMockDataGood`, `validateMockDataBad`
- **Loại**: System test.
- **Phụ thuộc**: none đáng kể.
- **Rủi ro load order**: thấp.

#### `97_TASK_SYSTEM_TEST_RUNNER.js`
- **Vai trò**: System test runner cho schema/seed/enum/ref integrity.
- **Public functions (đã thấy)**:
  - `testSchemaIntegrity`, `testSeedConsistency`, `testEnumConsistency`, `testRefIntegrity`
  - (file còn dài; khả năng có `runAllSystemTests`)
- **Loại**: System test.
- **Phụ thuộc**:
  - `loadSheetDataSafe`
  - `CBV_CONFIG.SHEETS`
  - `SpreadsheetApp.getActive()`
- **Rủi ro load order**: trung bình.

#### `99_DEBUG_TASK_TEST.js`
- **Vai trò**: Debug entrypoint (wrapper doc) cho `runTaskTests()` (nằm ở file khác).
- **Public functions**: không có (chỉ mô tả).
- **Loại**: Debug/support.

#### `99_DEBUG_TEST_TASK.js`
- **Vai trò**: Manual test runner `runTaskTests()` dựa trên business API (`createTask`, checklist, set status…).
- **Public functions**: `runTaskTests` (+ private `_taskTestGetDonViId`, `_taskTestGetOwnerId`)
- **Loại**: Debug/testing.
- **Phụ thuộc**:
  - Business API: `createTask`, `addChecklistItem`, `markChecklistDone`, `setTaskStatus`
  - Core: `cbvUser`, `getActiveUsers`, `mapCurrentUserEmailToInternalId`
  - Shared sheet helpers: `_sheet`, `_rows`
- **Rủi ro load order**: trung bình; chỉ dùng khi chạy test.

#### `250_CBV_OBS_CORE_SCHEMA.js` (vendored)
- **Vai trò**: Vendored runtime của `CBV_OBS_CORE B1` — schema + helpers.
- **Public functions**: `CBV_Obs_getDefaultHeaders`, `CBV_Obs_normalizeConfig`, `CBV_Obs_ensureSheets`, `CBV_Obs_schemaReport` (+ helpers `CBV_Obs_stdResponse_`, `CBV_Obs_now_`, `CBV_Obs_user_`, ...)
- **Loại**: OBS runtime.
- **Phụ thuộc**: `SpreadsheetApp`, `PropertiesService`, `Session` (built-in).
- **Rủi ro load order**: **phải load trước** writer/menu helpers + TASK_OBS.

#### `251_CBV_OBS_CORE_WRITER.js` (vendored)
- **Vai trò**: Generic append writer cho 10 sheet types OBS.
- **Public functions**: `CBV_Obs_appendHealth`, `CBV_Obs_appendTestRun`, `CBV_Obs_appendTestResult`, `CBV_Obs_appendFinding`, `CBV_Obs_appendAudit`, `CBV_Obs_appendEventTrace`, `CBV_Obs_appendRuntimeMetric`, `CBV_Obs_appendAiExport`, `CBV_Obs_appendDashboardRow`, `CBV_Obs_appendOperatorGuideRow`
- **Loại**: OBS runtime.
- **Phụ thuộc**: `CBV_Obs_ensureSheets` + schema helpers (từ `250_`).
- **Rủi ro load order**: phải sau `250_`.

#### `255_CBV_OBS_CORE_MENU_HELPERS.js` (vendored)
- **Vai trò**: UI helpers cho menu (open sheet + alert + freeze/resize).
- **Public functions**: `CBV_Obs_openSheet`, `CBV_Obs_showAlert`, `CBV_Obs_showResultAlert`, `CBV_Obs_formatSummaryForAlert`, `CBV_Obs_freezeAndResizeSheet`
- **Loại**: OBS runtime (UI).
- **Phụ thuộc**: `SpreadsheetApp.getUi()` + config normalize.
- **Rủi ro load order**: phải sau `250_` nếu gọi helper chung.

#### `300_TASK_OBS_CONFIG.js`
- **Vai trò**: TASK_OBS config + bootstrap wrappers; resolver mở TASK DB theo `CBV_TASK_DB_ID`.
- **Public functions**: `TaskObs_getConfig`, `TaskObs_schemaReport`, `TaskObs_bootstrap`, `TaskObs_bootstrapDryRun`
- **Loại**: OBS adapter/config.
- **Phụ thuộc**: `CBV_Obs_schemaReport`, `CBV_Obs_ensureSheets`, `CBV_Obs_appendHealth` (vendored core); `PropertiesService` (`CBV_TASK_DB_ID`).
- **Rủi ro load order**: cần `250_/251_` trước.

#### `301_TASK_OBS_ADAPTER.js`
- **Vai trò**: TASK_OBS health/self-test/sample/export + optional MAIN_CONTROL summary emit.
- **Public functions**: `TaskObs_healthCheck`, `TaskObs_healthCheckText`, `TaskObs_runSelfTest`, `TaskObs_generateSampleData`, `TaskObs_generateAiDiagnosticExport`, `TaskObs_emitSummaryToMainControl`
- **Loại**: OBS adapter.
- **Phụ thuộc**:
  - Bắt buộc: `CBV_TASK_DB_ID`
  - Optional: `CBV_MAIN_CONTROL_WEBAPP_URL`, `CBV_MAIN_WEBAPP_TOKEN`
  - Vendored core writers: `CBV_Obs_append*`, `CBV_Obs_ensureSheets`, ...
- **Rủi ro load order**: cần `250_/251_/255_` + `300_` trước.

#### `307_TASK_OBS_MENU.js`
- **Vai trò**: Menu operator-driven `🛡️ TASK OBS` + `onOpen(e)` để auto install.
- **Public functions**:
  - `onOpen(e)`, `buildTaskObsMenu_()`
  - `TaskObs_menuBootstrap`, `TaskObs_menuBootstrapDryRun`, `TaskObs_menuHealthCheck`, `TaskObs_menuRunSelfTest`, `TaskObs_menuGenerateSampleData`, `TaskObs_menuGenerateAiDiagnosticExport`
  - `TaskObs_menuOpenFindings`, `TaskObs_menuOpenTestResults`, `TaskObs_menuOpenAiExport`, `TaskObs_menuOpenAuditLogs`, `TaskObs_menuOperatorGuide`
- **Loại**: OBS menu.
- **Phụ thuộc**: `SpreadsheetApp.getUi()`, `TaskObs_*` adapter/config, `CBV_Obs_showResultAlert` (optional).
- **Rủi ro load order**: menu gọi adapter; phải sau `300_`/`301_`.

## 3. Current CLASP / Deployment Status

### 3.1 Files deployment hiện có
- Có `apps-script/task/.clasp.json.example`: **YES**
- Có `apps-script/task/.clasp.json` thật: **NO** (không tìm thấy)
- Có `apps-script/task/src/appsscript.json`: **YES**

### 3.2 `.clasp.json.example` review (evidence)
- `scriptId`: `"PASTE_TASK_SCRIPT_ID_HERE"` → **chưa bind project**
- `rootDir`: `"src"` → đúng với layout hiện tại
- `filePushOrder`: có đủ các file hiện hữu và đúng load order cho OBS (core vendored trước TaskObs)

### 3.3 Kết luận deployment readiness
- **READY_TO_PUSH = NO**
- **Thiếu gì / vì sao**:
  - **BLOCKER**: thiếu `.clasp.json` thật hoặc ít nhất chưa có `scriptId` thật để bind với Apps Script project của TASK.
  - Chưa xác định rõ TASK project là **standalone** hay **bound** với TASK DB spreadsheet nào (trong thực tế, business code dùng `SpreadsheetApp.getActive()` nhiều, nên ngầm định bound).

## 4. Current TASK_OBS Status

### 4.1 Kết luận nhanh
- TASK_OBS **đã đủ runtime về mặt code** trong repo (vì đã vendor `CBV_Obs_*` vào chính `apps-script/task/src`).
- Nhưng để **chạy thật** cần tối thiểu:
  - bind/push được project TASK (T0)
  - set Script Properties **`CBV_TASK_DB_ID`**

### 4.2 Bảng trạng thái

| Component | Status | Evidence | Risk | Next action |
|---|---|---|---|---|
| OBS core runtime (`CBV_Obs_*`) | OK (vendored) | Có `250_`, `251_`, `255_` trong `apps-script/task/src` | Drift version với `core-runtime-lib` | Khi core nâng version: cherry-pick có kiểm soát hoặc chuyển sang GAS Library sau |
| OBS adapter (`TaskObs_*`) | OK | `300_TASK_OBS_CONFIG.js`, `301_TASK_OBS_ADAPTER.js` | Sai cấu hình DB ID sẽ BLOCKER | Set `CBV_TASK_DB_ID`; chạy `TaskObs_bootstrapDryRun()` |
| Menu `🛡️ TASK OBS` | OK | `307_TASK_OBS_MENU.js` có `onOpen(e)` + `buildTaskObsMenu_()` | Có thể conflict nếu sau này TASK có menu khác/onOpen khác | Hợp nhất menu aggregator ở Phase sau (không làm ở T0) |
| Script Properties bắt buộc | MISSING (runtime) | Health/self-test check `CBV_TASK_DB_ID` | BLOCKER chạy thật | Set `CBV_TASK_DB_ID` |
| MAIN_CONTROL integration (optional) | PARTIAL | healthCheck warns `CBV_MAIN_CONTROL_WEBAPP_URL`, `CBV_MAIN_WEBAPP_TOKEN` | Không emit summary được | Set 2 props nếu muốn `TaskObs_emitSummaryToMainControl()` hoạt động |
| Bootstrap OBS sheets | READY | `TaskObs_bootstrap()` gọi `CBV_Obs_ensureSheets` | Nếu DB mở fail → blocker | T0: bind/push + set DB ID + bootstrap |
| Self-test | READY | `TaskObs_runSelfTest()` ghi `TASK_OBS_TEST_RUN/RESULT` + findings | Nếu thiếu quyền/open DB fail | T0: chạy self-test sau bootstrap |
| AI diagnostic export | READY (local row) | `TaskObs_generateAiDiagnosticExport()` ghi `TASK_OBS_AI_EXPORT` | Không tạo Drive file (đúng scope) | T0: chạy export và copy gửi AI |

### 4.3 TASK_OBS tạo/đảm bảo các sheet nào
Theo `TaskObs_getConfig().sheets`:
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

## 5. Current TASK Business Module Status

### 5.1 Có business module chưa?

**Có.** Ngoài OBS, TASK đã có các mảnh business quan trọng:
- Repository: `20_TASK_REPOSITORY.js` (CRUD sheet-level)
- Validation/workflow: `20_TASK_VALIDATION.js`
- Service API: `20_TASK_SERVICE.js` (create/update + derived fields + event forward best-effort)
- Bootstrap: `90_BOOTSTRAP_TASK.js`, `95_TASK_SYSTEM_BOOTSTRAP.js`
- Audit/Repair: `96_TASK_SYSTEM_AUDIT_REPAIR.js`
- System tests: `97_TASK_SYSTEM_TEST_*`
- Status snapshot & event emit: `20_TASK_STATUS_SNAPSHOT.js`
- Migration helper: `20_TASK_MIGRATION_HELPER.js`

### 5.2 Những phần “Target business” hiện **chưa thấy** trong phạm vi scan

Trong phạm vi scan (chỉ `apps-script/task` + docs), **chưa thấy file/entrypoint rõ ràng** cho:
- `TASK_WEBHOOK` / `doPost()` / `doGet()` / WebApp handler: **không có match**
- `TASK_MAIN_CONTROL_CLIENT` chuẩn hoá (client gọi MAIN_CONTROL): chỉ thấy best-effort `_taskMainEventForward_` gọi `mainEventTryForward_` (nếu có)
- `TASK_EVENT_BRIDGE` dạng module file riêng: chưa thấy
- `TASK_COMMENT`, `TASK_STATUS_HISTORY`, `TASK_EVENT` dưới dạng schema+repo riêng: chưa thấy file chuyên trách (hiện đang làm với `TASK_UPDATE_LOG`, checklist, attachment)

**Nhận định:** TASK business hiện đang ở dạng “đã có service + repository cho một số bảng” nhưng **chưa đóng gói theo target architecture** (tách config/schema/db/webhook/webapp/menu), và thiếu các bảng/luồng target (comment, status history, event, permission, config).

## 6. Target TASK Module Architecture

### 6.1 Target files (theo yêu cầu)

Mục tiêu (đích) là `apps-script/task/src` có bộ file:
- `000_TASK_CONFIG.js`
- `010_TASK_SCHEMA.js`
- `020_TASK_BOOTSTRAP.js`
- `030_TASK_DB.js`
- `040_TASK_MAIN_CONTROL_CLIENT.js`
- `050_TASK_EVENT_BRIDGE.js`
- `100_TASK_SERVICE.js`
- `110_TASK_STATUS_ENGINE.js`
- `120_TASK_APPSHEET_WEBHOOK.js`
- `130_TASK_WEBAPP.js`
- `200_TASK_MENU.js`
- OBS runtime + adapter:
  - `250_CBV_OBS_CORE_SCHEMA.js`
  - `251_CBV_OBS_CORE_WRITER.js`
  - `255_CBV_OBS_CORE_MENU_HELPERS.js`
  - `300_TASK_OBS_CONFIG.js`
  - `301_TASK_OBS_ADAPTER.js`
  - `307_TASK_OBS_MENU.js`

### 6.2 Target sheets (theo yêu cầu)

- Business: `TASK_MAIN`, `TASK_CHECKLIST`, `TASK_COMMENT`, `TASK_ATTACHMENT`, `TASK_STATUS_HISTORY`, `TASK_EVENT`, `TASK_PERMISSION`, `TASK_CONFIG`
- OBS: `TASK_OBS_HEALTH`, `TASK_OBS_TEST_RUN`, `TASK_OBS_TEST_RESULT`, `TASK_OBS_FINDING`, `TASK_OBS_AUDIT`, `TASK_OBS_EVENT_TRACE`, `TASK_OBS_RUNTIME_METRIC`, `TASK_OBS_AI_EXPORT`, `TASK_OBS_DASHBOARD`, `TASK_OBS_OPERATOR_GUIDE`

## 7. Gap Analysis

> Thang điểm “Mức độ hoàn thiện” là đánh giá theo hiện trạng code trong repo, **không** dựa trên deploy thực tế.

| Hạng mục | Hiện có | Thiếu | Hoàn thiện | Rủi ro | Blocker? | Đề xuất xử lý |
|---|---|---:|---:|---|---|---|
| 1. Deployment/clasp | `.clasp.json.example`, `appsscript.json` | `.clasp.json` thật + `scriptId` thật + xác định bound/standalone | 30% | Không push/test được | **YES** | Phase T0: bind project, tạo `.clasp.json` (khi có scriptId) |
| 2. OBS runtime | Vendored `CBV_Obs_*` | Drift control/versioning | 85% | Drift/namespace collision | NO | T0 chạy baseline; sau đó plan migration Library |
| 3. OBS adapter | `TaskObs_*` + menu | Dashboard refresh/upsert (nice-to-have) | 80% | Chủ yếu là config/props | NO | T0: set props + run |
| 4. TASK DB schema | Có bootstrap cho `TASK_MAIN/CHECKLIST/ATTACHMENT/UPDATE_LOG`; có DON_VI/TASK_TYPE helpers | Thiếu `TASK_COMMENT`, `TASK_STATUS_HISTORY`, `TASK_EVENT`, `TASK_PERMISSION`, `TASK_CONFIG` | 55% | Data model chưa đủ target | NO | T1: bổ sung schema manifest + bootstrap add-only |
| 5. TASK bootstrap | Có `taskBootstrapSheets`, `ensureDonViSheet/seed`, safe repair | Chưa có bootstrap menu operator cho business | 60% | Operator phải chạy function thủ công | NO | T1: `200_TASK_MENU.js` + wrapper UX |
| 6. TASK service | Có `createTask/updateTask` + progress/overdue | Chưa thấy status engine tách riêng; webhook flow chưa có | 60% | Business flow thiếu chuẩn hoá | NO | T2: chuẩn hoá service layer + audit/event |
| 7. TASK status engine | Có transition rules trong validation | Thiếu module `110_TASK_STATUS_ENGINE.js` + history table | 35% | Không audit được status change đầy đủ | NO | T2/T3: status engine + status history |
| 8. TASK AppSheet webhook | Không thấy `doPost`/handler | Thiếu webhook idempotency + audit | 0% | AppSheet có thể viết trực tiếp sheet | NO | T3: `120_TASK_APPSHEET_WEBHOOK.js` |
| 9. TASK WebApp | `appsscript.json` có webapp config nhưng không có handler | Thiếu `130_TASK_WEBAPP.js` + deploy | 10% | Deploy nhầm/không chạy | NO | T3: sau khi webhook ok |
| 10. Main Control connection package | Trong TASK chỉ có optional props + best-effort forward | Thiếu register module/connection package consumption chuẩn | 20% | Tích hợp không ổn định | NO | T4: `040_TASK_MAIN_CONTROL_CLIENT.js` |
| 11. Event bridge | Có emit core event trong service + snapshot sync (nếu core) | Thiếu bridge chuẩn + event sheet/table riêng | 30% | Trace/audit rời rạc | NO | T4: `050_TASK_EVENT_BRIDGE.js` |
| 12. Audit/trace | Có `TASK_UPDATE_LOG`, OBS audit/eventTrace sheets | Thiếu mapping audit thống nhất business vs OBS | 50% | Khó truy vết end-to-end | NO | T2+: chuẩn hoá audit events |
| 13. Menu/operator UX | Có menu cho TASK_OBS | Thiếu menu cho business bootstrap/service ops | 40% | Operator friction | NO | T1: `200_TASK_MENU.js` |
| 14. AI diagnostic export | Có TASK_OBS export sheet | Thiếu module summary to MAIN_CONTROL chạy thật | 60% | Chỉ local | NO | T5: emit summary + refresh dashboard |

## 8. Risks

- **Thiếu `.clasp.json` thật / scriptId**: không thể push/test, mọi đánh giá runtime chỉ dừng ở code review.
- **Chưa có `CBV_TASK_DB_ID`**: TASK_OBS health/self-test sẽ **BLOCKER** ngay.
- **Business code phụ thuộc core/shared runtime**: nếu tách module theo nghĩa “repo/task-only” sẽ không chạy.
- **Vendored OBS core drift**: cần quy trình update version (đặc biệt khi B2/B3 ra đời).
- **`onOpen` có thể conflict**: hiện TASK_OBS tự định nghĩa `onOpen(e)`; nếu TASK sau này có menu khác cũng define `onOpen`, sẽ xung đột.
- **AppSheet source chưa xác định**: chưa có webhook; nguy cơ AppSheet ghi trực tiếp sheet → phá workflow/audit.
- **MAIN_CONTROL chưa dispatch command tới TASK**: mới có forward best-effort; chưa có contract/registry đầy đủ.

## 9. Recommended Roadmap

### Phase T0 — Deployment Binding (ưu tiên)
- Xác định TASK Apps Script project:
  - Bound với TASK DB spreadsheet hay standalone?
- Có `scriptId` thật → tạo `.clasp.json` thật (không tự làm trong báo cáo này).
- Set Script Properties:
  - **Bắt buộc**: `CBV_TASK_DB_ID`
  - **Tuỳ chọn**: `CBV_MAIN_CONTROL_WEBAPP_URL`, `CBV_MAIN_WEBAPP_TOKEN`
- Push thử (sau khi có `.clasp.json`) và chạy:
  - `TaskObs_bootstrapDryRun()`
  - `TaskObs_bootstrap()`
  - `TaskObs_healthCheck()`
  - `TaskObs_runSelfTest()`
  - `TaskObs_generateAiDiagnosticExport()`

### Phase T1 — TASK Schema & Bootstrap
- Tạo/chuẩn hoá schema cho: `TASK_COMMENT`, `TASK_STATUS_HISTORY`, `TASK_EVENT`, `TASK_PERMISSION`, `TASK_CONFIG`
- Bootstrap idempotent add-only + menu bootstrap business (`200_TASK_MENU.js`)

### Phase T2 — TASK Service
- Chuẩn hoá API mutation/query (create/update/status/comment/checklist/attachment)
- Ghi audit/event trace thống nhất (business + OBS)
- Tách `110_TASK_STATUS_ENGINE.js` (transition + history write)

### Phase T3 — TASK WebApp/AppSheet Webhook
- AppSheet không sửa status trực tiếp; gọi webhook
- Idempotency key + audit trail + event emit

### Phase T4 — MAIN_CONTROL Integration
- Register TASK module vào registry (nếu có)
- Consume connection package
- Emit TASK events chuẩn; nhận command nếu cần

### Phase T5 — Full Test/OBS
- Hoàn thiện dashboard/summary
- `TaskObs_emitSummaryToMainControl()` chạy thật (nếu bật)

## 10. Recommended Next Coding Phase

**Chọn Option A (Phase T0 — Deployment Binding + chạy TASK_OBS sạch trước).**

Lý do:
- Hiện **READY_TO_PUSH = NO** (blocker deployment).
- Không nên mở rộng business/webhook khi chưa có baseline push/test + OBS health/self-test xanh.
- T0 cho phép xác nhận ranh giới “bound spreadsheet vs standalone”, từ đó mới thiết kế `030_TASK_DB.js` đúng.

## 11. Test Plan

### T0 (deployment + OBS)
- [ ] Bind `.clasp.json` với `scriptId` thật
- [ ] Set `CBV_TASK_DB_ID`
- [ ] Mở TASK DB → reload spreadsheet để `onOpen` gắn menu `🛡️ TASK OBS`
- [ ] Chạy theo menu:
  - [ ] Bootstrap OBS
  - [ ] Run Health Check (expect OK; nếu thiếu DB ID → BLOCKER)
  - [ ] Run Self Test (expect PASS đa số)
  - [ ] Generate AI Diagnostic Export
- [ ] Verify sheets tồn tại và có log:
  - `TASK_OBS_HEALTH`, `TASK_OBS_TEST_RUN`, `TASK_OBS_TEST_RESULT`, `TASK_OBS_FINDING`, `TASK_OBS_AI_EXPORT`

### T1+ (business)
- [ ] `taskBootstrapSheets()` chạy idempotent
- [ ] `selfAuditTaskSystemFull()` không critical
- [ ] `runAllSystemTests()` (nếu có) pass baseline

## 12. Open Questions

- TASK project sẽ là **bound script** của TASK DB hay **standalone**? (code hiện tại dùng `SpreadsheetApp.getActive()` khá nhiều)
- `CBV_CONFIG` và shared helpers (`_sheet/_rows/...`, `cbvResponse/...`) được cung cấp từ đâu trong project TASK khi push? (cần xác định filePushOrder thực tế ngoài `.example`)
- AppSheet sẽ tích hợp theo hướng nào: trực tiếp table hay webhook-first?
- Contract event giữa TASK ↔ MAIN_CONTROL: event types, payload schema, auth/token, retry semantics?

