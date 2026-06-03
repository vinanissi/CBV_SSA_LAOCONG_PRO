# Case Workspace — Live Operator UAT Script

**Phase:** `PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT`  
**Surface:** Work Inbox → Focus → Case Workspace (+ right panel tabs)  
**Prerequisites:** `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT` (recorder + telemetry)

---

## Minimum UAT target

| Target | Minimum |
|--------|---------|
| Operators | 3 |
| Cases exercised | 20 |
| Operator actions | 100+ |

Record **actual** counts in `CASE_WORKSPACE_LIVE_OPERATOR_EVIDENCE_LOG.md`. If below minimum, document reason and whether evidence is still useful.

---

## Environment (staging)

```env
VITE_CASE_WORKSPACE_ENABLED=true
VITE_CASE_WORKSPACE_UAT_TELEMETRY=true
VITE_CBV_API_BASE_URL=<staging worker>
VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
```

Restart dev server after env change.

---

## Per-operator session

1. **Start:** `sessionStorage.removeItem('cbv_case_workspace_uat_v1')` (fresh counters).
2. Open `/inbox` → Focus on real staging tasks only.
3. For each case (target ≥7 cases/operator for team total ≥20):
   - Confirm header **Case đang xử lý** and case title/type/state/responsible.
   - Identify **Công việc đang thực hiện** in case task list.
   - Use checklist (toggle/add if safe) → panel **Đã dùng checklist**.
   - Open documents (links + attachments) → **Đã xem tài liệu**.
   - Review timeline preview; open right **Timeline** if needed → **Đã xem timeline**.
   - Review handoff; open right **Handoff** if needed → **Đã xem handoff**.
   - Use focus **action bar** (assign, note, status, etc. as appropriate) → **Action bar OK** only on success.
   - If confused → **Bối rối** + friction text.
   - If understood case → **Hiểu case** (once per case).
4. **End:** Copy metrics JSON → paste under evidence log telemetry section; append detailed session row.

---

## Scenarios (L1–L12)

| ID | Focus | Pass signal |
|----|-------|-------------|
| L1 | Case identity | Operator states case type/purpose in own words |
| L2 | Current task in case | Points to "Đang thực hiện" row |
| L3 | HO_SO / relation context | Strip or discovery line useful |
| L4 | Checklist (Case) | Completes without asking "which task?" |
| L5 | Documents | Finds attachment or doc link |
| L6 | Timeline preview + tab | Understands recent activity |
| L7 | Handoff preview + tab | Understands next owner/action |
| L8 | Action bar | Completes one safe command successfully |
| L9 | Finance / privacy (STAFF) | No inappropriate data shown |
| L10 | Weak discovery | Diagnostic visible; no fake case |
| L11 | Multi-tab workflow | Right panel + workspace together |
| L12 | Rollback check (facilitator) | Flag OFF → legacy Focus OK |

---

## Required log fields (per action row)

Append to evidence log **action detail** table:

`Operator | Case ref | Task ref | Timestamp | Scenario | Action | Completed | Success | Friction | Confusion | Comment | Evidence ref`

---

## Feedback (Vietnamese — record verbatim)

1. Bạn hiểu ngay đây là Case gì không?  
2. Việc hiện tại có rõ nằm trong Case không?  
3. Checklist có dễ hơn trước không?  
4. Tài liệu có dễ tìm không?  
5. Timeline/Handoff có hữu ích không?  
6. Thanh lệnh (action bar) có còn dùng được không?  
7. Phần nào gây rối?  
8. Phần nào nên bỏ / giữ?  
9. Có blocker nghiêm trọng không?  
10. Bạn muốn tiếp tục dùng Case Workspace không?

---

## Safety

- Staging preferred; no destructive bulk actions.
- **Do not** click UAT buttons without performing the action.
- **Do not** invent metric percentages — export JSON + facilitator math only.

---

## After team UAT

1. Update `CASE_WORKSPACE_LIVE_OPERATOR_METRICS.md` from exported JSON (actual values only).
2. Update `CASE_WORKSPACE_LIVE_OPERATOR_FEEDBACK_SUMMARY.md`.
3. Notify reviewer to run `runCaseWorkspaceLiveOperatorUat04cChecks()`.

---

*Live UAT only — CASE_REFACTOR_04C.*
