# PHASE 80D — DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME (PROMPT LOG)

Repo PC: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`
Branch bắt buộc: `phase/from-v2.4.1-TASK-FIN`

Tham chiếu bắt buộc: **CBV Operational Ecosystem Standard V1** — runtime-first, memory-first, append-only, manual-first → auto-later.

## MỤC TIÊU

Hoàn thiện HOME_ALERT trên **desktop-first operational workspace**. Không làm mobile ở phase này.

Mục tiêu UX:

- 3 giây hiểu việc cần xử lý.
- Desktop cockpit rõ ràng.
- Detail panel thân thiện cho người vận hành.
- Không còn cảm giác raw database/debug view.
- AppSheet vẫn chỉ hiển thị và bấm action.
- GAS/Sheet vẫn giữ logic và dữ liệu thật.

## NGUYÊN TẮC BẮT BUỘC

- Runtime-first.
- Memory-first.
- Append-only.
- Manual-first → auto-later.
- Không dùng Virtual Column.
- Không dùng AppSheet Bot.
- Không đưa logic vào AppSheet formula phức tạp.
- Không sửa TASK/FIN schema.
- Không tạo production trigger.
- Không overwrite prompt/report/handoff cũ.
- Không sửa repo khác.

## VIỆC PHẢI LÀM (TÓM TẮT)

1. PRECHECK REPO (`git status -sb`, `git branch --show-current`, `git remote -v`); chỉ tiếp tục nếu đang trên `phase/from-v2.4.1-TASK-FIN`.
2. Lưu prompt append-only thành file này.
3. Cập nhật schema HOME_ALERT, append các cột vật lý `DESKTOP_*` (idempotent, không đổi tên cột cũ, không xoá `DISPLAY_*`/`CARD_*`/`UX_*`):
   - `DESKTOP_TITLE`, `DESKTOP_SUBTITLE`, `DESKTOP_PRIMARY_LINE`, `DESKTOP_SECONDARY_LINE`, `DESKTOP_META_LINE`, `DESKTOP_ACTION_LINE`
   - `DESKTOP_DETAIL_TITLE`, `DESKTOP_DETAIL_SUMMARY`, `DESKTOP_DETAIL_CONTEXT`, `DESKTOP_DETAIL_NEXT_ACTION`, `DESKTOP_DETAIL_DEBUG_VISIBLE`
   - `DESKTOP_GROUP`, `DESKTOP_SORT`, `DESKTOP_IS_OPERATOR_VIEW`
   - Cập nhật `CBV_SCHEMA_MANIFEST.HOME_ALERT` và `CBV_AUDIT_SCHEMA.HOME_ALERT.optionalColumns`.
4. Cập nhật GAS UX enrichment (`05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`):
   - Thêm/cập nhật `HomeAlert_enrichDesktopUxFields_(alert)`.
   - Thêm các builder: `HomeAlert_buildDesktopTitle_`, `HomeAlert_buildDesktopSubtitle_`, `HomeAlert_buildDesktopPrimaryLine_`, `HomeAlert_buildDesktopSecondaryLine_`, `HomeAlert_buildDesktopMetaLine_`, `HomeAlert_buildDesktopActionLine_`, `HomeAlert_buildDesktopDetailTitle_`, `HomeAlert_buildDesktopDetailSummary_`, `HomeAlert_buildDesktopDetailContext_`, `HomeAlert_buildDesktopDetailNextAction_`, `HomeAlert_getDesktopGroup_`, `HomeAlert_getDesktopSort_`.
   - `HomeAlert_enrichUxFields_()` phải gọi thêm `HomeAlert_enrichDesktopUxFields_()`.
   - `HomeAlert_refresh()` vẫn enrich trước upsert.
   - State transition vẫn enrich lại sau đổi trạng thái.
   - Không phá Phase 80B state machine, không tạo duplicate alert.
5. Cập nhật doc AppSheet `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md` (Desktop Operational Workspace):
   - ALERT_List Deck: dùng `DESKTOP_TITLE` (primary), `DESKTOP_SUBTITLE` (secondary), `DESKTOP_PRIMARY_LINE` hoặc `DESKTOP_SECONDARY_LINE` (summary), group `DESKTOP_GROUP`, sort `DESKTOP_SORT`.
   - ALERT_Detail: chỉ show operator-friendly fields (`DESKTOP_DETAIL_*`, `STATUS`, `ASSIGNED_TO`, `DUE_AT`, `NOTE`, `DISPLAY_FOOTER`); ẩn raw/debug fields (`ALERT_ID`, `ALERT_CODE`, `ALERT_TYPE`, `SOURCE_HASH`, `TRACE_ID`, `ACTION_PAYLOAD_JSON`, `ALERT_FINGERPRINT`, `ALERT_GROUP_KEY`, `RELATED_ENTITY_ID`, `LAST_ACTION`).
   - Raw fields chỉ mở cho Admin Debug view riêng. Không formula phức tạp, không VC, không Bot.
6. Tạo doc admin debug view `04_APPSHEET/HOME_ALERT_DESKTOP_WORKSPACE.md`:
   - `HOME_ALERT_OPERATOR_DASHBOARD` (operator view, chỉ DESKTOP_* + minimal ops).
   - `HOME_ALERT_ADMIN_DEBUG` (admin only, được phép xem raw fields).
   - Không trộn operator UX với debug schema.
7. Test console riêng cho desktop UX:
   - `HomeAlertDesktop_TestConsole_run()`
   - `HomeAlertDesktop_TestConsole_showReport()`
   - `HomeAlertDesktop_TestConsole_copyAiHandoff()`
   - Kiểm tra: schema có `DESKTOP_*`; refresh sinh `DESKTOP_TITLE`/`DESKTOP_PRIMARY_LINE`/`DESKTOP_GROUP`/`DESKTOP_SORT`; detail fields không rỗng cho sample active alert; `DISPLAY_*`/`CARD_*` cũ vẫn còn; state machine Phase 80B GO; không duplicate `ALERT_ID`.
   - Report theo contract `CBV_TEST_CONSOLE_V1` + `envelopeOk: true`, phase `PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME`.
8. Online Drive output runtime:
   - Folder online archive: `https://drive.google.com/drive/folders/1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`
   - Không upload tự động khi chưa có thiết kế an toàn.
   - Ghi vào report/handoff rằng Drive folder này là online archive target.
   - Đề xuất Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID = 1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` (chỉ là khóa cấu hình, chưa tạo trigger Drive export).
9. Tạo report append-only `00_SYSTEM_BRAIN/000_REPORTS/005_PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME_REPORT.md`.
10. Tạo handoff append-only `00_SYSTEM_BRAIN/001_HANDOFF/004_PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_HANDOFF.md`.
11. Git: `add .` → commit `phase: add desktop operational workspace runtime` → push `phase/from-v2.4.1-TASK-FIN`.

## DESKTOP OUTPUT MẪU (CHUẨN HIỂN THỊ)

```
DESKTOP_TITLE              = 🔴 Task quá hạn
DESKTOP_SUBTITLE           = Lắp mới định vị · Số điện thoại khách: 0935522703 · Số xe: 51F22624
DESKTOP_PRIMARY_LINE       = Quá hạn 50 ngày · IN_PROGRESS
DESKTOP_SECONDARY_LINE     = Ưu tiên: Medium · Phụ trách: USR_001
DESKTOP_META_LINE          = TASK · TASK_MAIN · cập nhật 17:17
DESKTOP_ACTION_LINE        = Việc cần làm: Nhận xử lý
DESKTOP_DETAIL_TITLE       = 🔴 Task quá hạn
DESKTOP_DETAIL_SUMMARY     = Task này đã quá hạn 50 ngày và đang IN_PROGRESS.
DESKTOP_DETAIL_CONTEXT     = Nguồn: TASK_MAIN · Mã liên quan: TSK_001
DESKTOP_DETAIL_NEXT_ACTION = Nhận xử lý hoặc chuyển trạng thái phù hợp.
DESKTOP_GROUP              = 🚨 Khẩn cấp
DESKTOP_SORT               = 000070_20260512171743
DESKTOP_IS_OPERATOR_VIEW   = TRUE
```

## OUTPUT BẮT BUỘC CUỐI PHASE

```
FILES CREATED
FILES UPDATED
TEST RESULT
WARNINGS
NEXT STEP
PRODUCTION READINESS
DRIVE ONLINE OUTPUT TARGET
AI HANDOFF SUMMARY
GIT STATUS
COMMIT HASH
PUSH RESULT
```
