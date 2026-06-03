# Phase Report — CHECKLIST_ACTION_BINDING_FIX

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_ACTION_BINDING_FIX` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |
| **RUNTIME_STATE** | NOT_WIRED |

---

## Previous phase context

- `PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX` restored FE → Worker → GAS.
- `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` rerun: **GO_WITH_WARNINGS** — checklist UI loads; inline action chips appeared non-functional.

---

## Observed bug

Operator-visible chips **Phản hồi / Tài liệu / Liên kết / Lịch sử** on checklist rows rendered and accepted clicks but **no panel opened** (silent failure).

---

## Root cause

`isChecklistDualPaneRuntimeEnabled()` is **always true** → every checklist row uses `navigatorOnly={dualPaneOn}`.

In `SmartChecklistItemRow`:

- Inline chips call `handle*Action` and set local `*Expanded` state.
- Detail panels (`ChecklistFeedbackPanel`, etc.) render only under `!navigatorOnly && layoutExpanded`.
- With dual-pane, panels live in `FocusedChecklistStepDetailPanel` (right column) but **were not wired** to inline chip clicks.

**Before:** chip click → local state only → no visible UI.  
**After:** chip click → `openDetailForItem` + right pane section + panel `expanded`.

---

## Action binding map

| Button | Before | After |
|--------|--------|-------|
| Phản hồi | Local `feedbackExpanded` only | `openDetailForItem(id, 'feedback')` → right `ChecklistFeedbackPanel` |
| Tài liệu | Local `attachmentsExpanded` only | `openDetailForItem(id, 'attachments')` → `ChecklistAttachmentPanel` |
| Liên kết | Local `linksExpanded` only | `openDetailForItem(id, 'links')` → `ChecklistLinkPanel` |
| Lịch sử | Local `historyExpanded` only | `openDetailForItem(id, 'history')` → `ChecklistHistoryPanel` |

---

## Files modified

| File | Change |
|------|--------|
| `ChecklistDualPaneFocusContext.tsx` | `detailSection`, `openDetailForItem`, `registerRowActions` |
| `SmartChecklistItemRow.tsx` | Dual-pane bridge + active chip sync |
| `FocusedChecklistStepDetailPanel.tsx` | Context-driven sections + mutation callbacks |
| `WorkInboxChecklistSection.tsx` | Register row actions for right pane |
| `checklistActionBindingFixChecks.ts` | Static regression suite |
| `checklistDualPaneRuntimeChecks.ts` | Bridge check |

---

## Test results

| Test | Result |
|------|--------|
| Static `checklistActionBindingFixChecks` | PASS |
| ABF-01..04 (browser Playwright) | PASS |
| ABF-05 no silent fail | PASS |
| ABF-06 after refresh | FAIL (panel needs re-click post-reload) |
| ABF-09 blocking console | PASS (Hooks warning non-blocking) |

Evidence: `phase_tmp/abf_browser_results.json`, `phase_tmp/abf_screenshots/`.

---

## Warnings

- `FocusTaskWorkspace` React Hooks order warning (pre-existing).
- After full page refresh, operator must click chip again (ABF-06).
- `CaseWorkspace` path without `ChecklistDualPaneFocusProvider` still uses non-dual-pane row expansion (unchanged).

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun) for human sign-off on UAT-02/04/07/08 and action chips.

Do **not** execute `PHASE_CHECKLIST_RUNTIME_LOCK` in this phase.
