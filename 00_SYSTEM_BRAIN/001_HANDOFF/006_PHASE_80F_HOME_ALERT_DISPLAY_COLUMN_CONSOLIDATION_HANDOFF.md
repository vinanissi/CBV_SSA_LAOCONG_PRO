## PHASE 80F — HOME_ALERT Display Column Consolidation (AI HANDOFF)

FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/007_PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/007_PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/006_PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION_HANDOFF.md`
- `04_APPSHEET/HOME_ALERT_DISPLAY_COLUMN_STANDARD.md`

FILES UPDATED

- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md`

TEST RESULT

- NOT RUN (local) — `HomeAlertDisplayStandard_TestConsole_run()` trong GAS.

WARNINGS

- Không commit `.clasp.json` nếu dirty ngoài phase.
- Optional columns `ALERT_FINGERPRINT` / `ALERT_GROUP_KEY` có thể thiếu → chỉ warning trong policy validate.

NEXT STEP

- Bootstrap/refresh nếu cần → chạy `HomeAlertDisplayStandard_TestConsole_run()` → cập nhật AppSheet operator theo `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md`.

PRODUCTION READINESS

- READY sau GO + AppSheet operator đúng chuẩn; NOT READY nếu còn bind legacy làm Deck header.

DO NOT CHANGE

- Không xóa/rename cột legacy; không thêm nhóm display column mới; không VC/Bot/formula phức tạp; không TASK/FIN schema; không trigger; không Drive auto upload; không sửa repo khác.

DRIVE ONLINE OUTPUT TARGET

- Folder: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- Script Property: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID` — document only, no auto upload.

DISPLAY STANDARD SUMMARY

- Operator: `OPERATOR_*` + `ATTENTION_LABEL` (group) + detail fields §B trong `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md`; sort backend `DESKTOP_SORT` DESC only (hidden).
- Legacy `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*`: sheet + Admin Debug; không dùng operator Deck headers sau 80F.

AI HANDOFF SUMMARY

Phase 80F **tài liệu hóa và chốt** chuẩn cột: file `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` là single source of truth cho AppSheet operator; GAS chỉ thêm `HomeAlert_getOfficialOperatorDisplayConfig_` / `HomeAlert_validateOperatorDisplayPolicy_` và test console **không** thêm cột mới hay đổi enrich runtime. Legacy vẫn enrich để backward compatible; operator UI chuyển hẳn sang `OPERATOR_*` + `ATTENTION_LABEL` group.
