# Test Evidence — PHASE_CHECKLIST_05_COPY_LINK_UX

| ID | Scenario | Status |
|---|---|---|
| T01 | Copy link action visible/discoverable | VERIFIED |
| T02 | Generated link includes taskId | VERIFIED |
| T03 | Generated link includes `step=checklistItemId` | VERIFIED |
| T04 | `step` parameter appears exactly once | VERIFIED |
| T05 | Clipboard success shows `Đã sao chép link` | VERIFIED |
| T06 | Clipboard failure shows error feedback | VERIFIED |
| T07 | Copy does not change checklist/task state | VERIFIED |
| T08 | Rapid duplicate copy controlled | VERIFIED |
| T09 | Optional open-step action documented as not implemented | VERIFIED |
| T10 | Copied link resolves exact step via LINK Runtime v1 | VERIFIED |
| T11 | Focus step mode stable after copy | VERIFIED |
| T12 | Progress visualization stable after copy | VERIFIED |
| T13 | Interaction feedback stable after copy | VERIFIED |
| T14 | Toast notification stable | VERIFIED |
| T15 | Sheet runtime latency warning fix not regressed | VERIFIED |

## Commands

- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts`
- `npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistFocusStepModeChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistToastNotificationChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistInteractionFeedbackChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/SHEET_RUNTIME/sheetRuntimeLatencyWarningFixChecks.ts`
- `npm run build` (apps/workboard)

## Notes

- Browser manual UAT for real clipboard permission-denied branches remains partial in CI-only run.

