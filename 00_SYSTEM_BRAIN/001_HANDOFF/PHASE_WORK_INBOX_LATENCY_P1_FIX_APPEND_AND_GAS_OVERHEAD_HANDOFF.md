# PHASE_WORK_INBOX_LATENCY_P1 — Handoff

**Verdict:** GO_WITH_WARNINGS

## Deploy

1. `clasp push -f` — new `workInboxAppendFast.js`
2. Worker + workboard FE

## Verify trace fields

- `responseMs` << `gas.totalMs`
- `timelineWriteMs`, `auditWriteMs`
- `responseBytes`, `taskPatchBytes`
- `workerToGasGapMs`

## Manual benchmark

Complete action before/after — target total ≤4000ms, timeline+audit ≤800ms.

## Async append

**Not implemented** (Option A synchronous retained for pilot safety).

## Enable legacy mirrors (if needed)

Set in `workInboxOperationalConfig.js`:
- `MIRROR_AUDIT_TO_LEGACY_LOG: true`
- `MIRROR_TIMELINE_TO_LEGACY_LOG: true`
