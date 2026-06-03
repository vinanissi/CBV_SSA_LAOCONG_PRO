# Checklist Progress Visualization Contract

**Phase:** `PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION`  
**Status:** ACTIVE

## Objective

Add a compact, derived progress summary for checklist execution in checklist header UI.

## Derived values

- `totalSteps` = checklist item count
- `completedSteps` = checklist items with existing done semantics
- `remainingSteps` = `totalSteps - completedSteps` (min 0)
- `percentComplete` = rounded `completedSteps / totalSteps * 100`

## Edge handling

- If `totalSteps = 0`, `percentComplete = 0`.
- UI must render cleanly (`0 / 0 bước`) with no divide-by-zero.

## UI requirements

- Header includes completed/total count, percentage, and compact bar.
- Attributes:
  - `data-checklist-progress-total`
  - `data-checklist-progress-completed`
  - `data-checklist-progress-percent`
- Progress bar is readable and non-dominant.

## Boundaries

- No persistence field changes.
- No status semantics changes.
- Keep compatibility with interaction feedback, toast, focus mode, and link deep-link highlight.

