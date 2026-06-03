# Test Evidence — PHASE_LINK_03_DEEP_LINK_UAT_LOCK

## UAT matrix

| ID | Scenario | Evidence | Status |
|----|----------|----------|--------|
| T01 | Normal deep link -> target checklist item resolved | Static diagnostics + deferred resolver code review + prior manual flow notes from LINK_01 handoff | PARTIALLY_VERIFIED |
| T02 | Slow Google Sheet runtime -> pending state retained | Deferred state machine checks (`PENDING_CHECKLIST_DATA`) | VERIFIED |
| T03 | Retry state -> pending state retained | Deferred state machine + bounded retry/backoff checks | VERIFIED |
| T04 | Aborted then retry -> pending retained and resolves after readiness | Code-level timeout/retry guard validated; no live aborted browser trace captured | PARTIALLY_VERIFIED |
| T05 | Delayed checklist data -> resolves after readiness | Guard logic for `checklistLoading/checklistReady` + retry loop | VERIFIED |
| T06 | Delayed DOM render -> resolves after DOM readiness | DOM readiness gate via `checklistItemDomId()` lookup | VERIFIED |
| T07 | Missing step -> non-blocking warning + final explicit failure | `FAILED_MISSING_STEP` path + non-blocking hint + cleanup | VERIFIED |
| T08 | Invalid step -> non-blocking warning, no runtime break | Invalid/missing id converges to explicit final failure path | VERIFIED |
| T09 | No step param -> normal task open | `IDLE` path when `step` absent | VERIFIED |
| T10 | Regression no premature URL cleanup | Cleanup only in final states (`RESOLVED`, `FAILED_*`) | VERIFIED |
| T11 | Runtime usable after timeout/failure | Timeout path is non-blocking and leaves checklist runtime active | PARTIALLY_VERIFIED |

---

## Partial / skipped rationale

### T01 (PARTIALLY_VERIFIED)
- **Reason:** No dedicated manual browser replay recorded in this phase run.
- **Risk:** Minor risk of visual/interaction mismatch in real browser.
- **Follow-up action:** Execute operator browser pass in next LINK UAT phase.
- **Blocks GO?:** Yes for strict UAT completeness; therefore this phase remains GO_WITH_WARNINGS.

### T04 (PARTIALLY_VERIFIED)
- **Reason:** Real aborted-network-to-retry transition not captured as browser artifact.
- **Risk:** Retry UX timing may differ under real transport jitter.
- **Follow-up action:** Capture browser log/screenshot evidence under simulated abort+retry.
- **Blocks GO?:** Yes for strict UAT lock confidence.

### T11 (PARTIALLY_VERIFIED)
- **Reason:** Verified by code and diagnostics but not by full manual operator session.
- **Risk:** Low; non-blocking behavior could still present minor UX friction.
- **Follow-up action:** Manual timeout scenario playback in operator environment.
- **Blocks GO?:** No (non-blocking), but keeps warning.

---

## Commands executed

- `npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts`
- `npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts`
- `npm run build` (apps/workboard)

