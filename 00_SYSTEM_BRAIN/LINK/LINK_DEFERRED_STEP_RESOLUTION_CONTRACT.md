# Deferred Step Resolution Contract

**Phase:** `PHASE_LINK_02_DEFERRED_STEP_RESOLUTION`  
**Status:** ACTIVE

---

## Objective

Harden deep-link timing so `?step=` is resolved only when task/checklist data and checklist DOM are ready, including slow/retry/aborted runtime conditions.

---

## Resolution states

```text
IDLE
PENDING_TASK
PENDING_CHECKLIST_DATA
PENDING_DOM
RESOLVING
RESOLVED
FAILED_TIMEOUT
FAILED_MISSING_STEP
```

---

## Rules

- Parse `?step=` into pending runtime state.
- Do not clear URL while state is pending/resolving.
- Retry resolution with bounded backoff.
- Clear URL only after `RESOLVED`, `FAILED_TIMEOUT`, or `FAILED_MISSING_STEP`.
- Timeout/failure warnings must be non-blocking.
- Runtime remains usable after timeout.

---

## Boundaries

- No workflow redesign.
- No business logic change.
- No persistence change.
- No schema change.

