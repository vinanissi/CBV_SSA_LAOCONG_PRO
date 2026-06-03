# UI Reduced Primary Action Bar Contract

**Phase:** `PHASE_UI_ACTION_BAR_REDUCE_PRIMARY_ACTIONS`  
**Status:** ACTIVE

---

## ReducedPrimaryActionBarContract

```text
reducedPrimaryActionsEnabled: true (default, sticky bar)
primaryActions: pause, transfer, complete, more
demotedActions: openDetail (when right panel visible)
openDetailAccessibleViaMoreOrRightPanel: true
actionHandlersReused: true
contentBottomPaddingPreserved: true
```

---

## Rules

- **Mở chi tiết** not dominant when right panel detail region is visible.
- **Mở chi tiết** in **Thao tác khác** menu (same `onPrimary` handler).
- Fallback: show **Mở chi tiết** as secondary button when right panel unavailable.

---

## Rollback

```javascript
localStorage.setItem('cbv-focus-full-primary-action-bar:v1', 'true')
```

or `VITE_FOCUS_FULL_PRIMARY_ACTION_BAR=true`

---

## Next

`PHASE_UI_ACTION_BAR_SHELL_DOCKING`
