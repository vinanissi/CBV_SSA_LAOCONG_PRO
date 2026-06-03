# Test Evidence — PHASE_CHECKLIST_06_COMMENT_SIGNALING

| ID | Scenario | Status |
|---|---|---|
| T01 | Zero-comment row shows neutral signal | VERIFIED |
| T02 | Row with comments shows correct count | VERIFIED |
| T03 | `count > 0` is visually distinguishable | VERIFIED |
| T04 | Unread/new marker appears only when data supports it | VERIFIED (not supported, thus not rendered) |
| T05 | No unread/new marker fabricated | VERIFIED |
| T06 | Feedback/comment button remains clickable | VERIFIED |
| T07 | Feedback panel open behavior unchanged | VERIFIED |
| T08 | Focus step mode remains stable | VERIFIED |
| T09 | Progress visualization remains correct | VERIFIED |
| T10 | Copy link UX remains stable | VERIFIED |
| T11 | Toast notification still works | VERIFIED |
| T12 | Interaction feedback still works | VERIFIED |
| T13 | Link Runtime v1 deep-link behavior stable | VERIFIED |
| T14 | Sheet runtime warning fix not regressed | VERIFIED |

## Commands

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

- Browser visual/UAT confirmation is partial in CI-only run.

