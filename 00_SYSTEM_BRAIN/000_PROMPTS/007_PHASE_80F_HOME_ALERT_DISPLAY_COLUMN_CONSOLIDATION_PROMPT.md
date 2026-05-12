## PHASE 80F — HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION (PROMPT LOG)

Repo PC: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`  
Branch bắt buộc: `phase/from-v2.4.1-TASK-FIN`

Tham chiếu: **CBV Operational Ecosystem Standard V1**.

## MỤC TIÊU

Chuẩn hóa cột hiển thị HOME_ALERT sau 80C/80D/80E: **một chuẩn operator** (`OPERATOR_*` + metadata), **legacy** giữ nguyên trên sheet cho Admin Debug + backward compatibility.

## VIỆC PHẢI LÀM (TÓM TẮT)

1. Precheck git; không commit `.clasp.json` nếu dirty ngoài phase.
2. Prompt append-only (file này).
3. Tạo `04_APPSHEET/HOME_ALERT_DISPLAY_COLUMN_STANDARD.md` (§A–E).
4. Cập nhật `HOME_ALERT_APPSHEET_SETUP.md`, `HOME_ALERT_DESKTOP_WORKSPACE.md` — Official display standard; legacy; `DESKTOP_SORT` chỉ Sort by; `ATTENTION_LABEL` group; Admin Debug.
5. GAS `80_HOME_ALERT_RUNTIME.js`: **không** thêm cột mới; `HomeAlert_getOfficialOperatorDisplayConfig_()`, `HomeAlert_validateOperatorDisplayPolicy_()`; test `HomeAlertDisplayStandard_TestConsole_*`.
6. Report `007_...REPORT.md`, handoff `006_...HANDOFF.md`.
7. Git: `phase: consolidate home alert display columns`; push `phase/from-v2.4.1-TASK-FIN`.

## OUTPUT BẮT BUỘC

```
FILES CREATED
FILES UPDATED
TEST RESULT
WARNINGS
NEXT STEP
PRODUCTION READINESS
DRIVE ONLINE OUTPUT TARGET
DISPLAY STANDARD SUMMARY
AI HANDOFF SUMMARY
GIT STATUS
COMMIT HASH
PUSH RESULT
```
