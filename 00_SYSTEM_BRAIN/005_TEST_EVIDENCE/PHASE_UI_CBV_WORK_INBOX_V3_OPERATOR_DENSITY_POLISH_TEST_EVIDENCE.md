# TEST EVIDENCE — PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH

**Date:** 2026-05-29

## Build

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## Static suite (`runFocusRuntimeOperatorDensityPolishChecks`)

**File:** `apps/workboard/src/modules/task/inbox/focusRuntimeOperatorDensityPolishChecks.ts`

| ID | Expected |
|----|----------|
| `UI_OPERATOR_DENSITY_PREVIEW_TIMELINE` | Timeline card in right column |
| `UI_OPERATOR_DENSITY_PREVIEW_HANDOFF` | Handoff card below timeline |
| `UI_OPERATOR_DENSITY_PREVIEW_DOCUMENTS` | Documents only if files exist |
| `UI_OPERATOR_DENSITY_TASK_DETAIL_WIRED` | taskDetail → activeDetail → cards |
| `UI_OPERATOR_DENSITY_WORKSPACE_70VH` | 70vh min-height + density class |
| `UI_OPERATOR_DENSITY_REDUCE_BOTTOM_WHITESPACE` | pb-0, main-canvas--focus |
| `UI_RIGHT_PANEL_WIDTH_360_400` | 360–400px (392 default) |
| `UI_1366x768_CORE_CONTENT_VISIBLE` | Density grid + line-clamp |
| `UI_NO_HORIZONTAL_SCROLL` | overflow-x-hidden |
| `UI_THREE_REGION_LAYOUT_PRESERVED` | No legacy panel |

**Suite status:** GO

## Manual checklist (1366×768)

- [ ] No empty band below workspace / next-task
- [ ] Right panel visibly wider (~392px)
- [ ] THÔNG TIN LIÊN QUAN → TIMELINE PREVIEW → HANDOFF PREVIEW stack
- [ ] TÀI LIỆU GẦN ĐÂY only when task has files
- [ ] AI summary + checklist + timeline + action bar visible with ≤1 short scroll
- [ ] No “Ngữ cảnh vận hành” legacy panel
- [ ] Primary / preview link clicks show toast (no silent fail)

Screenshot (operator): `000_REPORTS/assets/work-inbox-v3-operator-density-polish.png`
