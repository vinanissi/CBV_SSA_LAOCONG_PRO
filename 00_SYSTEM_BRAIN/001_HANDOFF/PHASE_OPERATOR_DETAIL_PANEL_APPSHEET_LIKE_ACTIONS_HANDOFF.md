# Handoff — OPERATOR_DETAIL_PANEL_APPSHEET_LIKE_ACTIONS

## Right panel now shows

**CHI TIẾT VIỆC** with business summary (đơn vị, loại, tên, assignee, status, priority, due, SLA), note update, business actions, contact shortcuts, timeline preview.

## Hidden by default

Raw task ID, source keys (`google_sheet_*`), `Mã việc` — under **Thông tin kỹ thuật** (collapsed).

## Actions

- **Chuyển giao** / **Đổi trạng thái** → existing focus dialogs
- **Đổi ưu tiên** → more-menu priority action
- **Đổi hạn** → disabled with tooltip

## Manual check

Open focus task → RIGHT **Chi tiết** → confirm no `Mã việc` in summary → expand **Thông tin kỹ thuật** for audit IDs.

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
