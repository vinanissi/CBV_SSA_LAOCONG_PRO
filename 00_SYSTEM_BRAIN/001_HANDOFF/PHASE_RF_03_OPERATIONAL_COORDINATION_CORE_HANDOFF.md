# Handoff — PHASE_RF_03 Operational Coordination Core

## Summary

RF_03 adds operational coordination layer: manager dashboard, queue/overdue/workload views, assignment options with execution lock, CBV_TCS test. Built on RF_02 permission + HOME_ALERT adapter.

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Read-first queues | No queue engine; projection from inbox |
| EXECUTION_LOCKED assign | Production safety; no WebApp TASK_MAIN writes in RF_03 |
| STAFF scope = MY_QUEUE | Team views require COORDINATION_TEAM_VIEW |
| Event DTO only | No production timeline write without safe helper gate |

## Verify

1. `clasp push`
2. 🧪 CBV Test Console → **Run RF_03 Operational Coordination Health Test**
3. Open `/workspace/coordination/manager` (ADMIN/MANAGER) or `/workspace/coordination/queue` (STAFF)

## Next phase

**PHASE_RF_04_OBSERVATION_RUNTIME_CORE** — health, sync, audit, event visibility

## Do NOT

- Auto-assign from WebApp
- Change TASK_MAIN schema
- Break RF_02 routes

## Open questions

1. When to unlock WebApp assign via confirmed business menu bridge?
2. Map OPERATOR legacy role to MANAGER for coordination team view?
