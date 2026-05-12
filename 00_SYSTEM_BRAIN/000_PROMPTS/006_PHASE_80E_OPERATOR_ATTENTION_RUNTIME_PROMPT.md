## PHASE 80E — OPERATOR_ATTENTION_RUNTIME (PROMPT LOG)

Repo PC: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`  
Branch bắt buộc: `phase/from-v2.4.1-TASK-FIN`

Tham chiếu: **CBV Operational Ecosystem Standard V1** — runtime-first, memory-first, append-only, manual-first → auto-later.

## MỤC TIÊU

Nâng HOME_ALERT từ desktop cockpit thành **Operator Attention Runtime**:

- Operator nhìn 3 giây biết việc nào cần xử lý trước.
- Không lộ field kỹ thuật: `CARD_SORT`, `DESKTOP_SORT`, `SORT_KEY`, `SOURCE_HASH`, `TRACE_ID`.
- Action focus rõ; ownership rõ; attention level: Critical / Warning / Waiting / Info.
- AppSheet chỉ hiển thị + bấm action; GAS/Sheet sinh toàn bộ cột display/attention.
- Không VC, không Bot, không auto-trigger production.

## VIỆC PHẢI LÀM (TÓM TẮT)

1. Precheck repo (`git status -sb`, `git branch --show-current`, `git remote -v`); chỉ tiếp tục nếu branch = `phase/from-v2.4.1-TASK-FIN`.
2. Lưu prompt append-only file này (`006_PHASE_80E_...`).
3. Append schema `HOME_ALERT`: `ATTENTION_*`, `ACTION_FOCUS`, `ACTION_HINT`, `ACTION_PRIORITY`, `OWNER_*`, `OPERATOR_*`, `OPERATOR_HIDE_SORT_KEYS` — idempotent; không xoá/rename `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*`; cập nhật `CBV_SCHEMA_MANIFEST` + `CBV_AUDIT_SCHEMA`.
4. GAS `80_HOME_ALERT_RUNTIME.js`: `HomeAlert_enrichAttentionFields_()` + helpers theo spec; gọi từ `HomeAlert_enrichDesktopUxFields_()` sau `DESKTOP_*`; `refresh` + transition giữ nguyên enrich; không phá 80B/80C/80D; không duplicate `ALERT_ID`.
5. AppSheet doc `HOME_ALERT_APPSHEET_SETUP.md`: operator `ALERT_List` / `ALERT_Detail` — không show sort keys; dùng `OPERATOR_*`; sort backend `DESKTOP_SORT` DESC.
6. `HOME_ALERT_DESKTOP_WORKSPACE.md`: operator vs admin debug; checklist tránh lộ `CARD_SORT`.
7. Test console: `HomeAlertAttention_TestConsole_run/_showReport/_copyAiHandoff` — contract `CBV_TEST_CONSOLE_V1`, `envelopeOk: true`, phase `PHASE_80E_OPERATOR_ATTENTION_RUNTIME`.
8. Drive folder + `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID` trong report/handoff; không upload tự động.
9. Report append-only `006_PHASE_80E_OPERATOR_ATTENTION_RUNTIME_REPORT.md`.
10. Handoff append-only `005_PHASE_80E_OPERATOR_ATTENTION_HANDOFF.md`.
11. Git: commit message `phase: add operator attention runtime`; **không** commit `.clasp.json` nếu dirty ngoài phase.

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
