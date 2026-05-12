## PHASE 80A — HOME_ALERT (AI HANDOFF)

### Files created

- `00_SYSTEM_BRAIN/000_PROMPTS/001_PHASE_80A_HOME_ALERT_SHEET_DRIVEN_RUNTIME_PROMPT.md`
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`
- `00_SYSTEM_BRAIN/000_REPORTS/001_PHASE_80A_HOME_ALERT_SHEET_DRIVEN_RUNTIME_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/001_PHASE_80A_HOME_ALERT_HANDOFF.md`

### Files updated

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` (add `CBV_SCHEMA_MANIFEST.HOME_ALERT`)
- `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` (add `CBV_AUDIT_SCHEMA.HOME_ALERT`)

### Test result

- Local repo: **NOT RUN** (cần GAS + Spreadsheet runtime).
- GAS manual: chạy `HomeAlert_TestConsole_run()` để lấy report contract `CBV_TEST_CONSOLE_V1`.

### Warnings

- Không có trigger auto-refresh (đúng yêu cầu “không auto-trigger trước khi test GO”).
- Refresh không tự tắt alert cũ; operator resolve thủ công.
- `RELATED_RECORD_URL` để trống (chưa có chuẩn deep-link trong scope).

### Next step

- Trong GAS: chạy `HomeAlert_bootstrap()` → `HomeAlert_TestConsole_run()`.
- Nếu test console `GO`, cấu hình AppSheet theo `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`.
- Sau khi vận hành ổn định mới xem xét trigger/time-driven (auto-later).

### Production readiness

- **READY FOR MANUAL PILOT** (manual run, sheet-driven, có audit/trace, không bot/VC).
- **NOT READY FOR AUTO** cho tới khi test console đạt `GO` trong môi trường thật và có runbook vận hành (tần suất refresh, SLA resolve).

### Do not change

- Không đưa logic alert sang AppSheet (no VC, no complex app formula).
- Không dùng AppSheet Bot/Automation cho HOME_ALERT.
- Không xoá alert rows; chỉ update trạng thái / insert mới.
- Giữ `ALERT_ID` deterministic theo `SOURCE_HASH` để idempotent.

### AI handoff summary

Đã tạo runtime `HOME_ALERT` theo chuẩn sheet-driven: schema manifest + audit schema, GAS refresh idempotent (SOURCE_HASH + TRACE_ID), resolve có audit append-only qua `ADMIN_AUDIT_LOG`, và tài liệu AppSheet setup tối giản. Việc còn lại là chạy test console trong GAS để chốt GO/FAIL và triển khai view/slice/action trên AppSheet.

