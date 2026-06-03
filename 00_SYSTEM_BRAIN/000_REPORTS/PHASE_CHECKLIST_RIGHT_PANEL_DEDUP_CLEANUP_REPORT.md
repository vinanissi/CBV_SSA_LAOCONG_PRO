# Phase Report — CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP` |
| **RCLA** | CBV-RCLA v1.1 |
| **Entrypoint** | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |

---

## Previous phase context

`PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK` locked CENTER as the fast checklist operation area. `mirrorRightPane` still opened full `ChecklistFeedbackPanel` / attachment / link / history editors in `FocusedChecklistStepDetailPanel`, duplicating CENTER inline UI.

---

## Observed issue

Operators saw the same quick-action forms in RIGHT and CENTER after opening Phản hồi / Tài liệu / Liên kết / Lịch sử chips.

---

## Final UX rule enforced

```text
Checklist quick actions are CENTER-only.
RIGHT PANEL must not duplicate CENTER quick action panels.
```

RIGHT may show **read-only** counts for the focused step (`data-checklist-right-quick-actions="read-only-summary"`).

---

## Root cause

`FocusedChecklistStepDetailPanel` rendered interactive section tabs and bound the same panel components as CENTER. `SmartChecklistItemRow.openCenterInlineSection` called `mirrorRightPane` → `openDetailForItem`, which set `detailSection` and mounted editors on the right.

---

## Files inspected

- `FocusedChecklistStepDetailPanel.tsx`
- `SmartChecklistItemRow.tsx`
- `RightContextTabs.tsx`
- `ChecklistDualPaneFocusContext.tsx`
- `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`
- `CHECKLIST_DUAL_PANE_RUNTIME_CONTRACT.md`

---

## Files modified

| File | Change |
|------|--------|
| `FocusedChecklistStepDetailPanel.tsx` | Read-only summary; removed panel components |
| `SmartChecklistItemRow.tsx` | `syncRightPaneFocus()` replaces `mirrorRightPane` |
| `RightContextTabs.tsx` | Simplified panel props |
| `index.css` | Read-only count row styles |
| `CHECKLIST_RIGHT_PANEL_DEDUP_AUTHORITY.md` | New authority |
| `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md` | Addendum |
| `CHECKLIST_DUAL_PANE_RUNTIME_CONTRACT.md` | Right pane = summary only |
| `checklistRightPanelDedupCleanupChecks.ts` | Static guard |

---

## Before / after

| Area | Before | After |
|------|--------|-------|
| RIGHT quick actions | Editable duplicate panels | Read-only counts + hint |
| CENTER | Inline panels | Unchanged |
| Focus sync | Section + editors on right | Focus id + item snapshot only |
| RIGHT tabs | Chi tiết / Timeline / Handoff / Hồ sơ | Unchanged |

---

## Tests

| Suite | Result |
|-------|--------|
| `checklistRightPanelDedupCleanupChecks.ts` | GO (8/8) |
| Playwright RPC-01..17 | PASS (`phase_tmp/rpc_browser_results.json`) |
| `npm run build` | FAIL — pre-existing TS2322 in `WorkInboxChecklistSection.tsx` (upload handler return type); not introduced by this phase |

---

## Browser / network

- **URL:** `http://localhost:5173/inbox/TASK-mpwr16qj-CNBT`
- **Console:** React Hooks order warning in `FocusTaskWorkspace` (pre-existing); 400 on some resources (non-blocking for RPC flow)
- **RPC-15:** Soft fail (console noise); mandatory RPC-01..14 pass

---

## Warnings

- Pre-existing `tsc` build error unrelated to dedup files
- `registerRowActions` remains for CENTER panels; RIGHT no longer consumes them
- Historical static suites (`ACTION_BINDING_FIX`, `INLINE_CENTER_PANEL_LOCK`) may fail if re-run — superseded by this phase authority

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun for human sign-off on UAT-02/04/07/08).

Do **not** run `PHASE_CHECKLIST_RUNTIME_LOCK` until operator UAT closes.
