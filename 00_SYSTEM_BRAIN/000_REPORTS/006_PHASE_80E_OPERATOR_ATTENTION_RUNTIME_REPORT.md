## PHASE 80E — OPERATOR_ATTENTION_RUNTIME (REPORT)

### Precheck snapshot

```powershell
git status -sb
## phase/from-v2.4.1-TASK-FIN...origin/phase/from-v2.4.1-TASK-FIN

git branch --show-current
phase/from-v2.4.1-TASK-FIN

git remote -v
origin  git@github.com:vinanissi/CBV_SSA_LAOCONG_PRO.git (fetch)
origin  git@github.com:vinanissi/CBV_SSA_LAOCONG_PRO.git (push)
```

### Goal

Nâng HOME_ALERT thành **Operator Attention Runtime**: attention level + operator-facing text (`OPERATOR_*`), ẩn sort key khỏi UI operator (chỉ dùng sort backend).

### Schema changes (append-only)

Append vào `CBV_SCHEMA_MANIFEST.HOME_ALERT` và `CBV_AUDIT_SCHEMA.HOME_ALERT.optionalColumns`:

- `ATTENTION_LEVEL`, `ATTENTION_LABEL`, `ATTENTION_ICON`, `ATTENTION_COLOR`, `ATTENTION_REASON`
- `ACTION_FOCUS`, `ACTION_HINT`, `ACTION_PRIORITY`
- `OWNER_LABEL`, `OWNER_QUEUE`
- `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`, `OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`, `OPERATOR_HIDE_SORT_KEYS`

Không xoá/rename cột cũ; giữ `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*`.

### Runtime changes

`05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`:

- `HomeAlert_enrichAttentionFields_(alert)` + helpers theo tên phase (`HomeAlert_getAttentionLevel_`, …, `HomeAlert_buildOperatorNextAction_`).
- `HomeAlert_getActionHint_(alert)` — cột `ACTION_HINT` (khác `HomeAlert_getUxActionHint_` / `UX_ACTION_HINT`).
- Gọi `HomeAlert_enrichAttentionFields_()` cuối `HomeAlert_enrichDesktopUxFields_()` (sau khi đã có `DESKTOP_*`).
- `HomeAlert_mergeIncomingWithExisting_()` refresh thêm các cột attention/operator.
- `HomeAlert_buildAlert_()` placeholder cho cột mới.
- Test console: `HomeAlertAttention_TestConsole_run()`, `_showReport()`, `_copyAiHandoff()`.

### AppSheet doc

- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`: §9 Operator Attention — `ALERT_List`/`ALERT_Detail` operator; không show `CARD_SORT` / `DESKTOP_SORT` / `SORT_KEY`; sort backend `DESKTOP_SORT` DESC.
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md`: cập nhật operator deck/detail theo 80E; checklist tránh lộ sort; admin debug vẫn xem raw.

### Test result

- **NOT RUN (local)** — chạy trong GAS/Spreadsheet: `HomeAlert_bootstrap()` → `HomeAlertAttention_TestConsole_run()`.

### Warnings

- `.clasp.json` có thể đang dirty sẵn trên máy dev — **không commit** trong phase 80E nếu không thuộc scope.
- `OPERATOR_HIDE_SORT_KEYS` là cờ nhắc vận hành (sheet boolean); operator view vẫn phải **ẩn cột** sort trong AppSheet.

### Next step

- GAS: `HomeAlert_bootstrap()` append cột → `HomeAlert_refresh()` → `HomeAlertAttention_TestConsole_run()`.
- AppSheet: cấu hình Deck/Detail theo §9; checklist trong `HOME_ALERT_DESKTOP_WORKSPACE.md`.

### Production readiness

- **READY FOR MANUAL OPERATOR ATTENTION PILOT** sau khi test console GO trên spreadsheet thật.
- **NOT READY FOR AUTO** — không trigger, không Drive upload tự động.

### Drive online output target

- Folder: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- Script Property đề xuất: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- **Không upload tự động** trong phase này.

### FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/006_PHASE_80E_OPERATOR_ATTENTION_RUNTIME_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/006_PHASE_80E_OPERATOR_ATTENTION_RUNTIME_REPORT.md` *(this file)*
- `00_SYSTEM_BRAIN/001_HANDOFF/005_PHASE_80E_OPERATOR_ATTENTION_HANDOFF.md`

### FILES UPDATED

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`
- `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js`
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md`
