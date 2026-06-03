# Phase Report — CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT` |
| **RCLA** | CBV-RCLA v1.1 |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |

---

## Observed issue

**Tập trung bước** (action button) and **🎯 Đang focus: … | Bỏ focus** rendered on two stacked lines because the button lived in `work-inbox-checklist-focus-workspace` and focus status was a sibling `<p>` below.

**Clarification:** "Tập trung bước" is an action button — preserved.

---

## Root cause

Vertical `space-y` on focus workspace wrapper; focus status block outside the button container.

---

## Fix

| Area | Change |
|------|--------|
| `WorkInboxChecklistSection.tsx` | `work-inbox-checklist-focus-bar` + `__row` wraps button + status |
| `index.css` | Flex single-row, `truncate` on title, `shrink-0` on action |
| Authority | Single-row rule in `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md` |

### Layout after (desktop)

```text
[Tập trung bước]  🎯 Đang focus: <title> | Bỏ focus
```

---

## Tests

| Suite | Result |
|-------|--------|
| `checklistFocusBarSingleRowLayoutChecks.ts` | 12/12 pass |
| Playwright FBS | FBS-01..09, 11..17 PASS; FBS-03 btnY≈statusY |

---

## Warnings

- FBS-10 (very long title ellipsis) not automated — CSS `truncate` applied.
- Pre-existing `FocusTaskWorkspace` Hooks console warning.

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
