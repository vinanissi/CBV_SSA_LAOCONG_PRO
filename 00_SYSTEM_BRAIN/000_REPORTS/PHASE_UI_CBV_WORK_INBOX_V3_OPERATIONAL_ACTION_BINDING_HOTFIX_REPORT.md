# PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_ACTION_BINDING_HOTFIX_REPORT

## Scope

- Audit and hotfix action bindings in Work Inbox V3 only.
- No UI redesign.
- No architecture refactor.
- No API/GAS/Worker changes.

## Action-Binding Audit Table

| Component | Action | Current behavior (before hotfix) | Expected behavior | Fixed? |
|---|---|---|---|---|
| `WorkInboxGroupsPanel` | Focus CTA (`🎯 Focus N việc`) | Click already opened Focus Mode V3 (`setFocusModeActive(true)`) | Open Focus Mode and update UI state | Yes (already correct) |
| `WorkInboxTaskCardV3` | Card click (compact + full card) | Only button inside card was clickable; click on card body did nothing | Click card selects task/open detail route and updates selected task state via route param | **Yes (hotfix applied)** |
| `WorkInboxTaskCardV3` | `Mở xử lý` (primary action button) | Navigated using `primaryActionHref` | Navigate to detail page via `primaryActionHref` | Yes (kept, with propagation guard) |
| `WorkInboxFocusPanel` | `Mở xử lý` | Navigated to `detailHref` | Open detail page for current focus item | Yes (already correct) |
| `WorkInboxFocusPanel` | `Việc tiếp` | Advanced preview focus index | Move to next focus item | Yes (already correct) |
| `WorkInboxFocusModeV3` | `Việc trước` | Moved index backward, disabled at start | Go to previous item when available | Yes (already correct) |
| `WorkInboxFocusModeV3` | `Việc tiếp` | Moved index forward, disabled at end | Go to next item when available | Yes (already correct) |
| `LegacyTaskRuntimePanel` (used in `TasksPage`) | `Hiện Runtime cũ` | Toggled legacy panel open state | Expand legacy runtime | Yes (already correct) |
| `WorkInboxFocusModeV3` | `Hoàn thành` | Disabled button | Keep disabled in Phase E safe mode (no write operation from this UI path) | Intentionally disabled |
| `WorkInboxFocusModeV3` | `Chuyển tiếp` | Disabled button | Keep disabled in Phase E safe mode (stub only) | Intentionally disabled |
| `WorkInboxFocusModeV3` | `Tạm dừng` | Disabled button | Keep disabled in Phase E safe mode (stub only) | Intentionally disabled |

## Broken Actions Found

- `Task Card` body click in V3 was non-responsive (both compact and full variants).  
  Only the internal `Mở xử lý` button had an event binding.

## Root Cause

- Missing card-level click binding in `WorkInboxTaskCardV3`.
- `WorkInboxGroupSection` did not pass a dedicated card-click handler.
- This created a UX mismatch: visual card affordance suggested full-card clickability, but behavior existed only on a nested button.

## Files Changed

- `apps/workboard/src/modules/task/inbox/components/WorkInboxTaskCardV3.tsx`
- `apps/workboard/src/modules/task/inbox/components/WorkInboxGroupSection.tsx`
- `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx`

## Fixed Actions

- Added `onCardClick` binding path from panel -> group section -> task card.
- Enabled full-card activation (`onClick`) for compact and full card layouts.
- Added keyboard activation (`Enter` / `Space`) on card container for operational accessibility.
- Kept primary button behavior and added `stopPropagation()` to prevent duplicate trigger when clicking nested button.

## Remaining Intentionally-Disabled Actions

- `Hoàn thành`, `Chuyển tiếp`, `Tạm dừng` in `WorkInboxFocusModeV3` remain disabled by design:
  - Component already marks these as safe Phase E stubs (`ACTION_STUB_TITLE`).
  - Keeping them disabled avoids unintended write-side behavior outside approved runtime path.
- `Focus CTA` can be disabled when there are zero focus items (guard condition).
- `Việc trước` / `Việc tiếp` in full Focus Mode disable at list boundaries (index guard).

## Build Result

- Command: `npm run build` (workspace: `apps/workboard`)
- Result: **PASS**
- TypeScript: pass
- Vite production build: pass
