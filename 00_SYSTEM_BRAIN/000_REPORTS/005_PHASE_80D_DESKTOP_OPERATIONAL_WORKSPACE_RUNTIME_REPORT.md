## PHASE 80D — DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME (REPORT)

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

Branch khớp yêu cầu (`phase/from-v2.4.1-TASK-FIN`), tiếp tục phase 80D.

### Goal

Hoàn thiện HOME_ALERT trên **desktop-first operational workspace**:

- 3 giây hiểu việc cần xử lý.
- Desktop cockpit rõ ràng (không raw / debug).
- Detail panel thân thiện cho operator.
- AppSheet chỉ hiển thị + bấm action; GAS sinh toàn bộ `DESKTOP_*` fields.

Tham chiếu: `CBV Operational Ecosystem Standard V1` — runtime-first, append-only, manual-first → auto-later, không VC/Bot/Trigger.

### Decisions

- Tách rõ 2 view trên desktop:
  - `HOME_ALERT_OPERATOR_DASHBOARD` — chỉ DESKTOP_* + minimal ops fields.
  - `HOME_ALERT_ADMIN_DEBUG` — admin only, được phép xem raw/debug.
- GAS sinh các cột `DESKTOP_*` ngay trong `HomeAlert_enrichUxFields_()` (gọi tiếp `HomeAlert_enrichDesktopUxFields_()`); refresh và state transition đều enrich lại để cockpit luôn đồng bộ.
- Không xoá / rename cột cũ; chỉ append `DESKTOP_*` vào manifest + audit schema.
- Sort key desktop: `${PRIORITY_SCORE_PADDED_6}_${YYYYMMDDHHMMSS}` (sort DESC trên AppSheet).
- Drive online archive `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` được tài liệu hóa và đề xuất Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID`, **không upload tự động** ở phase này.

### Schema changes (append-only)

Append vào `CBV_SCHEMA_MANIFEST.HOME_ALERT` và `CBV_AUDIT_SCHEMA.HOME_ALERT.optionalColumns`:

- `DESKTOP_TITLE`, `DESKTOP_SUBTITLE`, `DESKTOP_PRIMARY_LINE`, `DESKTOP_SECONDARY_LINE`, `DESKTOP_META_LINE`, `DESKTOP_ACTION_LINE`
- `DESKTOP_DETAIL_TITLE`, `DESKTOP_DETAIL_SUMMARY`, `DESKTOP_DETAIL_CONTEXT`, `DESKTOP_DETAIL_NEXT_ACTION`, `DESKTOP_DETAIL_DEBUG_VISIBLE`
- `DESKTOP_GROUP`, `DESKTOP_SORT`, `DESKTOP_IS_OPERATOR_VIEW`

Không đổi tên / không xoá cột cũ. `DISPLAY_*`, `CARD_*`, `UX_*` giữ nguyên hành vi Phase 80C.

### Runtime changes

`05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`:

- `HomeAlert_enrichDesktopUxFields_(alert)` + các builder/getter:
  - `HomeAlert_buildDesktopTitle_`, `HomeAlert_buildDesktopSubtitle_`
  - `HomeAlert_buildDesktopPrimaryLine_`, `HomeAlert_buildDesktopSecondaryLine_`
  - `HomeAlert_buildDesktopMetaLine_`, `HomeAlert_buildDesktopActionLine_`
  - `HomeAlert_buildDesktopDetailTitle_`, `HomeAlert_buildDesktopDetailSummary_`
  - `HomeAlert_buildDesktopDetailContext_`, `HomeAlert_buildDesktopDetailNextAction_`
  - `HomeAlert_getDesktopGroup_`, `HomeAlert_getDesktopSort_`
- `HomeAlert_enrichUxFields_()` gọi tiếp `HomeAlert_enrichDesktopUxFields_()` (Phase 80C cũ vẫn được tính).
- `HomeAlert_mergeIncomingWithExisting_()` append `DESKTOP_*` vào danh sách field refresh để cockpit luôn sync khi upsert.
- `HomeAlert_buildAlert_()` thêm placeholder `DESKTOP_*` để insert mới không thiếu cột.
- Drive folder helper: `HomeAlert_getSystemBrainDriveFolderId_()` (đọc Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID`, fallback hằng số `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`).
- Không phá Phase 80B state machine, không tạo trigger / duplicate alert.

### AppSheet doc updates

- `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`: thêm section **§8 Desktop Operational Workspace** (schema bổ sung, ALERT_List/ALERT_Detail dùng `DESKTOP_*`, hide raw, Drive archive target).
- `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md` (mới): tách rõ 2 view `HOME_ALERT_OPERATOR_DASHBOARD` và `HOME_ALERT_ADMIN_DEBUG`, không trộn operator UX với debug schema.

### Test console

Thêm test console riêng cho desktop UX (`HOME_ALERT_DESKTOP_RUNTIME`):

- `HomeAlertDesktop_TestConsole_run()`
- `HomeAlertDesktop_TestConsole_showReport()`
- `HomeAlertDesktop_TestConsole_copyAiHandoff()`

Kiểm tra tối thiểu:

- Schema có đủ `DESKTOP_*` columns (`schemaDesktopColumns`).
- Legacy UX columns (`DISPLAY_*`, `CARD_*`, `UX_*`) vẫn còn (`schemaLegacyUxColumns`).
- State machine Phase 80B vẫn GO (`stateMachine`).
- `HomeAlert_refresh()` không lỗi (`refresh`).
- Sample active alert có đủ `DESKTOP_TITLE`, `DESKTOP_PRIMARY_LINE`, `DESKTOP_GROUP`, `DESKTOP_SORT`, `DESKTOP_DETAIL_TITLE`, `DESKTOP_DETAIL_SUMMARY`, `DESKTOP_DETAIL_NEXT_ACTION`, và vẫn còn `DISPLAY_TITLE` / `CARD_GROUP` / `CARD_SORT` (`desktopOutput`).
- Không duplicate `ALERT_ID` (`noDuplicateAlertId`).

Report contract envelope: `CBV_TEST_CONSOLE_V1`, `envelopeOk: true`, `phase: PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME`.

### Test result

- **NOT RUN (local)** — phải chạy trong GAS + Spreadsheet:
  - `HomeAlert_bootstrap()` (append cột mới vào sheet HOME_ALERT).
  - `HomeAlertDesktop_TestConsole_run()` để chốt GO/FAIL.

### Warnings

- Nếu `HOME_ALERT` chưa có row (chưa có alert nào phát sinh), `desktopOutput` chỉ ra warning “no rows” (không fail).
- Sort key DESKTOP_SORT yêu cầu AppSheet sort **DESC** để priority cao + timestamp mới nhất nổi lên đầu — nếu cấu hình ASC sẽ ra ngược ý đồ.
- `HomeAlert_extractDaysFromBadge_` chỉ parse BADGE_TEXT định dạng `Nd` (đang dùng ở `FIN_UNCONFIRMED_OLD`); badge format khác sẽ rơi xuống fallback “Chờ xác nhận”.

### Next step

- Trong GAS/Spreadsheet:
  1. Chạy `HomeAlert_bootstrap()` để append cột `DESKTOP_*` vào sheet thật.
  2. Chạy `HomeAlertDesktop_TestConsole_run()` → chốt GO/FAIL phase 80D.
  3. Nếu muốn override Drive folder, đặt Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID`.
- Trên AppSheet:
  1. Cấu hình `HOME_ALERT_OPERATOR_DASHBOARD` theo `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md` (deck `DESKTOP_TITLE`/`DESKTOP_SUBTITLE`/`DESKTOP_GROUP`/`DESKTOP_SORT`).
  2. Cấu hình `HOME_ALERT_ADMIN_DEBUG` riêng cho admin.
  3. Ẩn raw fields trong `ALERT_Detail` theo doc.

### Production readiness

- **READY FOR MANUAL DESKTOP PILOT** — sheet-driven display, không VC/Bot/Trigger, append-only, không phá state machine.
- **NOT READY FOR AUTO** — chờ `HomeAlertDesktop_TestConsole_run()` GO trên môi trường thật + runbook trigger được thiết kế ở phase sau.

### Drive online output target

- Folder online archive: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- Script Property đề xuất: `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
- **Không upload tự động** ở phase này. Chỉ chuẩn bị cấu hình + tài liệu hóa.
- Trigger Drive export sẽ được tạo ở phase sau khi thiết kế quyền/an toàn xong.
