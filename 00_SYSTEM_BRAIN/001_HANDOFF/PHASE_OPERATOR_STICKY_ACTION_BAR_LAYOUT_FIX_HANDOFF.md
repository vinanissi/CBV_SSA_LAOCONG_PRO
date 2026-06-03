# Handoff — OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX

## What was fixed

Sticky bottom **FocusActionBar** no longer covers **Thao tác khác**. The more-menu opens **upward** when `data-cbv-action-bar="sticky-bottom"`.

## How dropdown layering works now

- CSS tokens on `.operational-runtime`: footer 25, dropdown 60.
- Sticky bar keeps `z-20`; menu uses `--cbv-layer-dropdown` (60).
- `work-inbox-more-menu--drop-up` positions menu above the trigger.

## Sticky bar preserved

- Same buttons and handlers (`onPause`, `onForward`, `onComplete`, `onMoreMenuOpen`, `onMoreAction`).
- Scroll body still has `padding-bottom: var(--cbv-sticky-action-bar-offset)`.

## Files changed

- `FocusActionBar.tsx`
- `apps/workboard/src/styles/index.css`
- `00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md`
- `operatorStickyActionBarLayoutFixChecks.ts`

## Manual verification

1. Open focus task with sticky action bar (default three-region inbox).
2. Click **Thao tác khác** — menu opens **above** the bar, all items visible.
3. Click **Sao chép link** — action runs, menu closes.
4. Confirm footer telemetry still visible; scroll checklist — last rows not hidden behind bar.

## Open issues

- Escape key does not close more-menu.
- `FocusTaskWorkspace` hooks-order console warning (pre-existing).

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
