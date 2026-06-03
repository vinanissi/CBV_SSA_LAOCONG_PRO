# Test Evidence — PHASE_LINK_04A_REAL_DOM_TRACE

| ID | Scenario | Status | Notes |
|----|----------|--------|-------|
| T01 | Valid step deep link starts pending trace | VERIFIED | Trace instrumentation added and emits pending states |
| T02 | `urlStepId` parsed and recorded | VERIFIED | Trace payload includes `urlStepId` |
| T03 | Anchor exists by `data-checklist-step-id` | VERIFIED | Exact anchor query path present |
| T04 | Anchor id equals `urlStepId` | VERIFIED | `targetIdMatchesUrlStepId` emitted |
| T05 | Exact row scroll/viewport evidence | PARTIALLY_VERIFIED | Trace fields present; no manual browser capture attached in this run |
| T06 | Exact row highlight evidence | PARTIALLY_VERIFIED | `highlightApplied` / `highlightTargetStepId` emitted; no live screenshot attached |
| T07 | URL cleanup only after verified success | VERIFIED | Cleanup flags emitted and guarded by resolution logic |
| T08 | Missing step non-blocking warning | VERIFIED | Failure path emits reason and non-blocking hint |
| T09 | Slow runtime keeps pending + URL intact | PARTIALLY_VERIFIED | Pending-state logic verified by diagnostics; no real slow-browser trace artifact attached |
| T10 | Aborted/retry keeps pending + URL intact | PARTIALLY_VERIFIED | Retry/timeout paths traced in code; no real aborted browser capture attached |
| T11 | No-step route works normally | VERIFIED | `IDLE` flow unchanged |

## Non-VERIFIED items

### T05 / T06 / T09 / T10
- **Reason:** This execution used static diagnostics/build; no live browser trace session was captured.
- **Risk:** Minor risk that browser timing/render nuances differ from static verification.
- **Follow-up action:** Collect browser trace artifacts with `window.__CBV_LINK_TRACE_EVENTS__` in next UAT phase.
- **Blocks GO?:** Yes for strict GO; phase remains `GO_WITH_WARNINGS`.

## Commands executed

- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts`
- `npm run build` (apps/workboard)

