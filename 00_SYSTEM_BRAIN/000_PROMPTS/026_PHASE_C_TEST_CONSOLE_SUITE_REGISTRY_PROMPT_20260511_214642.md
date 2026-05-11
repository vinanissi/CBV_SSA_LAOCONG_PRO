# PHASE C — CBV Test Console Suite Registry

Archived operator prompt (non-destructive append).

---

PHASE C — CBV Test Console Suite Registry

Refactor Test Console Runtime V2 để thêm Suite Registry.

Mục tiêu:
- Không hard-code test suite trong menu.
- Tất cả domain test đăng ký qua registry.
- Test Console tự build menu từ registry.
- Các test cũ còn nằm ở WEBAPP / CONFIG / HOSO / OBS được gom dần vào Test Console.
- Không destructive, không overwrite report, append-only.

Tạo file:
apps-script/main-control/src/326_CBV_TEST_CONSOLE_SUITE_REGISTRY.js

Nếu cần, sync canonical:
apps-script/production-core/src/CBV_TEST_CONSOLE_SUITE_REGISTRY.js

Registry item format:

{
  suiteCode,
  domain,
  label,
  runnerFnName,
  scope,
  destructive,
  productionSafe,
  enabled,
  description
}

Suite mặc định:
- TEST_CONSOLE_RUNTIME
- TEST_CONSOLE_DRIVE_EXPORTER
- MAIN_CONTROL_OBS
- MAIN_CONTROL_RUNTIME
- CONFIG_RUNTIME
- WEBAPP_RUNTIME
- HOSO_RUNTIME
- TASK_RUNTIME

Yêu cầu:
1. CBV_TestConsole_listSuites_()
2. CBV_TestConsole_getSuite_(suiteCode)
3. CBV_TestConsole_registerDefaultSuites_()
4. CBV_TestConsole_runRegisteredSuite_(suiteCode)
5. Menu 🧪 CBV Test Console build từ registry.
6. Nếu runnerFnName chưa tồn tại thì report WARNING, không crash.
7. Không cho chạy suite destructive.
8. Export report Drive vẫn dùng prefix 000-999.
9. Lưu prompt vào 00_SYSTEM_BRAIN/000_PROMPTS.
10. Lưu report vào 00_SYSTEM_BRAIN/000_REPORTS.
11. Git add/commit/push/tag nếu cần.
