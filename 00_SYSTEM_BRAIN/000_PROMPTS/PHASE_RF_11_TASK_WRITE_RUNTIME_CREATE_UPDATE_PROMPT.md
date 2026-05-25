# PHASE_RF_11 — Task Write Runtime Create/Update — Prompt (Archive)

> Append-only. Phase: **PHASE_RF_11_TASK_WRITE_RUNTIME_CREATE_UPDATE**

## Scope

- POST /api/tasks, PATCH /api/tasks/:taskId
- Permission checks at Worker
- Append-only timeline events
- Local safe write adapter (CBV_TASK_WRITE_MODE=local)
- GAS write adapter skeleton
- FE create/update forms

## Out of scope

Direct Sheet writes from FE, auto-assign, production schema change without adapter.
