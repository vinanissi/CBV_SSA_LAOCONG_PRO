## MAIN_CONTROL_OBS là gì

`MAIN_CONTROL_OBS` là lớp **Local Observability Layer** cho module `MAIN_CONTROL`, dùng để:

- **health check**
- **self test**
- **ghi finding**
- **ghi audit**
- **ghi event trace**
- **ghi runtime metric**
- **xuất AI diagnostic export** (JSON + Markdown) để copy/upload cho ChatGPT phân tích tiếp

Nguyên tắc: **add-only**, **idempotent**, **không rename/xoá** code/sheet/cột cũ, **không hardcode DB ID**, và **OBS writer không làm fail luồng nghiệp vụ chính**.

---

## File đã tạo/sửa

### File tạo mới (OBS)

- `apps-script/main-control/src/300_MC_OBS_SCHEMA.js`
- `apps-script/main-control/src/301_MC_OBS_BOOTSTRAP.js`
- `apps-script/main-control/src/302_MC_OBS_WRITER.js`
- `apps-script/main-control/src/303_MC_OBS_HEALTH.js`
- `apps-script/main-control/src/304_MC_OBS_TEST_RUNNER.js`
- `apps-script/main-control/src/305_MC_OBS_AI_EXPORT.js`
- `apps-script/main-control/src/306_MC_OBS_MODULE_CLIENT.js`
- `apps-script/main-control/src/307_MC_OBS_MENU.js`

### File chỉnh sửa (wire menu)

- `apps-script/main-control/src/90_BOOTSTRAP_MENU.js` (add-only: gọi `buildMainControlObsMenu_()` trong `onOpen()`)

---

## Sheet đã tạo (trong Core DB của MAIN_CONTROL)

Tất cả sheet nằm trong **Core DB** mở bằng `CBV_CORE_DB_ID`.

- `MC_OBS_HEALTH`
- `MC_OBS_TEST_RUN`
- `MC_OBS_TEST_RESULT`
- `MC_OBS_FINDING`
- `MC_OBS_AUDIT`
- `MC_OBS_EVENT_TRACE`
- `MC_OBS_RUNTIME_METRIC`
- `MC_OBS_AI_EXPORT`
- `MC_OBS_DASHBOARD`
- `MC_OBS_OPERATOR_GUIDE`

Ghi chú: schema **add-only** — nếu sheet đã tồn tại thì chỉ **append header thiếu**, không đổi thứ tự header cũ, không xoá header.

---

## Menu thao tác từng bước (Operator-friendly)

Mở spreadsheet MAIN_CONTROL (bound) → refresh → menu:

**`🛡️ MAIN_CONTROL OBS`** (operator-driven)

- `🚀 Bootstrap`
  - `🚀 Bootstrap OBS`
  - `Dry Run Bootstrap`
- `🧪 Health`
  - `🧪 Run Health Check`
  - `📂 Open OBS Dashboard`
- `🧪 Self-Test`
  - `🧪 Run Self Test`
  - `🧪 Run Smoke Test`
  - `🧪 Run Schema Test`
  - `🧪 Generate Sample Data`
  - `📂 Open Latest Test Results`
- `📌 Findings`
  - `📂 Open Findings`
- `📤 AI Export`
  - `📤 Generate AI Diagnostic Export`
  - `📂 Open AI Export`
- `📂 Open Logs`
  - `📂 Open Runtime Metrics`
  - `📂 Open Event Trace`
  - `📂 Open Audit Logs`
- `⚙️ Setup / Repair`
  - `⚙️ Setup WebApp URL`
  - `⚙️ Setup Script Properties`
  - `⚙️ Setup Connection Package Sheet`
  - `⚙️ Repair Registry Headers`
- `📖 Operator Guide`
  - `📖 Operator Guide`
  - `❓ About OBS`

---

## Hàm test cần chạy

Theo thứ tự khuyến nghị:

1. `MC_Obs_bootstrapDryRun()`
2. `MC_Obs_bootstrap()`
3. `MC_Obs_healthCheck()`
4. `MC_Obs_runSelfTest()`
5. `MC_Obs_generateAiDiagnosticExport()`

Operator mode: có thể chạy hết qua menu, không cần mở Apps Script Editor.

---

## Cách xuất dữ liệu gửi ChatGPT

Chạy `MC_Obs_generateAiDiagnosticExport()`, sau đó:

- Mở sheet `MC_OBS_AI_EXPORT`
- copy `EXPORT_JSON` và/hoặc `EXPORT_MARKDOWN`
- gửi cho ChatGPT để phân tích tiếp

Tuỳ chọn Drive export:

- Nếu có cấu hình ScriptProperties `MC_OBS_AI_EXPORT_FOLDER_ID` và folder có quyền truy cập, export sẽ tạo file `.json` và `.md` trong Drive.
- Nếu chưa có folder, export vẫn ghi đầy đủ vào sheet.

---

## MAIN_CONTROL giao tiếp với OBS module khác ở phase sau

Phase hiện tại (`306_MC_OBS_MODULE_CLIENT.js`) chỉ:

- đọc summary nhẹ từ `CBV_MODULE_REGISTRY` (không gọi network)
- chuẩn bị cấu trúc để phase sau có thể gọi OBS của module khác (nếu có `MODULE_WEBAPP_URL` + token)

Không gửi toàn bộ audit/test result chi tiết của module khác trong phase này.

---

## Rủi ro còn lại

- Nếu `CBV_CORE_DB_ID` chưa set đúng, OBS không thể tạo/ghi sheet (health sẽ báo `BLOCKER`).
- Drive export yêu cầu quyền Drive + folder id đúng; nếu thiếu sẽ fallback sheet-only.
- `filePushOrder` cần đầy đủ để tránh thiếu hàm khi chạy menu (đã cập nhật).

---

## Rollback

Rollback an toàn (không xoá sheet/cột):

- Gỡ/ẩn menu bằng cách bỏ call `buildMainControlObsMenu_()` trong `onOpen()` (nếu cần).
- Hoặc giữ nguyên code nhưng không sử dụng menu.
- Dữ liệu OBS là add-only, không ảnh hưởng nghiệp vụ MAIN_CONTROL.

