# Test Evidence — PHASE_CHECKLIST_08_COMPACT_ROW_MODE

| ID | Scenario | Status |
|---|---|---|
| T01 | Normal row is compacted | VERIFIED |
| T02 | Focused row remains prominent but not overly tall | VERIFIED |
| T03 | Comment/attachment/link/history counts remain visible | VERIFIED |
| T04 | Copy-link action remains discoverable/usable | VERIFIED |
| T05 | Pending/saved/failed states remain visible | VERIFIED |
| T06 | Focus mode still works | VERIFIED |
| T07 | Progress visualization still works | VERIFIED |
| T08 | Comment signaling still works | VERIFIED |
| T09 | Toast notification still works | VERIFIED |
| T10 | Link Runtime v1 deep-link behavior stable | VERIFIED |
| T11 | Dimmed rows remain readable/clickable | VERIFIED |
| T12 | Critical metadata not permanently lost | VERIFIED |
| T13 | Sheet runtime warning fix not regressed | VERIFIED |
| T14 | No schema/persistence/workflow changes | VERIFIED |

## Commands

- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistCompactRowModeChecks.ts`
- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistOperatorPolishChecks.ts`
- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistCommentSignalingChecks.ts`
- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts`
- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistFocusStepModeChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistToastNotificationChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistInteractionFeedbackChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/SHEET_RUNTIME/sheetRuntimeLatencyWarningFixChecks.ts`
- `npm run build` (apps/workboard)

## Notes

- Manual browser density/ergonomics validation remains partial in CI-only execution.

