# UI Sticky Bottom Action Bar Contract

**Phase:** `PHASE_UI_ACTION_BAR_STICKY_BOTTOM`  
**Status:** ACTIVE

---

## StickyTaskActionBarContract

```text
stickyBottomEnabled: true (default)
centerInlineActionBarVisible: false (default)
actionsPreserved: openDetail, pause, transfer, complete, more
actionHandlersReused: true
taskDataMutationAllowedByLayout: false
queueMutationAllowedByLayout: false
contentBottomPaddingApplied: true
```

---

## Rules

- Primary actions must not render as large inline block inside scrollable work content (default).
- Sticky bar must not cover checklist tail without scroll padding.
- Handlers reuse existing `FocusActionBar` — no new business logic.

---

## Rollback

```javascript
localStorage.setItem('cbv-focus-inline-action-bar:v1', 'true')
```

or `VITE_FOCUS_INLINE_ACTION_BAR=true`

---

## Next

`PHASE_UI_ACTION_BAR_ADVANCED_SHORTCUTS` (optional)
