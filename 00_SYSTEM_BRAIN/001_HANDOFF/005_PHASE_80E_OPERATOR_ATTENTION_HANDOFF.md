## PHASE 80E — Operator Attention Runtime (AI HANDOFF)

FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/006_PHASE_80E_OPERATOR_ATTENTION_RUNTIME_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/006_PHASE_80E_OPERATOR_ATTENTION_RUNTIME_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/005_PHASE_80E_OPERATOR_ATTENTION_HANDOFF.md`

FILES UPDATED

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` — append attention/operator columns vào `HOME_ALERT`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` — audit optional columns tương ứng.
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js` — `HomeAlert_enrichAttentionFields_` + helpers; gọi từ `HomeAlert_enrichDesktopUxFields_`; merge + `buildAlert` placeholders; `HomeAlertAttention_TestConsole_*`.
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` — §9 Operator Attention; không lộ sort key trên operator UI.
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md` — operator 80E, checklist sort, admin debug list.

TEST RESULT

- NOT RUN (local) — trên GAS/Spreadsheet: `HomeAlert_bootstrap()` → `HomeAlertAttention_TestConsole_run()`.

WARNINGS

- Không commit `.clasp.json` nếu dirty và không thuộc phase (scriptId binding deploy).
- Sort key (`CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`) chỉ dùng **Sort by** view; không dùng làm header/summary — phải rà AppSheet thủ công.

NEXT STEP

- Chạy bootstrap + refresh + `HomeAlertAttention_TestConsole_run()` để chốt GO/FAIL.
- Cấu hình AppSheet `ALERT_List` / `ALERT_Detail` theo `HOME_ALERT_APPSHEET_SETUP.md` §9.

PRODUCTION READINESS

- READY FOR MANUAL PILOT sau GO trên sheet thật; NOT READY FOR AUTO (no trigger, no Drive upload).

DO NOT CHANGE

- Không Virtual Column; không AppSheet Bot; không formula attention phức tạp trên AppSheet.
- Không sửa TASK/FIN schema/logic; không production trigger; không upload Drive tự động.
- Không overwrite prompt/report/handoff cũ; không xoá/rename cột legacy.
- Không show sort/debug fields trong operator UX.

DRIVE ONLINE OUTPUT TARGET

- `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` (Script Property đề xuất; không auto upload).

AI HANDOFF SUMMARY

Phase 80E thêm lớp **Operator Attention** trên `DESKTOP_*`: cột `ATTENTION_*`, `ACTION_*` (focus/hint/priority), `OWNER_*`, và `OPERATOR_*` do GAS sinh; `HomeAlert_enrichDesktopUxFields_` gọi `HomeAlert_enrichAttentionFields_` sau desktop. Operator AppSheet dùng `OPERATOR_PRIMARY_TEXT` / `OPERATOR_SECONDARY_TEXT` / `OPERATOR_META_TEXT` cho deck, ẩn hoàn toàn `CARD_SORT`/`DESKTOP_SORT`/`SORT_KEY` khỏi hiển thị (chỉ sort backend). Admin debug view giữ quyền xem raw. Test console `HomeAlertAttention_TestConsole_run` kiểm tra schema, refresh, `OPERATOR_*`, `OPERATOR_HIDE_SORT_KEYS`, regression 80B/80D, không duplicate `ALERT_ID`.
