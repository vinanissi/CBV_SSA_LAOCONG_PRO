# 015 — PHASE APPSHEET_HAND_A — HANDOFF

## Phase purpose

Cho **người không rành kỹ thuật** vẫn làm được: tạo app AppSheet, thêm bảng, regenerate cột, tạo slice, view, format rule, action, security filter — theo từng bước bấm chuột và copy-paste.

## Docs created

- `CLICK_BY_CLICK_HOME_ALERT_SETUP.md`
- `CLICK_BY_CLICK_TABLES_AND_COLUMNS.md`
- `CLICK_BY_CLICK_SLICES.md`
- `CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md`
- `CLICK_BY_CLICK_ACTIONS_SECURITY.md`

## Who should read what

| Audience | Files |
|----------|--------|
| Người mới cài app lần đầu | Setup → Tables → Slices → Views → Actions/Security |
| Admin AppSheet | Toàn bộ + `APPSHEET_*` reference docs |
| Operator | Chỉ cần app đã cài; có thể đọc Setup để hiểu “app lấy data từ đâu” |

## Click-by-click scope

**Docs-only.** Không sửa GAS, không trigger, không automation mới, không ENV-A, không AI/Queue Intelligence.

## Remaining gaps

- Chi tiết **Webhook** cho từng action (nếu team không cho set cột trực tiếp).  
- Bố cục cụ thể `HOME_ALERT_SLA_DASHBOARD` (widget-level).  
- Bản dịch song song nếu team dùng menu AppSheet tiếng Việt hoàn toàn.

## Next recommended step

Chạy pilot: một người **không** dev làm theo 5 file trên môi trường thử; ghi lại chỗ menu lệch và cập nhật doc nhỏ (append).

## What AI/Cursor must not break next time

- `OPERATOR_*` contract; cấm legacy deck columns.  
- Không thêm AppSheet Bot / auto workflows trái chuẩn CBV.  
- Không đụng `.clasp.json` / `scriptId` khi chỉ làm doc phase tương tự.

## Git (reference)

- Main docs commit: `8f9e065` — `docs(appsheet): add click-by-click setup guide`
- Report metadata commit: `5434b3d` — `docs(report): add git metadata for APPSHEET-HAND-A`
- Tag: `v2.4.8-APPSHEET-CLICK-BY-CLICK-GUIDE` (points at tip after report update)
