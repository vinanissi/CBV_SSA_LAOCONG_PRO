# Handoff — OPERATOR_MENU_ESCAPE_CLOSE

## What was fixed

**Thao tác khác** now closes on ESC, click-outside, and after selecting an item (unchanged in runtime).

## ESC close

`useWorkInboxMoreMenuDismiss` listens on `document` (capture). If no `.work-inbox-dialog-backdrop`, ESC closes menu and focuses the trigger button.

## Click outside

`pointerdown` on document; ignores clicks inside menu or on trigger.

## Menu item close

`onMoreAction` still calls `setMoreMenuOpen(false)` in `useWorkInboxActionRuntime`.

## Focus return

`requestAnimationFrame(() => anchorRef.current?.focus())` after ESC close.

## Files changed

- `useWorkInboxMoreMenuDismiss.ts` (new)
- `FocusActionBar.tsx`
- `FocusTaskWorkspace.tsx`, `WorkInboxFocusRuntime.tsx`, `WorkInboxFocusActionHost.tsx`
- `UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md`

## Manual verification

1. Open focus task → **Thao tác khác** → ESC → menu gone, focus on button.
2. Open menu → click checklist area → menu closes.
3. Open menu → **Sao chép link** → menu closes, toast/link works.
4. Confirm menu still opens upward above footer.

## Open issues

- `FocusTaskWorkspace` hooks-order warning (pre-existing).

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
