# Checklist Toast Notification Contract

**Phase:** `PHASE_CHECKLIST_02_TOAST_NOTIFICATION`  
**Status:** ACTIVE

---

## Objective

Add lightweight non-blocking toast notifications for checklist actions, complementing row-level feedback from phase 01.

## Toast scope

- Copy step link success/failure
- Checklist save/update confirmations where useful
- Checklist save failures
- Retry feedback where applicable

## Supported kinds

```text
success
error
info
warning
```

## Behavior rules

- Non-blocking and auto-dismiss.
- Must not block checklist interactions.
- Must not replace row-level pending/saved/failed state.
- Must avoid repeated identical spam (dedupe/throttle).

## Default durations

- `success/info`: ~1500–2500ms
- `warning/error`: ~3000–5000ms

## Boundaries

- No checklist data model change
- No persistence/schema change
- No deep-link/runtime contract change

