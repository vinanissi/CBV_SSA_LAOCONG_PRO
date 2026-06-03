# Phase Report — CHECKLIST_ROW_CLICK_FOCUS_ONLY

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_ROW_CLICK_FOCUS_ONLY` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |

---

## Observed issue

Clicking checklist row title toggled completion because the **title lived inside the checkbox `<label>`**. `onToggle` also called `setFocusedChecklistItemId`, coupling completion with focus.

---

## Root cause

1. HTML label association: title click = checkbox toggle.
2. `WorkInboxChecklistSection` `onToggle` set focus before `toggleItem`.

---

## Fix

| Area | Change |
|------|--------|
| `SmartChecklistItemRow` | Title moved outside completion label; header click focuses via `handleHeaderFocusClick`; checkbox/label `stopPropagation` |
| `WorkInboxChecklistSection` | `onToggle` no longer sets focus; `onActivateStep` toggles focus id |
| CSS | Focusable header + `pointer-events-none` on status glyph overlay |

---

## Interaction after

- **Title/row surface** → focus / unfocus only (RCF-03 PASS).
- **Checkbox** → completion only (handler intact; live API persistence depends on Worker in test env).
- **Chips / Sửa / Copy link** → no completion change (RCF-06..11 PASS).

---

## Tests

| Suite | Result |
|-------|--------|
| `checklistRowClickFocusOnlyChecks.ts` | GO (6/6) |
| Playwright RCF | RCF-03/06-14 PASS; RCF-04 WARN (API did not flip checkbox in headless run) |

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
