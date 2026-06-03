# LINK Runtime v1 Lock

**Runtime name:** LINK Runtime  
**Runtime version:** v1  
**Lock phase:** `PHASE_LINK_03_DEEP_LINK_UAT_LOCK`  
**Status:** CONDITIONAL_LOCK (GO_WITH_WARNINGS)

---

## Locked behaviors

- Parse `?step=<checklistItemId>` from `/inbox/<taskId>?step=<checklistItemId>`.
- Store pending step and keep pending while readiness conditions are not met.
- Resolve by exact stable anchor `data-checklist-step-id=<checklistItemId>`.
- Wait for task readiness, checklist data readiness, and checklist DOM readiness.
- Retry step resolution with bounded backoff.
- Scroll/highlight exact target checklist row once resolved.
- Verify anchor id match + viewport proximity + target highlight marker before URL cleanup.
- Clear URL step parameter only after verified success or final explicit failure.
- Show non-blocking warning for missing/timeout cases.
- Preserve task runtime usability after timeout/failure.

## Supported URL format

`/inbox/<taskId>?step=<checklistItemId>`

## Deferred resolution rules

- Pending states: `PENDING_TASK`, `PENDING_CHECKLIST_DATA`, `PENDING_DOM`, `RESOLVING`
- Final states: `RESOLVED`, `FAILED_TIMEOUT`, `FAILED_MISSING_STEP`
- No premature stale warning or URL cleanup before final state.

## Known warnings

- Browser/UAT evidence for real Google Sheet slow/retry/aborted conditions is partial in CI-only validation.
- Smooth scroll/highlight visual behavior requires operator browser confirmation.
- Real DOM trace capture (`__CBV_LINK_TRACE_EVENTS__`) should be recorded in UAT when precision regressions are investigated.

## Open limitations

- No deterministic CI fixture currently reproduces live Google Sheet aborted+retry transitions end-to-end.
- Clipboard/runtime visual confirmations remain environment-dependent.

## Regression checklist

- `npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npm run build` (apps/workboard)

## Unlock conditions

- Checklist data model change
- Task route change
- Sheet/Drive runtime change
- Cross-focus navigation change
- DOM checklist structure change
- Mobile runtime introduction
- Workflow engine introduction

## Next allowed phase

`PHASE_LINK_04_RUNTIME_HARDENING` (or project-defined LINK_04 successor)

