# Checklist Interaction Feedback Contract

**Phase:** `PHASE_CHECKLIST_01_INTERACTION_FEEDBACK`  
**Status:** ACTIVE

---

## Objective

Provide immediate and clear visual feedback for checklist interactions under normal and slow Sheet runtime conditions.

## Row feedback state

Checklist rows expose:

```text
data-checklist-interaction-state="idle|pending|saved|failed|disabled"
```

Canonical state mapping:

```text
IDLE -> idle
PENDING -> pending
SAVED -> saved
FAILED -> failed
DISABLED -> disabled
```

And visual classes:

- `work-inbox-smart-checklist__row--pending`
- `work-inbox-smart-checklist__row--saved`
- `work-inbox-smart-checklist__row--failed`
- `work-inbox-smart-checklist__row--disabled`

## Feedback behavior

- On click: show pending state immediately (`Đang lưu...`).
- On success: show saved state (`Đã lưu`) and auto-return to idle.
- On failure: show failed state (`Lưu thất bại`) with retry path available.
- Prevent duplicate commits while row is pending via row-level busy guard.

## Boundaries

- No checklist data model change
- No persistence/schema change
- No Link Runtime v1 behavior change
- No deep-link URL/anchor contract changes

