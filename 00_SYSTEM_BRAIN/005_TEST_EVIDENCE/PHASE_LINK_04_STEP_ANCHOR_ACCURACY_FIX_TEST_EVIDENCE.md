# Test Evidence — PHASE_LINK_04_STEP_ANCHOR_ACCURACY_FIX

| ID | Test item | Evidence | Status |
|----|-----------|----------|--------|
| T01 | Checklist rows expose stable `data-checklist-step-id` | `SmartChecklistItemRow` DOM attributes | VERIFIED |
| T02 | Selector finds exact checklistItemId anchor | `getChecklistStepElement(stepId)` exact attribute query | VERIFIED |
| T03 | No index/text/container primary resolution | Consumer logic + diagnostics checks for exact anchor path | VERIFIED |
| T04 | Scrolls exact target row | viewport verification helper + resolution guard | PARTIALLY_VERIFIED |
| T05 | Highlights exact target row | `data-deep-link-target` marker on target row + verification check | VERIFIED |
| T06 | URL clears only after exact verified resolution | cleanup only inside verified `RESOLVED` path | VERIFIED |
| T07 | URL not cleared when verification fails | `FAILED_TARGET_VERIFY` path keeps retry/guard until final timeout | VERIFIED |
| T08 | Missing step non-blocking warning | `FAILED_MISSING_STEP` path with non-blocking hint | VERIFIED |
| T09 | Delayed DOM resolves after anchor appears | `PENDING_DOM` + retry loop | VERIFIED |
| T10 | Slow runtime remains pending | `PENDING_CHECKLIST_DATA` guards | VERIFIED |
| T11 | Aborted/retry remains pending | bounded retry and timeout flow | PARTIALLY_VERIFIED |
| T12 | No step param opens normally | `IDLE` path | VERIFIED |

## Commands executed

- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts`
- `npm run build` (apps/workboard)

## Partial verification notes

- T04/T11 are partially verified because browser-level visual confirmation under real Google Sheet latency/abort patterns was not recorded in this CI-only run.

