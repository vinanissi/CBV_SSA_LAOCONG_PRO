# Checklist Right Panel Dedup — UX Authority

**Status:** LOCKED (PHASE_CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP)  
**Builds on:** `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`

---

## UX rule

```text
Checklist quick actions are CENTER-only.
RIGHT PANEL must not duplicate CENTER quick action panels.
```

Quick-action chips **Phản hồi**, **Tài liệu**, **Liên kết**, **Lịch sử** open editable inline panels **only** in the CENTER checklist column.

The RIGHT panel MUST NOT render `FocusedChecklistStepDetailPanel` or any checklist quick-action summary (superseded by `CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md`).

---

## RIGHT panel allowed content

- Tabs: Chi tiết, Timeline, Handoff, Hồ sơ — see `CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md`

---

## Implementation anchor

- `FocusedChecklistStepDetailPanel` — `data-checklist-right-quick-actions="read-only-summary"`
- `SmartChecklistItemRow` — `syncRightPaneFocus()` (no `openDetailForItem` for section mirror)

---

## Regression guard

Do not re-introduce editable quick-action forms in the RIGHT panel when dual-pane is enabled.
