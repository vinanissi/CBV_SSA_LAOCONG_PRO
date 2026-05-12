## PHASE 80C — HOME_ALERT Operational UX Runtime (AI HANDOFF)

FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/004_PHASE_80C_HOME_ALERT_OPERATIONAL_UX_RUNTIME_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/004_PHASE_80C_HOME_ALERT_OPERATIONAL_UX_RUNTIME_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/003_PHASE_80C_HOME_ALERT_OPERATIONAL_UX_HANDOFF.md`

FILES UPDATED

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` (append UX columns to `HOME_ALERT`)
- `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` (audit optional UX columns)
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js` (UX enrichment + UX test console)
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` (Deck view + DISPLAY_* / CARD_* guidance + hide raw fields)

TEST RESULT

- NOT RUN (local) — run in GAS/Spreadsheet:
  - `HomeAlertUx_TestConsole_run()`

WARNINGS

- UX test console may warn if `HOME_ALERT` has zero rows (no alert scenario).
- `DISPLAY_TIME_AGO` uses simple `Xs/Xm/Xh/Xd ago` format (localize later if needed).

NEXT STEP

- Run `HomeAlert_bootstrap()` to append UX columns on sheet.
- Run `HomeAlertUx_TestConsole_run()` to get GO/FAIL.
- Configure AppSheet deck + hide raw fields per doc.

PRODUCTION READINESS

- READY FOR MANUAL UX PILOT (sheet-driven display, no VC/Bot, no triggers).
- NOT READY FOR AUTO until UX test console is GO and runbook is updated.

DO NOT CHANGE

- Không dùng Virtual Column.
- Không dùng AppSheet Bot/Automation.
- Không đưa logic UX sang AppSheet formula phức tạp.
- Không sửa TASK/FIN schema hoặc logic.
- Không tạo production trigger.
- Không xoá/rename cột cũ; chỉ append.
- Không phá state machine đã có ở phase 80B.

AI HANDOFF SUMMARY

PHASE 80C bổ sung “Operational Cockpit UX” cho HOME_ALERT bằng cách append các cột `DISPLAY_*`, `CARD_*`, `UX_*` vào schema và tính toàn bộ giá trị qua GAS (`HomeAlert_enrichUxFields_`). `refresh` và `transition` đều cập nhật UX fields, giúp AppSheet Deck view chỉ cần hiển thị cột UX và bấm action, không cần VC/Bot.

