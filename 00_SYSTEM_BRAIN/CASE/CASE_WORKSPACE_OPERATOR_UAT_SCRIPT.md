# Case Workspace — Operator UAT Script

**Phases:** `PHASE_CASE_REFACTOR_04_OPERATOR_UAT` · `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT`  
**Surface:** Work Inbox Focus → Case Workspace  
**Duration:** 1–3 working days; target 3–5 operators, 20–50 cases

---

## Prerequisites (`.env.local`)

```env
VITE_CASE_WORKSPACE_ENABLED=true
VITE_CBV_API_BASE_URL=<staging worker URL>
VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db

# Optional session counters (sessionStorage only):
VITE_CASE_WORKSPACE_UAT_TELEMETRY=true
```

Restart dev server after env change.

---

## Session setup

1. Clear prior UAT counters (if telemetry ON):  
   `sessionStorage.removeItem('cbv_case_workspace_uat_v1')`
2. Open `/inbox` → enter Focus on real/staging tasks.
3. End session: DevTools console →  
   `copy(window.__CASE_WORKSPACE_UAT_EXPORT__())`  
   Paste JSON into `CASE_WORKSPACE_OPERATOR_EVIDENCE_LOG.md`.

---

## Session flow (per case)

1. Open Work Inbox.
2. Select a work item (real/staging).
3. Confirm **Case Workspace** visible (header "Case đang xử lý").
4. Identify: Case title, type badge, workflow state, responsible.
5. Identify current Task under "Công việc trong Case" (Đang thực hiện).
6. Use Checklist (toggle/add if safe).
7. Open/inspect Documents (links + attachment section).
8. Review Timeline preview; open right panel **Timeline** tab if needed.
9. Review Handoff preview; open right panel **Handoff** tab if needed.
10. Execute one safe Task action (e.g. add note, toggle checklist) if appropriate.
11. Record success/failure and friction.
12. Repeat for next case (target ≥20 cases total across team).

---

## Scenarios (O1–O10)

| ID | Profile | Observe | Pass |
|----|---------|---------|------|
| O1 | Task-only | Case header + task under case | Operator names case matter in own words |
| O2 | HO_SO anchored | Context strip / HO_SO relation | Faster hồ sơ context |
| O3 | Finance ref (STAFF) | Privacy / warnings | No leaked sensitive data |
| O4 | Weak discovery | Diagnostic banner | No fabricated case data |
| O5 | Checklist heavy | Checklist (Case) section | Usable without confusion |
| O6 | With attachments | Documents (Case) | Can find/open docs |
| O7 | With timeline | Timeline preview + right tab | Recent activity understandable |
| O8 | Handoff history | Handoff section + right tab | Continuation context clear |
| O9 | Task action | Complete / assign / note | Action succeeds (≥90% target) |
| O10 | Flag OFF | Remove workspace flag, reload | Legacy Focus restored, no gap |

---

## Feedback questions (Vietnamese)

Record exact operator words where possible:

1. Bạn có hiểu ngay đây là Case gì không?
2. Bạn có thấy việc hiện tại nằm trong Case không?
3. Checklist có dễ xử lý hơn trước không?
4. Tài liệu có dễ tìm không?
5. Timeline/Handoff có hữu ích không?
6. Nút lệnh cũ có còn dễ dùng không?
7. Phần nào gây rối?
8. Phần nào nên bỏ?
9. Phần nào nên giữ?
10. Bạn muốn dùng giao diện Case này tiếp không?

---

## Safety

- Prefer **staging** over production when unsure.
- Do not run destructive bulk actions for UAT.
- Do not invent metric scores — leave blank until observed.

---

## In-app recorder (04B — staging only)

When `VITE_CASE_WORKSPACE_UAT_TELEMETRY=true`, a yellow **UAT — ghi nhận operator** panel appears at the bottom of Case Workspace.

| Button | Records |
|--------|---------|
| Hiểu case | `understanding_yes` |
| Đã dùng checklist | `checklist_used` |
| Đã xem tài liệu | `document_access` |
| Đã xem timeline | `timeline_viewed` |
| Đã xem handoff | `handoff_viewed` |
| Ghi ma sát | `friction` + short text |

End of session:

1. **Copy metrics JSON** (panel button) or console `__CASE_WORKSPACE_UAT_EXPORT__()`.
2. Paste into `CASE_WORKSPACE_OPERATOR_EVIDENCE_LOG.md` (telemetry section).
3. Append a session row with operator ID, date, and qualitative feedback (Q1–Q10).

**Rule:** Only click after the operator actually performed the action. Do not pre-fill gates.

---

## Telemetry events (optional)

Operators use the in-app panel or console export; friction also in evidence log free text.

---

*Operator-maintained — CASE_REFACTOR_04 / 04B.*
