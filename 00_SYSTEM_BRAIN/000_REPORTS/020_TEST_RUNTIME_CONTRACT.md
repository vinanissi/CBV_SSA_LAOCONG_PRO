---
doc: 020_TEST_RUNTIME_CONTRACT
phase: PHASE_B_TEST_RUNTIME
purpose: Spec-only envelope for test / TASK_OBS runtime results (no production code change)
contractVersion: "0.1.0"
---

# TEST RUNTIME CONTRACT

## Status vocabulary

| Value | Meaning |
|-------|---------|
| **GO** | All mandatory checks passed; safe to proceed to next operational step. |
| **GO_WITH_WARNINGS** | No hard blockers; non-fatal issues logged in `warnings[]`. |
| **FAIL** | Mandatory check failed or unsafe state; do not treat as green. |

## Envelope (JSON shape)

Every automated test-runtime or TASK_OBS health/self-test summary **SHOULD** be representable as:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ok` | boolean | yes | Overall pass/fail gate. |
| `status` | string | yes | One of `GO` \| `GO_WITH_WARNINGS` \| `FAIL`. |
| `traceId` | string | yes | Correlation id (e.g. RUN_ID from OBS test run). |
| `checkedAt` | string (ISO-8601) | yes | Wall-clock time of evaluation. |
| `contractVersion` | string | yes | Semver of this contract doc. |
| `envelopeOk` | boolean | yes | True if required envelope fields validated before interpretation. |
| `checks[]` | array | yes | Each: `{ id, severity, ok, message, data? }`. |
| `warnings[]` | array | yes | Human-readable warning strings or objects. |
| `errors[]` | array | yes | Hard errors / blockers. |
| `nextStep` | string | yes | Single recommended next action (no stack of phases). |

## Mapping from `TaskObs_stdResponse_`

Existing shape `{ ok, code, message, data, error }` maps to envelope:

- `ok` → `ok`
- `status` → derive: if `ok` and no WARN/BLOCKER in `data` → `GO`; if `ok` with warnings → `GO_WITH_WARNINGS`; else `FAIL`
- `traceId` → prefer `data.runId` or health `COMMAND_ID` / synthetic UUID
- `checks[]` → flatten `data.findings` or self-test `results[]` where applicable

## Rules

1. **Append-only logs:** Persisted rows go to OBS sheets or append-only report files — never rewrite historical test rows in place.
2. **No production TASK mutation:** Self-test must not change `TASK_MAIN` business columns; OBS-only writes are in scope.
3. **Staging-first:** `checkedAt` and `traceId` must refer to a run executed against an explicitly configured staging spreadsheet id (`CBV_TASK_DB_ID`).
