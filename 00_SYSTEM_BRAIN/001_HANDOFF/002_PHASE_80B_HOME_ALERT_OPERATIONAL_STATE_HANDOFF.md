## PHASE 80B — HOME_ALERT Operational State Runtime (AI HANDOFF)

### Files created

- `00_SYSTEM_BRAIN/000_PROMPTS/002_PHASE_80B_HOME_ALERT_OPERATIONAL_STATE_RUNTIME_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/002_PHASE_80B_HOME_ALERT_OPERATIONAL_STATE_RUNTIME_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/002_PHASE_80B_HOME_ALERT_OPERATIONAL_STATE_HANDOFF.md`

### Files updated

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` (append operational columns for `HOME_ALERT`)
- `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` (audit optional columns for `HOME_ALERT`)
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js` (state machine + transitions + refresh merge rules)
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` (operational actions doc)

### Test result

- Local repo: **NOT RUN** (needs GAS + Spreadsheet).
- Run in GAS: `HomeAlert_TestConsole_run()` (phase string now `PHASE_80B_HOME_ALERT_OPERATIONAL_STATE_RUNTIME`).

### Warnings

- `HomeAlert_refresh()` mặc định manual-first: không auto clear/expire.
- Nếu muốn `AUTO_CLEARED`/`EXPIRED` tự động, cần bật options khi gọi refresh và phải có quy ước vận hành.

### Next step

- Trong GAS: chạy `HomeAlert_bootstrap()` để append cột mới cho `HOME_ALERT`.
- Chạy `HomeAlert_TestConsole_run()` để chốt GO/FAIL.
- Cấu hình AppSheet: tạo actions ACK/IN_PROGRESS/WAIT/ESCALATE/RESOLVE theo doc.

### Production readiness

- **READY FOR MANUAL OPS STATE** (manual transitions qua action; refresh không đè status).
- **AUTO mode** (auto clear/expire) chỉ bật sau khi có test GO + runbook/SLA.

### Do not change

- Không dùng Virtual Column.
- Không dùng AppSheet Bot/Automation.
- Không chuyển logic state machine sang AppSheet.
- Không xoá alert rows; chỉ update trạng thái + timestamps.
- Giữ nguyên `ALERT_ID` deterministic theo `SOURCE_HASH` (idempotent).

### AI handoff summary

Đã nâng `HOME_ALERT` thành operational runtime với state machine + các hàm transition và cột operational timestamps/actors (append-only). `refresh` được chỉnh để không đè trạng thái vận hành do người thao tác, đảm bảo manual-first; auto-clear/expire có hàm hỗ trợ nhưng mặc định tắt.

