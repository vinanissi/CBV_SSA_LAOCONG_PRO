# Test Evidence — PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME

## Static suite

- `apps/workboard/src/modules/task/inbox/checklist/checklistDualPaneRuntimeChecks.ts`

## Regression suites invoked by static checks

- `checklistFocusWorkspaceChecks.ts`
- `checklistInteractionFeedbackChecks.ts`
- `checklistToastNotificationChecks.ts`
- `checklistProgressVisualizationChecks.ts`
- `checklistCopyLinkUxChecks.ts`
- `checklistCommentSignalingChecks.ts`
- `checklistCompactRowModeChecks.ts`
- `deferredStepResolutionChecks.ts`
- `sheetRuntimeLatencyWarningFixChecks.ts`

## Build

- `npm run build` in `apps/workboard` (record output in CI/local run).

## Manual (partial)

- Select checklist step → right pane updates.
- Deep link `?step=` → focus + right pane.
- Focus workspace prev/next → right pane follows.
- Clear focus → right pane empty prompt.
- Dossier tab still shows task-level aggregate.
