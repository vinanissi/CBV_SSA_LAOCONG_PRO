# Sheet Runtime Latency Warning Contract

**Phase:** `PHASE_SHEET_RUNTIME_LATENCY_WARNING_FIX`  
**Status:** ACTIVE

---

## Objective

Ensure latency/retry/abort warnings are accurate, non-blocking when data is usable, and auto-clear on recovery.

## State policy

```text
IDLE
LOADING
SLOW_PENDING
RETRYING
RECOVERED
DEGRADED_WITH_USABLE_DATA
FAILED_BLOCKING
CANCELLED_STALE_REQUEST
```

## Warning policy

- `SLOW_PENDING` / `RETRYING`: soft non-blocking warning.
- `CANCELLED_STALE_REQUEST`: non-blocking classification; no persistent blocking warning.
- `RECOVERED`: clear stale latency warnings.
- `FAILED_BLOCKING`: blocking warning only when no usable data exists.

## Guard contract

- Older request state must not overwrite newer successful state.
- Abort/stale response handling must not degrade usable task/checklist UI.

## Boundaries

- No schema change
- No persistence change
- No workflow/business model redesign
- No Link Runtime v1 regression

