## TASK OBS Runtime Vendoring

### 1. Why vendoring is used in this phase

Phase **OBS-C1-RUNTIME** cần `TASK_OBS` chạy thật trong project TASK, nhưng phase này **không dùng GAS Library** và không tạo dependency runtime sang `core-runtime-lib`.

Vì vậy ta **vendor (copy local)** `CBV_OBS_CORE B1` vào `apps-script/task/src` để:

- đảm bảo các hàm `CBV_Obs_*` tồn tại trong cùng project TASK
- giữ load order rõ ràng qua `filePushOrder`
- tránh refactor code đang chạy ở MAIN_CONTROL và core-runtime-lib

---

### 2. Files vendored

Các file vendored vào TASK project:

- `apps-script/task/src/250_CBV_OBS_CORE_SCHEMA.js`
  - vendored từ `apps-script/core-runtime-lib/src/300_CBV_OBS_CORE_SCHEMA.js`
  - version: `0.1.0`
- `apps-script/task/src/251_CBV_OBS_CORE_WRITER.js`
  - vendored từ `apps-script/core-runtime-lib/src/301_CBV_OBS_CORE_WRITER.js`
  - version: `0.1.0`
- `apps-script/task/src/255_CBV_OBS_CORE_MENU_HELPERS.js`
  - vendored từ `apps-script/core-runtime-lib/src/305_CBV_OBS_CORE_MENU_HELPERS.js`
  - version: `0.1.0`

Mỗi file có header comment:

- `// VENDORED FROM core-runtime-lib`
- `// SOURCE: ...`
- `// VERSION: 0.1.0`

---

### 3. Load order requirements

Trong `apps-script/task/.clasp.json.example`, đảm bảo thứ tự:

1. `250_CBV_OBS_CORE_SCHEMA.js`
2. `251_CBV_OBS_CORE_WRITER.js`
3. `255_CBV_OBS_CORE_MENU_HELPERS.js`
4. `300_TASK_OBS_CONFIG.js`
5. `301_TASK_OBS_ADAPTER.js`
6. `307_TASK_OBS_MENU.js`

Lý do: `TASK_OBS` adapter/menu gọi trực tiếp `CBV_Obs_*` nên core phải load trước.

---

### 4. Risks

- **Drift version**: core-runtime-lib có thể tiến hoá, nhưng TASK đang dùng snapshot vendored `0.1.0`.
- **Global namespace collisions**: nếu TASK project sau này có thêm file khác định nghĩa `CBV_Obs_*` sẽ xung đột.
- **Double-maintenance**: bugfix ở core-runtime-lib cần cherry-pick vào vendored files nếu muốn TASK nhận fix.

---

### 5. Future migration to GAS Library or shared runtime

Khi ổn định:

- Option A: chuyển `CBV_OBS_CORE` thành GAS Library và link từ TASK/FINANCE/…
- Option B: giữ monorepo nhưng build/push pipeline để “bundle shared runtime” vào từng project tự động (không copy tay).

---

### 6. How TASK_OBS now resolves CBV_Obs_* locally

Sau phase này:

- `TaskObs_*` gọi `CBV_Obs_*` trực tiếp
- `CBV_Obs_*` được cung cấp bởi 3 file vendored trong chính project TASK
- DB resolver vẫn do `TaskObs_openTaskDb_()` quyết định (đọc `CBV_TASK_DB_ID`)

---

### Test plan (không chạy trong phase này)

Operator có thể chạy:

- `TaskObs_bootstrapDryRun()`
- `TaskObs_bootstrap()`
- `TaskObs_healthCheck()`
- `TaskObs_runSelfTest()`
- `TaskObs_generateAiDiagnosticExport()`

Expected:

- tạo được `TASK_OBS_HEALTH`, `TASK_OBS_TEST_RUN`, `TASK_OBS_FINDING`
- health/self-test không còn lỗi “thiếu CBV_Obs_* runtime”

