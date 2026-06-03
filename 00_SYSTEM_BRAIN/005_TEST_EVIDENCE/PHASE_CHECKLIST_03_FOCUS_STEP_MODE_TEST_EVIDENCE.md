# Test Evidence — PHASE_CHECKLIST_03_FOCUS_STEP_MODE

| ID | Scenario | Evidence | Status |
|----|----------|----------|--------|
| T01 | Clicking row sets focused state | `setFocusedChecklistItemId(item.id)` wiring in row actions | VERIFIED |
| T02 | Only one row focused at a time | single `focusedChecklistItemId` source of truth | VERIFIED |
| T03 | Non-focused rows dimmed/readable | `.work-inbox-smart-checklist__row--dimmed` opacity 0.72 | VERIFIED |
| T04 | Non-focused rows remain usable | no disabled lock for dimmed rows | VERIFIED |
| T05 | Focus can be cleared | `Bỏ focus` button -> `setFocusedChecklistItemId(null)` | VERIFIED |
| T06 | Deep-link resolved row focused | effect maps `highlightedItemId` to focused id | VERIFIED |
| T07 | Deep-link highlight + focus compatible | row can hold both cross-focus and focused classes | PARTIALLY_VERIFIED |
| T08 | Pending/saved/failed feedback still works | phase-01 checks pass | VERIFIED |
| T09 | Toast still works | phase-02 checks pass | VERIFIED |
| T10 | Copy step link still works | existing copy-link handlers unchanged + checks pass | VERIFIED |
| T11 | Link Runtime v1 deep-link still works | deferred-step checks pass | VERIFIED |
| T12 | Sheet latency warning fix unchanged | sheet runtime checks pass | VERIFIED |

## Commands executed

- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistFocusStepModeChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistToastNotificationChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistInteractionFeedbackChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/SHEET_RUNTIME/sheetRuntimeLatencyWarningFixChecks.ts`
- `npm run build` (apps/workboard)

## Partial verification notes

- T07 needs manual browser visual confirmation for final animation/perception compatibility.

