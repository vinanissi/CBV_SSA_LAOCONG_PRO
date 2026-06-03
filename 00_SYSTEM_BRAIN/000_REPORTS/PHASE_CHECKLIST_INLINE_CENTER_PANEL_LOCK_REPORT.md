# Phase Report — CHECKLIST_INLINE_CENTER_PANEL_LOCK

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK` |
| **Result** | **GO** |
| **Date** | 2026-06-02 |
| **RUNTIME_STATE** | NOT_WIRED |

---

## Previous phase context

- `PHASE_CHECKLIST_ACTION_BINDING_FIX` routed quick actions to the RIGHT pane only under dual-pane (`navigatorOnly`).
- Operator intent: quick actions must stay **inline in CENTER**.

---

## UX rule locked

```text
CENTER = fast checklist operation area
RIGHT PANEL = supplementary mirror / dossier / timeline
```

---

## Root cause

With `navigatorOnly={true}`, inline panels rendered only when `!navigatorOnly && layoutExpanded`. Chip handlers called `openDualPaneSection` first and returned early, so CENTER never mounted panels.

---

## Fix summary

| Area | Change |
|------|--------|
| `SmartChecklistItemRow` | `openCenterInlineSection` opens panels in CENTER; `mirrorRightPane` optional |
| CENTER DOM | `work-inbox-smart-checklist__center-inline-panels` when `navigatorOnly && anyPanelExpanded` |
| Chip state | Local `*Expanded` flags (not right-pane-only) |
| CSS | Center inline attachment styling |
| Authority | `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md` |
| Contract | Dual-pane contract addendum |

---

## Before / after

| Behavior | Before | After |
|----------|--------|-------|
| Click Phản hồi | RIGHT pane only | CENTER inline + optional RIGHT mirror |
| Panel mount | Hidden in navigator rows | Visible under row in CENTER |
| Operator flow | Forced to look right | Stays in checklist column |

---

## Tests

| Suite | Result |
|-------|--------|
| `checklistInlineCenterPanelLockChecks.ts` | GO (7/7) |
| Browser ICP-01..12 | PASS (`phase_tmp/icp_browser_results.json`) |

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun for human sign-off).
