# Handoff — CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT

## What changed

Checklist focus controls use **`work-inbox-checklist-focus-bar__row`** — one flex row for **Tập trung bước** + focus status + **Bỏ focus**.

## Preserved behavior

- **Tập trung bước** still enters focus workspace mode.
- Row click focus, checkbox completion, inline chips unchanged.
- Step **title** in status (fallback `bước đang chọn`).

## Responsive

- `flex-wrap` on narrow viewports; title ellipsizes via `truncate`.

## Files

- `WorkInboxChecklistSection.tsx`
- `apps/workboard/src/styles/index.css`
- `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`

## Manual check

1. Open task checklist → click a step title.
2. Confirm one line: `[Tập trung bước] 🎯 Đang focus: <name> | Bỏ focus`.
3. **Bỏ focus** clears; **Tập trung bước** still works.

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
