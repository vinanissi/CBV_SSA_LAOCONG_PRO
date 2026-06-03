# Phase Report — OPERATOR_MENU_ESCAPE_CLOSE

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_OPERATOR_MENU_ESCAPE_CLOSE` |
| **RCLA** | CBV-RCLA v1.1 |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |

---

## Observed issue

After sticky layout fix, **Thao tác khác** remained open on ESC and click-outside (SAB-04b FAIL in prior phase).

---

## Root cause

Menu open state (`moreMenuOpen`) had no document-level dismiss listeners; only menu-item handler called `setMoreMenuOpen(false)`.

---

## Fix

| Component | Change |
|-----------|--------|
| `useWorkInboxMoreMenuDismiss.ts` | ESC (capture) + pointerdown outside; focus return to trigger; skip when dialog backdrop present |
| `FocusActionBar.tsx` | Wire hook, refs, toggle trigger, `data-cbv-more-menu`, `onMoreMenuClose` |
| `WorkInboxFocusActionHost.tsx` | `onMoreMenuClose={() => setMoreMenuOpen(false)}` |
| Prop chain | `WorkInboxFocusRuntime` → `FocusTaskWorkspace` |

### Menu close behavior (after)

| Action | Result |
|--------|--------|
| ESC | Close + focus **Thao tác khác** |
| Click outside | Close |
| Menu item | Close (runtime `onMoreAction`) |
| ESC, no menu | No state change |
| Modal open | ESC defers to dialog backdrop |

Sticky drop-up layout unchanged.

---

## Tests

| Suite | Result |
|-------|--------|
| `operatorMenuEscapeCloseChecks.ts` | GO_WITH_WARNINGS (12/12) |
| Playwright MEC | MEC-01..11, 13 PASS |

---

## Warnings

- Pre-existing `FocusTaskWorkspace` React Hooks order console warning (unchanged).

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
