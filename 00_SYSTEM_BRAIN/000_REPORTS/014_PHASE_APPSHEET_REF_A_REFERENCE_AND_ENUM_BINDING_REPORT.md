# 014 — PHASE APPSHEET-REF_A — REFERENCE_AND_ENUM_BINDING — REPORT

**Date:** 2026-05-12  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Scope:** Documentation only (APPSHEET-REF-A).

## FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/014_PHASE_APPSHEET_REF_A_REFERENCE_AND_ENUM_BINDING_PROMPT.md`
- `docs/appsheet/APPSHEET_REFERENCE_BINDING_CHECKLIST.md`
- `00_SYSTEM_BRAIN/000_REPORTS/014_PHASE_APPSHEET_REF_A_REFERENCE_AND_ENUM_BINDING_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/014_PHASE_APPSHEET_REF_A_REFERENCE_AND_ENUM_BINDING_HANDOFF.md`

## FILES UPDATED

- `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` — §3A Reference/Enum binding; phase line; cập nhật bảng type `MODULE_CODE` / `ASSIGNED_TO` / `ASSIGNED_TEAM`
- `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` — §6B formula library; phase line
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — bảng file, thứ tự đọc, deploy bước 4, liên kết REF-A, section APPSHEET-REF-A, trạng thái docs, ràng buộc

## DOC COVERAGE

| Topic | Location |
|-------|----------|
| 8 reference tables + update modes | Install Guide §3A |
| Key/label mapping + fallbacks | Install Guide §3A |
| HOME_ALERT / SLA_POLICY / AUTOMATION / TASK_MAIN binding | Install Guide §3A |
| Operator contract + banned legacy columns | Install Guide §3A + existing §8–§9 |
| Slice + Valid_If + security + Show_If + locale | Formula Reference §6B + §7 |

## REFERENCE TABLE COVERAGE

`ENUM_DICTIONARY`, `USER_DIRECTORY`, `MASTER_CODE`, `DON_VI`, `TEAM_DIRECTORY`, `ROLE_PERMISSION_MATRIX`, `FEATURE_FLAG`, `SYSTEM_REGISTRY` — documented in Install §3A + Checklist §1–§2.

## FORMULA COVERAGE

MASTER_CODE slices (`MC_*`), ENUM slices (`ENUM_*`), Valid_If samples, security/supervisor/admin patterns, Show_If admin/supervisor — Formula Reference §6B.

## SECURITY COVERAGE

Sample row-level patterns using `USER_DIRECTORY` + `LOOKUP(USEREMAIL(), …)`; notes on `USER_ID` vs email consistency; supervisor `TEAM_DIRECTORY` pattern; admin `IS_ADMIN` — §6B + Checklist §6.

## WARNINGS

- `ASSIGNED_TO` trên dữ liệu thực có thể là **email** hoặc **USER_ID**; filter phải khớp kiểu lưu (§6B + Install §3A ghi chú).
- Hàng `MASTER_CODE` cũ có thể thiếu `IS_ACTIVE` hoặc cột alias `MASTER_CODE` rỗng — cần virtual column hoặc nới điều kiện slice (đã ghi trong §6B).
- `ACTION_PAYLOAD_JSON` trong OR `IN(USEREMAIL(), SPLIT(...))` chỉ an toàn nếu payload thật sự chứa email hợp lệ — dùng có kiểm soát.

## ERRORS

- None (static docs).

## NEXT STEP

1. Admin AppSheet: làm theo `APPSHEET_REFERENCE_BINDING_CHECKLIST.md`.  
2. Sau go-live: đánh dấu DOCS_VALIDATED trên index nếu team có quy trình.  
3. Phase tiếp: **ENV-A** (tách hẳn khỏi reference sheets).

## PRODUCTION READINESS

- **Docs:** Ready for admin binding work; requires spreadsheet đã có cột REF-A (post `HomeAlert_bootstrap` / REF-A).

## AI HANDOFF SUMMARY

- APPSHEET-REF-A chỉ **bổ sung tài liệu**; không đụng `.clasp.json` / `scriptId` / runtime GAS.  
- Operator deck **bắt buộc** `OPERATOR_*`; cấm `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*` cho operator-facing.  
- Công thức AppSheet dùng **`,`** không dùng **`;`**.

## GIT STATUS

Clean on `phase/from-v2.4.1-TASK-FIN` at tip `ba76844` after APPSHEET-REF-A docs commit.

## COMMIT / PUSH / TAG STATUS

- **Commit:** `ba76844` — `docs(appsheet): add reference and enum binding guide`
- **Push:** succeeded to `origin/phase/from-v2.4.1-TASK-FIN`
- **Tag:** `v2.4.7-APPSHEET-REFERENCE-BINDING` pushed to `origin`
