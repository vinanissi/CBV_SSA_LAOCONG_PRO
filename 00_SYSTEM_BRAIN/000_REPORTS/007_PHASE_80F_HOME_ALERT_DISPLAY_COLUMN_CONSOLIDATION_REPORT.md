## PHASE 80F — HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION (REPORT)

### Precheck

- Branch: `phase/from-v2.4.1-TASK-FIN` (required).
- **Warning:** `.clasp.json` có thể dirty trên máy dev — **không** commit trong phase 80F nếu không thuộc scope.

### Goal

Chốt **chuẩn hiển thị operator** vs **legacy** (80C–80D) vs **Admin Debug**; không xóa/rename cột; không thêm nhóm display mới trong GAS.

### DISPLAY STANDARD SUMMARY

- **Operator Deck:** Primary `OPERATOR_PRIMARY_TEXT`, Secondary `OPERATOR_SECONDARY_TEXT`, Summary `OPERATOR_META_TEXT`, Next `OPERATOR_NEXT_ACTION`, **Group** `ATTENTION_LABEL`, **Sort** `DESKTOP_SORT` DESC (sort column không Show).
- **Operator Detail:** §B trong `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` (gồm `ATTENTION_LABEL`, `ATTENTION_REASON`, `ACTION_*`, `OWNER_LABEL`, `STATUS`, `DUE_AT`, `NOTE`).
- **Backend-only (ẩn operator):** `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`, trace/payload/fingerprint keys — xem file chuẩn §C.
- **Legacy:** `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` — sheet + Admin Debug; **không** bind operator Deck sau 80F.

### FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/007_PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/007_PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION_REPORT.md` *(this file)*
- `00_SYSTEM_BRAIN/001_HANDOFF/006_PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION_HANDOFF.md`
- `04_APPSHEET/HOME_ALERT_DISPLAY_COLUMN_STANDARD.md`

### FILES UPDATED

- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js` — `HomeAlert_getOfficialOperatorDisplayConfig_`, `HomeAlert_validateOperatorDisplayPolicy_`, `HomeAlertDisplayStandard_TestConsole_*` (+ small helpers).
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` — §0 official standard, §9 group = `ATTENTION_LABEL`, §10 consolidation.
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md` — 80F canonical deck/detail, checklist, tests.

### TEST RESULT

- **NOT RUN (local)** — GAS/Spreadsheet: `HomeAlertDisplayStandard_TestConsole_run()`.

### WARNINGS

- `.clasp.json` dirty: không gộp commit phase 80F.
- Cột optional `ALERT_FINGERPRINT` / `ALERT_GROUP_KEY` nếu không có trên sheet → policy validate chỉ **warning**.

### NEXT STEP

- Chạy `HomeAlert_bootstrap()` (nếu thiếu cột) → `HomeAlert_refresh()` → `HomeAlertDisplayStandard_TestConsole_run()`.
- Rà AppSheet operator views theo `HOME_ALERT_DISPLAY_COLUMN_STANDARD.md`.

### PRODUCTION READINESS

- **READY** sau GO test trên spreadsheet + cấu hình AppSheet operator bám chuẩn 80F.
- **NOT READY** nếu operator view vẫn bind `DISPLAY_*` / `DESKTOP_*` làm header.

### DRIVE ONLINE OUTPUT TARGET

- `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` — không upload tự động phase này.
