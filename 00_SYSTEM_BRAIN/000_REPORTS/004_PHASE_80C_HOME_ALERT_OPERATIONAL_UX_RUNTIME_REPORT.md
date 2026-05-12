## PHASE 80C — HOME_ALERT_OPERATIONAL_UX_RUNTIME (REPORT)

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

Nâng `HOME_ALERT` từ raw runtime table thành “Operational Cockpit UX” cho AppSheet theo chuẩn:

- GAS sinh toàn bộ display fields (không AppSheet VC / formula phức tạp)
- Sheet lưu cột vật lý (append-only)
- AppSheet chỉ hiển thị + bấm action

### Decisions

- UX fields được tính trong GAS qua `HomeAlert_enrichUxFields_()` và được ghi trực tiếp vào sheet `HOME_ALERT`.
- `HomeAlert_refresh()` gọi UX enrich **trước upsert**, và state transition cũng enrich để UI đồng bộ với status mới.
- Không thay đổi logic TASK/FIN và không tạo trigger tự động.

### Schema changes (append-only)

Thêm các cột UX vào `HOME_ALERT` (manifest + audit schema) theo danh sách phase 80C:

- `DISPLAY_*` (title/subtitle/summary/footer/icon/color/action/status/time_ago/priority/assignee/badge)
- `CARD_*` (group/sort/layout)
- `UX_*` (visible/group_order/action_hint)

### Runtime changes

- `HomeAlert_enrichUxFields_(alert)` + các helper build display/card fields.
- `HomeAlert_upsertAlert_()` đảm bảo UX fields khớp với **final status** (kể cả khi refresh không override status).
- `HomeAlert_transitionAlert_()` cập nhật UX fields khi đổi trạng thái.

### AppSheet setup update

`ALERT_List` chuyển sang **Deck view** và dùng:

- Primary: `DISPLAY_TITLE`
- Secondary: `DISPLAY_SUBTITLE`
- Summary: `DISPLAY_SUMMARY`
- Group: `CARD_GROUP`
- Sort: `CARD_SORT`

Ẩn raw fields trong detail (doc đã ghi rõ).

### Test console

Đã thêm test console riêng cho UX:

- `HomeAlertUx_TestConsole_run()`
- `HomeAlertUx_TestConsole_showReport()`
- `HomeAlertUx_TestConsole_copyAiHandoff()`

Kiểm tra tối thiểu:

- Schema có UX columns
- Refresh sinh `DISPLAY_TITLE`, `DISPLAY_SUMMARY`, `CARD_GROUP`, `CARD_SORT`
- Không duplicate `ALERT_ID`
- State machine vẫn OK

### Test result

- **NOT RUN (local)**: cần chạy trong GAS + Spreadsheet.

### Warnings

- Khi `HOME_ALERT` chưa có row (không có alert nào phát sinh), UX test console sẽ chỉ ra warning “no rows” (không fail).
- `DISPLAY_TIME_AGO` hiện format dạng `10m ago / 3h ago / 2d ago` (đủ cho cockpit, có thể localize sau).

### Next step

- Trong GAS/Spreadsheet: chạy `HomeAlert_bootstrap()` để append cột UX vào sheet.
- Chạy `HomeAlertUx_TestConsole_run()` để chốt GO/FAIL cho phase 80C.
- Trên AppSheet: cấu hình Deck view + hide raw fields theo `04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md`.

