# Phase Handoff — CHECKLIST_INLINE_CENTER_PANEL_LOCK

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK` |
| **Result** | **GO** |
| **Date** | 2026-06-02 |
| **Next** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun) |

---

## UX rule locked

Quick actions **Phản hồi / Tài liệu / Liên kết / Lịch sử** open **inline in CENTER** (below the step). After `PHASE_CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP`, RIGHT shows read-only counts only — see `CHECKLIST_RIGHT_PANEL_DEDUP_AUTHORITY.md`.

---

## Manual verification

1. Start Worker + Workboard (`.env.local` with empty `VITE_CBV_API_BASE_URL`).
2. Open `/inbox/TASK-mpwr16qj-CNBT`, login if needed.
3. Click each chip on a checklist row → panel opens **under the row in the center column** (blue left border).
4. RIGHT panel may show the same section — that is OK.
5. Switch chips → only one center panel active.
6. Reload → click chip again → panel reopens.

---

## Files changed

- `SmartChecklistItemRow.tsx`
- `index.css`
- `FocusedChecklistStepDetailPanel.tsx` (hint text)
- `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`
- `CHECKLIST_DUAL_PANE_RUNTIME_CONTRACT.md` (addendum)
- `checklistInlineCenterPanelLockChecks.ts`

---

## Browser UAT

Recommend operator rerun — center inline behavior is the main acceptance criterion for remaining UAT rows.
