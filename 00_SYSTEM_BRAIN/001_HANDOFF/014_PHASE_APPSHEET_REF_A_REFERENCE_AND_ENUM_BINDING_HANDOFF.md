# 014 — PHASE APPSHEET-REF_A — HANDOFF

## Phase purpose

Cho phép **nhân sự / admin AppSheet** bind đúng 8 bảng reference + enum sau REF-A runtime, qua tài liệu cài đặt + thư viện công thức + checklist — **không** mở rộng GAS core, **không** ENV-A.

## Docs updated

- `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` — §3A (tables, modes, keys, bindings, operator contract).
- `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` — §6B (slices MC_/ENUM_, Valid_If, security, Show_If, locale).
- `APPSHEET_REFERENCE_BINDING_CHECKLIST.md` — mới.
- `HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — audience, reading order, deploy step 4, APPSHEET-REF-A block.

## AppSheet binding rules

- Enum: ưu tiên Valid_If / Ref slice từ `ENUM_DICTIONARY`.
- Master codes: slice `MASTER_CODE` theo `MASTER_GROUP` + `IS_ACTIVE` / `IS_DELETED`.
- Users/teams: Ref `USER_DIRECTORY` / `TEAM_DIRECTORY` với Key/Label đã mô tả; đồng nhất `USER_ID` vs email trong security filter.

## Operator dashboard contract

Không đổi: `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`, `OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`, `OPERATOR_DASHBOARD_GROUP`, `OPERATOR_DASHBOARD_SORT` DESC.

## Reference tables involved

`ENUM_DICTIONARY`, `USER_DIRECTORY`, `MASTER_CODE`, `DON_VI`, `TEAM_DIRECTORY`, `ROLE_PERMISSION_MATRIX`, `FEATURE_FLAG`, `SYSTEM_REGISTRY`.

## Remaining gaps

- Dữ liệu thực tế trên prod có thể chưa backfill `USER_ID` / `MASTER_CODE` alias / `IS_ACTIVE` trên mọi dòng `MASTER_CODE`.
- Security filter cuối cùng cần `OR` ghép với policy nội bộ (admin-only slices).

## Next recommended step

**ENV-A** — sheet hoặc kênh lưu cấu hình môi trường / secret, tách biệt reference layer.

## What AI/Cursor must not break next time

- `OPERATOR_*` contract và baseline TASK_MAIN (`ANY(SELECT)` security nếu áp dụng).
- Phase 82/83/84 runtime và allowlist automation.
- Không thêm AppSheet Bot / auto assign / auto resolve / auto escalate từ docs.
