# Phase 107 — Milestone 01 test envelope & Drive bundle report

**Append-only.** Audit reference: Drive bundle `101_MILESTONE_01_FULL_TEST_*` (folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`).

## Failure observed

- Top-level `ok=true`, `status=GO`, `severity=OK` while `envelopeOk=false` and `UX_SHELL_MARKERS` (ERROR).
- Violates CBV_TCS_V1: any failing check / `envelopeOk=false` must not yield GO.

## Root cause

1. **Finalizer:** Post–Drive-export path recomputed `ok`/`status` from checks without consistently applying `envelopeOk` and `CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_`, allowing GO with a false envelope.
2. **Drive JSON vs checks:** `DRIVE_SIX_FILE_BUNDLE` was appended **after** export, so `REPORT.json` on Drive could omit the drive row while in-memory state diverged.
3. **UX_SHELL_MARKERS (historical):** HtmlService evaluation of shell HTML could fail on Apps Script template tags; mitigated by **raw** `HtmlTemplate.getCode()` marker scan in `998O`.

## Files updated

- `05_GAS_RUNTIME/998P_MILESTONE_01_OPERATIONAL_WORKSPACE_TEST_CONSOLE.js`
- `05_GAS_RUNTIME/998L_TEST_CONSOLE_DRIVE_REPORT_EXPORTER.js`
- `05_GAS_RUNTIME/998O_WEBAPP_OPERATIONAL_UX_MILESTONE01.js` (probe; prior phase)

## Logic (status)

- `envelopeOk === false` ⇒ `FAIL`, `ok=false`, severity ERROR (with merged check errors when `finalizeStatusFromPayload_` runs).
- ERROR/CRITICAL checks ⇒ FAIL (via `__finalizeRunStatusFromChecks_`).
- WARNING-only ⇒ `GO_WITH_WARNINGS`, `ok=true`.
- All checks OK + `envelopeOk === true` ⇒ `GO`.

## Negative harness

`AGGREGATOR_SELF_TEST` in `998P` covers: run-only all OK, ERROR check, WARNING-only, full GO, and `envelopeOk=false` ⇒ FAIL via `finalizeStatusFromPayload_`.

## Next step

1. Run menu: **CBV Test Console → Run Milestone 01 Full Operational Workspace Test** (`CbvTcsMilestone01OpWorkspace_TestConsole_runFull`).
2. Confirm new append-only bundle `102_MILESTONE_01_FULL_TEST_*` has aligned `status` / `ok` / `envelopeOk` / checks.
3. **No git tag** until that bundle is verified GO or GO_WITH_WARNINGS with `envelopeOk=true` per policy.

## Tag readiness

**Not tagged** in this phase until runtime Drive evidence `102_*` is verified.
