## PHASE 80D — Desktop Operational Workspace Runtime (AI HANDOFF)

FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/005_PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/005_PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/004_PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_HANDOFF.md`
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md`

FILES UPDATED

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` — append `DESKTOP_*` columns vào `CBV_SCHEMA_MANIFEST.HOME_ALERT`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` — audit `DESKTOP_*` optional columns cho `HOME_ALERT`.
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`:
  - `HomeAlert_enrichDesktopUxFields_()` + 13 builder/getter (`Desktop*`).
  - `HomeAlert_enrichUxFields_()` gọi tiếp desktop enrich (Phase 80C cũ giữ nguyên).
  - `HomeAlert_buildAlert_()` thêm placeholder `DESKTOP_*`.
  - `HomeAlert_mergeIncomingWithExisting_()` refresh `DESKTOP_*` mỗi upsert.
  - Test console mới: `HomeAlertDesktop_TestConsole_run/_showReport/_copyAiHandoff`.
  - Drive folder helper: `HomeAlert_getSystemBrainDriveFolderId_()` + hằng số `HOME_ALERT_DEFAULT_SYSTEM_BRAIN_DRIVE_FOLDER_ID`.
- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` — thêm section **§8 Desktop Operational Workspace** (deck dùng `DESKTOP_*`, hide raw, Drive archive target).

TEST RESULT

- **NOT RUN (local)** — chạy trong GAS/Spreadsheet:
  - `HomeAlert_bootstrap()` để append cột `DESKTOP_*` vào sheet thật.
  - `HomeAlertDesktop_TestConsole_run()` để chốt GO/FAIL phase 80D.
- Test contract: `CBV_TEST_CONSOLE_V1`, `envelopeOk: true`, `phase: PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME`, `testSuite: HOME_ALERT_DESKTOP_RUNTIME`.

WARNINGS

- Nếu `HOME_ALERT` chưa có row, `desktopOutput` warn “no rows” (không fail).
- AppSheet phải sort `DESKTOP_SORT` **DESC** để cockpit hiển thị đúng thứ tự (priority cao + cập nhật mới đứng trước).
- Parser `HomeAlert_extractDaysFromBadge_` chỉ hiểu BADGE_TEXT định dạng `Nd`; format khác fallback “Chờ xác nhận”.
- Drive folder hiện chỉ là cấu hình; chưa có trigger upload.

NEXT STEP

- Trong GAS/Spreadsheet:
  1. `HomeAlert_bootstrap()` để bổ sung `DESKTOP_*` vào sheet vật lý.
  2. `HomeAlertDesktop_TestConsole_run()` → kỳ vọng `status: GO` (hoặc `GO_WITH_WARNINGS` nếu chưa có active alert).
  3. (Tuỳ chọn) Đặt Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID` nếu muốn override folder online archive.
- Trên AppSheet:
  1. Cấu hình `HOME_ALERT_OPERATOR_DASHBOARD` (Deck dùng `DESKTOP_TITLE`/`DESKTOP_SUBTITLE`/`DESKTOP_GROUP`/`DESKTOP_SORT`).
  2. Cấu hình `HOME_ALERT_ADMIN_DEBUG` riêng cho admin (chỉ admin thấy raw/debug).
  3. Ẩn raw fields trong `ALERT_Detail` operator theo doc.

PRODUCTION READINESS

- **READY FOR MANUAL DESKTOP PILOT** — sheet-driven, append-only, không VC/Bot/Trigger, không phá state machine.
- **NOT READY FOR AUTO** — chờ test console GO trên môi trường thật + runbook trigger được thiết kế ở phase sau.

DO NOT CHANGE

- Không dùng Virtual Column cho desktop UX.
- Không dùng AppSheet Bot/Automation.
- Không đưa logic vào AppSheet formula phức tạp.
- Không sửa TASK/FIN schema hoặc logic.
- Không tạo production trigger ở phase này.
- Không overwrite prompt/report/handoff cũ.
- Không xoá / rename cột cũ — chỉ append.
- Không phá Phase 80B state machine / Phase 80C UX enrichment.
- Không trộn operator UX với debug schema trong cùng view.
- Không upload Drive tự động khi chưa có thiết kế quyền/an toàn.

DRIVE ONLINE OUTPUT TARGET

- Folder: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- Script Property đề xuất: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- Trạng thái: cấu hình + tài liệu hóa; **chưa upload tự động**.
- Helper runtime: `HomeAlert_getSystemBrainDriveFolderId_()` (đọc Script Property, fallback hằng số mặc định).

AI HANDOFF SUMMARY

PHASE 80D nâng HOME_ALERT thành desktop-first operational workspace bằng cách append các cột `DESKTOP_*` vào schema (manifest + audit, append-only) và tính toàn bộ giá trị qua GAS (`HomeAlert_enrichDesktopUxFields_`). `HomeAlert_refresh()` và state transition đều enrich lại để cockpit luôn đồng bộ với trạng thái thực. AppSheet được cấu hình thành 2 view tách biệt: `HOME_ALERT_OPERATOR_DASHBOARD` dùng `DESKTOP_*` để operator hiểu việc trong 3 giây và bấm action, `HOME_ALERT_ADMIN_DEBUG` chỉ admin được phép xem raw fields. Test console riêng (`HomeAlertDesktop_TestConsole_run`) kiểm tra schema, refresh, sample active alert, duplicate `ALERT_ID`, và state machine Phase 80B. Drive folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` được khai báo làm online archive target qua Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID`, nhưng chưa upload tự động — manual-first → auto-later.
