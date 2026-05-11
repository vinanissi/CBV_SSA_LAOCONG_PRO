# TASK T0 Deployment Binding Audit

## 1. Executive Summary

Phase **T0** (Deployment Binding + TASK_OBS runtime test readiness) cho module `apps-script/task` hiện tại cho thấy:

- **READY_TO_PUSH = NO** vì **không có** `apps-script/task/.clasp.json` thật và `scriptId` trong `apps-script/task/.clasp.json.example` đang là **placeholder**.
- **TASK_OBS_READY_FOR_RUNTIME = YES (về mặt code)**: đã có `TaskObs_*` adapter + **vendored** `CBV_Obs_*` runtime ngay trong project TASK, và `filePushOrder` đã đúng thứ tự core→adapter→menu.
- **Go/No-Go cho T1**: **NO-GO** cho đến khi có binding (scriptId thật + `.clasp.json` thật) và set `CBV_TASK_DB_ID`, sau đó chạy bootstrap/health/self-test đạt tiêu chí.

## 2. Deployment Binding Status

- **DEPLOYMENT_BINDING_STATUS**: **UNBOUND**
- **TASK_SCRIPT_ID_STATUS**: **PLACEHOLDER**
- **TASK_DB_BINDING_RECOMMENDATION**: **BOUND_TO_TASK_DB**
  - Lý do: nhiều business file trong TASK sử dụng `SpreadsheetApp.getActive()` (ngầm định bound spreadsheet). Nếu chọn standalone vẫn làm được, nhưng sẽ cần chuẩn hoá “open DB by id” cho business layer (ngoài scope T0).

## 3. CLASP Status

### 3.1 File tồn tại

- `apps-script/task/.clasp.json`: **không tồn tại**
- `apps-script/task/.clasp.json.example`: **tồn tại**
- `apps-script/task/src/appsscript.json`: **tồn tại**

### 3.2 `.clasp.json.example` kiểm tra nhanh

- `scriptId`: `PASTE_TASK_SCRIPT_ID_HERE` → **placeholder**
- `rootDir`: `src` → **đúng**
- `filePushOrder`: **có đủ** các file OBS + vendored core + business files hiện hữu (theo danh sách trong file)

### 3.3 Load order OBS (bắt buộc) — kiểm tra

Trong `filePushOrder`, thứ tự hiện tại là:

1. `250_CBV_OBS_CORE_SCHEMA.js`
2. `251_CBV_OBS_CORE_WRITER.js`
3. `255_CBV_OBS_CORE_MENU_HELPERS.js`
4. `300_TASK_OBS_CONFIG.js`
5. `301_TASK_OBS_ADAPTER.js`
6. `307_TASK_OBS_MENU.js`

→ **Đúng yêu cầu** (core trước adapter/menu).

### 3.4 `onOpen` conflict audit

- Trong `apps-script/task/src` hiện chỉ thấy **01** định nghĩa `function onOpen(e)` trong `307_TASK_OBS_MENU.js`.
- **Rủi ro tương lai**: nếu sau này TASK có thêm menu/business menu cũng khai báo `onOpen`, sẽ xung đột (Apps Script chỉ cho 1 `onOpen`).
- **T0 kết luận**: hiện tại **chưa conflict**, nhưng cần quy ước “menu aggregator” trong phase sau (không làm ở T0).

### 3.5 ScriptId có xuất hiện ở đâu khác trong repo không?

- Trong repo, `scriptId` thật được thấy ở `apps-script/main-control/.clasp.json.example`.
- Đối với TASK: chỉ thấy placeholder trong `.clasp.json.example`.

→ **BLOCKER**: chưa có scriptId thật để bind.

## 4. Script Properties Requirements

### 4.1 Checklist (từ code TASK_OBS)

| PROP_KEY | REQUIRED_LEVEL | USED_BY | PURPOSE | STATUS | HOW_TO_SET |
|---|---|---|---|---|---|
| `CBV_TASK_DB_ID` | REQUIRED | `TaskObs_openTaskDb_()` (`300_TASK_OBS_CONFIG.js`) + health/self-test | Spreadsheet ID của TASK DB (mở DB để tạo sheet OBS) | REQUIRED_TO_SET | Apps Script → Project Settings → Script properties → Add `CBV_TASK_DB_ID` = Spreadsheet ID |
| `CBV_MAIN_CONTROL_WEBAPP_URL` | OPTIONAL | `TaskObs_healthCheck()` + `TaskObs_emitSummaryToMainControl()` | URL WebApp MAIN_CONTROL để emit summary (nếu dùng) | UNKNOWN / OPTIONAL | Set Script property nếu muốn integration |
| `CBV_MAIN_WEBAPP_TOKEN` | OPTIONAL | `TaskObs_healthCheck()` + `TaskObs_emitSummaryToMainControl()` | Token auth khi gọi MAIN_CONTROL WebApp | UNKNOWN / OPTIONAL | Set Script property nếu muốn integration |

### 4.2 Script Properties business TASK (trong scope scan)

Trong các file TASK business đã scan, **không thấy** pattern `PropertiesService.getScriptProperties().getProperty('...')` ngoài các key của TASK_OBS ở trên.

→ T0: chỉ cần set **`CBV_TASK_DB_ID`** để chạy OBS runtime test.

## 5. TASK_OBS Runtime Readiness

- **TASK_OBS_READY_FOR_RUNTIME = YES** (về mặt code trong repo)

### 5.1 Evidence theo checklist

- `CBV_Obs_* runtime đã có trong TASK project`: **YES** (`250_`, `251_`, `255_`)
- `TaskObs_getConfig` moduleCode/modulePrefix: **OK** (`TASK`/`TASK`)
- `TaskObs_openTaskDb_` dùng `CBV_TASK_DB_ID`: **OK**
- `TaskObs_bootstrap` gọi `CBV_Obs_ensureSheets`: **OK**
- `TaskObs_healthCheck` kiểm tra thiếu `CBV_Obs_*`: **OK** (list coreMissing, ghi findings)
- `TaskObs_runSelfTest` ghi `TEST_RUN/TEST_RESULT` và `FINDING` khi WARN/ERROR/BLOCKER: **OK**
- `TaskObs_generateAiDiagnosticExport` ghi `TASK_OBS_AI_EXPORT`: **OK** (append AI export row)
- Menu `🛡️ TASK OBS` có đủ item chính: **OK**
- `filePushOrder` đúng `250 → 251 → 255 → 300 → 301 → 307`: **OK**

### 5.2 Điểm nghẽn runtime (không phải code)

- Nếu chưa set `CBV_TASK_DB_ID` hoặc sheet ID không mở được → health/self-test sẽ **BLOCKER** (đúng thiết kế).
- Nếu project TASK chưa push (do chưa bind clasp) → runtime không chạy được.

## 6. Shared Runtime Dependency Audit

Mục tiêu phần này là tách:
- **OBS có thể chạy độc lập không?** → gần như **có**, chỉ cần GAS built-ins + Script Properties + Spreadsheet openById.
- **Business TASK có thể chạy độc lập chưa?** → **chưa**, vì phụ thuộc nhiều core/shared runtime symbols ngoài folder TASK.

### 6.1 Bảng dependency symbols (từ scan các business files)

| SYMBOL / FUNCTION / CONSTANT | FOUND_IN_FILES | TYPE | PROVIDED_BY_CURRENT_TASK_PROJECT | RISK | REQUIRED_FOR_OBS_ONLY | REQUIRED_FOR_BUSINESS | NEXT ACTION |
|---|---|---|---|---|---|---|---|
| `CBV_CONFIG` | `20_TASK_REPOSITORY.js`, `20_TASK_STATUS_SNAPSHOT.js`, `96_TASK_SYSTEM_AUDIT_REPAIR.js`, `97_TASK_SYSTEM_TEST_RUNNER.js`, debug test | CONFIG | UNKNOWN | Business không chạy nếu thiếu mapping SHEETS | NO | YES | T0: xác định TASK project push có kèm core config file(s) nào |
| `CBV_SCHEMA_MANIFEST` | `96_TASK_SYSTEM_AUDIT_REPAIR.js`, `97_TASK_SYSTEM_TEST_RUNNER.js` | SCHEMA | UNKNOWN | Audit/repair/test không đủ schema | NO | YES | T1/T0+: verify schema bootstrap layer nguồn |
| `cbvResponse` | `20_TASK_SERVICE.js` | CORE_UTIL | UNKNOWN | API return shape phụ thuộc | NO | YES | T0: ensure core util included in deployment |
| `cbvNow`, `cbvUser`, `cbvMakeId` | `20_TASK_SERVICE.js`, bootstrap/migration/audit | CORE_UTIL | UNKNOWN | Create/update/audit timestamps/ids | NO | YES | T0: ensure core util included |
| `cbvAssert` | `20_TASK_VALIDATION.js`, `20_TASK_SERVICE.js`, debug | VALIDATION | UNKNOWN | Workflow enforcement fail | NO | YES | T0: ensure core validation helper included |
| `ensureRequired`, `ensureMaxLength` | `20_TASK_VALIDATION.js`, `20_TASK_SERVICE.js` | VALIDATION | UNKNOWN | Payload validation fail | NO | YES | T0: ensure helper included |
| `assertActiveUserId` | `20_TASK_VALIDATION.js`, `20_TASK_SERVICE.js` | VALIDATION | UNKNOWN | User ref validation fail | NO | YES | T0: ensure user service included |
| `assertValidEnumValue` | `20_TASK_VALIDATION.js`, `20_TASK_SERVICE.js` | VALIDATION | UNKNOWN | Enum validation fail | NO | YES | T0: ensure enum service included |
| `_sheet`, `_rows`, `_findById`, `_appendRecord`, `_updateRow` | `20_TASK_REPOSITORY.js` (+ audit) | SHEET_HELPER | UNKNOWN | Repository layer không hoạt động | NO | YES | T0: verify shared repository layer included |
| `ensureSheetExists`, `getSchemaHeaders`, `ensureHeadersMatchOrReport`, `_writeHeaders` | `90_BOOTSTRAP_TASK.js` | SHEET_HELPER | UNKNOWN | bootstrap business tables fail | NO | YES | T0: verify bootstrap/schema helpers included |
| `loadSheetDataSafe` | `96_TASK_SYSTEM_AUDIT_REPAIR.js`, `97_TASK_SYSTEM_TEST_RUNNER.js` | SHEET_HELPER | UNKNOWN | audit/test runner thiếu loader | NO | YES | T0: verify loader included |
| `cbvTryEmitCoreEvent_` | `20_TASK_SERVICE.js`, `20_TASK_STATUS_SNAPSHOT.js` | EVENT | UNKNOWN | Event emission optional/best-effort | NO | YES (nhưng best-effort) | T0: nếu thiếu vẫn chạy business (mất event) |
| `mainEventTryForward_` | `20_TASK_SERVICE.js` | MAIN_CONTROL_BRIDGE | UNKNOWN | Forward event sang MAIN_CONTROL best-effort | NO | NO (best-effort) | T0: không blocker |

### 6.2 Kết luận tách OBS vs Business

- **OBS runtime**: chạy được “tương đối độc lập” trong TASK project vì chỉ cần `SpreadsheetApp.openById` + Script Properties + vendored `CBV_Obs_*`.
- **Business TASK**: **không thể coi là độc lập** nếu chỉ push mỗi folder TASK, vì còn thiếu rõ ràng các core/shared runtime providers.

## 7. Blockers

### 7.1 Blocker để push/test (Deployment)

1. **Không có** `apps-script/task/.clasp.json` thật
2. `apps-script/task/.clasp.json.example` có `scriptId` **placeholder**

→ Không thể push bằng clasp trong phạm vi repo hiện tại nếu chưa có scriptId thật.

### 7.2 Blocker để chạy TASK_OBS (Runtime)

1. **Chưa set** Script Property `CBV_TASK_DB_ID` (hoặc set sai / không mở được spreadsheet)

## 8. Operator Runbook

### Trường hợp A — Hiện tại chưa có scriptId (đúng trạng thái repo)

1. Mở Google Sheet **TASK DB** (file spreadsheet mà bạn muốn dùng làm DB cho TASK).
2. Vào **Extensions → Apps Script** để mở Apps Script editor bound với sheet đó.
3. Copy **Script ID** (Project Settings / hoặc URL project có `/projects/<SCRIPT_ID>/`).
4. Tại repo: tạo file `apps-script/task/.clasp.json` bằng cách **copy** từ `apps-script/task/.clasp.json.example`.
5. Thay `"scriptId": "PASTE_TASK_SCRIPT_ID_HERE"` bằng scriptId thật.
6. Xác nhận `"rootDir": "src"` và `"fileExtension": "js"` giữ nguyên.
7. Set Script Property trong Apps Script editor:
   - `CBV_TASK_DB_ID` = Spreadsheet ID của TASK DB (lấy từ URL sheet).
8. Chạy lệnh push (tại `apps-script/task`):
   - `clasp push -f`
9. Reload lại TASK DB spreadsheet.
10. Dùng menu **`🛡️ TASK OBS`**:
   - Bootstrap OBS
   - Run Health Check
   - Run Self Test
   - Generate AI Diagnostic Export

### Trường hợp B — Nếu đã có scriptId (sau khi bạn bind)

Làm tương tự nhưng bỏ qua bước tìm scriptId; đảm bảo `.clasp.json` trỏ đúng project.

## 9. Test Plan (T0)

Sau khi đã push và set `CBV_TASK_DB_ID`:

1. `TaskObs_bootstrapDryRun()` (hoặc menu Dry Run Bootstrap)  
2. `TaskObs_bootstrap()` (Bootstrap OBS)  
3. `TaskObs_healthCheck()` (Run Health Check)  
4. `TaskObs_runSelfTest()` (Run Self Test)  
5. `TaskObs_generateAiDiagnosticExport()` (Generate AI Diagnostic Export)  

Expected tối thiểu:
- Có các sheet OBS: `TASK_OBS_HEALTH`, `TASK_OBS_TEST_RUN`, `TASK_OBS_TEST_RESULT`, `TASK_OBS_FINDING`, `TASK_OBS_AI_EXPORT`
- HealthCheck **không BLOCKER** (đặc biệt `CBV_TASK_DB_ID`)
- Self-test **không ERROR/BLOCKER**

## 10. Go / No-Go Decision for T1

### GO (đủ điều kiện sang T1) khi
- Có `apps-script/task/.clasp.json` thật
- Có `scriptId` thật (không placeholder)
- Đã set `CBV_TASK_DB_ID`
- `TaskObs_bootstrap()` OK
- `TaskObs_healthCheck()` không BLOCKER
- `TaskObs_runSelfTest()` không ERROR/BLOCKER

### NO-GO khi
- Thiếu bất kỳ deployment blocker nào (đặc biệt `.clasp.json` và scriptId)
- Hoặc `CBV_TASK_DB_ID` chưa set / mở DB fail
- Hoặc self-test còn ERROR/BLOCKER

