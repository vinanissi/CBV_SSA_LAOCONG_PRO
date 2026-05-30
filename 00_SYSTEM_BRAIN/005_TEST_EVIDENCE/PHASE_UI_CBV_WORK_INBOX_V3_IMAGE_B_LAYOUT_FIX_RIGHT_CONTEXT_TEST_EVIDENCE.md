# TEST EVIDENCE — PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT

**Date:** 2026-05-29

## Build / typecheck

| Command | Result |
|---------|--------|
| `npm run typecheck` (apps/workboard) | PASS |
| `npm run build` (apps/workboard) | PASS |

## Static suite (`runFocusRuntimeLayoutFixChecks`)

**File:** `apps/workboard/src/modules/task/inbox/focusRuntimeLayoutFixChecks.ts`

| ID | Label | Expected |
|----|-------|----------|
| `UI_NO_LEGACY_CONTEXT_PANEL` | DetailPanel null on inbox V3 | PASS (source) |
| `UI_RIGHT_CONTEXT_TABS_OUTER_LEVEL` | Portal to `#cbv-right-context-root` | PASS (source) |
| `UI_WORKSPACE_HAS_EXACTLY_THREE_REGIONS` | No DetailPanel in three-region branch | PASS (source) |
| `UI_NO_NESTED_RIGHT_TABS_IN_MAIN` | workspace-only runtime | PASS (source) |
| `UI_NO_NESTED_SCROLL_LAYOUT` | focus-workspace scroll + pass-through shell | PASS (source) |
| `UI_1366x768_FOCUS_VISIBLE` | `useThreeRegionFocusLayout` + width tokens | PASS (source) |
| `UI_NO_HORIZONTAL_SCROLL` | `overflow-x-hidden` on workspace layout | PASS (source) |
| `UI_LAYOUT_PROVIDER_AT_APP` | Provider wraps AppShell | PASS (source) |
| `UI_PRIMARY_ACTION_BOUND` | FocusActionBar in workspace | PASS (source) |

**Suite status (static review):** GO

> Note: `npx tsx` cannot evaluate `?raw` imports without Vite; use `npm run build` + source inspection or a Vite-aware runner.

## Manual UI checklist (operator)

Environment: `npm run dev`, `/inbox`, focus flags on, viewport **1366×768**.

- [ ] **NGỮ CẢNH VẬN HÀNH** legacy aside not visible
- [ ] Right column shows tab strip only (Chi tiết default)
- [ ] No duplicate left nav inside main
- [ ] **Bắt đầu xử lý** visible without scrolling past multiple nested cards
- [ ] **Việc tiếp theo** card visible or one short scroll
- [ ] Primary / secondary actions respond (no silent click)

## Screenshot

Capture after manual pass: `000_REPORTS/assets/work-inbox-v3-layout-fix-right-context.png` (operator to add).
