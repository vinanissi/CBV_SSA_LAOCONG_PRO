# UI Sticky Bottom Action Bar Authority

**Phase:** `PHASE_UI_ACTION_BAR_STICKY_BOTTOM`

---

## Zones

| Zone | Role |
|------|------|
| Center scroll body | Current work (checklist) |
| Header | Queue navigation |
| Sticky bottom | Task action controls |
| Right | Context / evidence |

Action bar layout ≠ task runtime redesign.

---

## Dropdown / menu layering (PHASE_OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX)

Sticky operator bars **must not obscure** dropdowns, menus, modals, or active controls.

| Layer | z-index token | Role |
|-------|---------------|------|
| Sticky action bar | `--cbv-layer-sticky-action-bar` (20) | Task actions |
| Footer status bar | `--cbv-layer-footer` (25) | Runtime telemetry |
| Dropdown menus | `--cbv-layer-dropdown` (60) | e.g. **Thao tác khác** |
| Toasts | `--cbv-layer-toast` (80) | Feedback |

When the action bar is `sticky-bottom`, **Thao tác khác** opens **upward** (`work-inbox-more-menu--drop-up`) so items stay above the bar and AppShell footer.

---

## Menu dismiss contract (PHASE_OPERATOR_MENU_ESCAPE_CLOSE)

Operator menus must close on:

| Action | Behavior |
|--------|----------|
| Click outside | Close menu |
| **ESC** | Close menu; return focus to **Thao tác khác** trigger when possible |
| Menu item select | Close after action (`setMoreMenuOpen(false)` in action runtime) |

**ESC priority:** If a `work-inbox-dialog-backdrop` modal is open, ESC follows the modal — not the more-menu.

Implementation: `useWorkInboxMoreMenuDismiss` in `FocusActionBar.tsx`.
