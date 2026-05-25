# PHASE_RF_04 — Observation Runtime Core — Prompt

## Phase

**PHASE_RF_04_OBSERVATION_RUNTIME_CORE** (Mốc 3)

## Branch

`phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Baselines

- PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE
- PHASE_RF_02_WORKBOARD_CORE_IMPLEMENTATION
- PHASE_RF_03_OPERATIONAL_COORDINATION_CORE

## Goal

Operational Observation Runtime — read-first layer answering: which module is abnormal, which queue is stuck, which projection lacks data, which sync needs check, which runtime has warnings, drift signals, and what managers should see first.

## Scope (v1)

1. Runtime Health v1
2. Projection Health v1
3. Queue Health v1 (RF_03 queue runtime)
4. Sync Health Stub v1 (NOT_CONFIGURED / STUB only)
5. Audit Feed v1 (read-first, empty if no source)
6. Runtime Alert v1 (no auto-resolve, no auto-escalate)
7. Observation Workboard v1
8. Observation Test Console RF_04 (CBV_TCS_V1)
9. Append-only report + handoff + test evidence

## Routes

- `/workspace/observation` (+ `/workboard/observation`)
- `/workspace/observation/health` (+ `/workboard/health`)
- `/workspace/observation/projections`
- `/workspace/observation/queues`
- `/workspace/observation/sync`
- `/workspace/observation/audit` (+ `/workboard/audit`)
- `/workspace/observation/alerts` (+ `/workboard/alerts`)

## Constraints

- No production schema change
- No rewrite WebApp / no DB swap / no AppSheet removal
- Preserve RF_02 + RF_03 routes
- Test menu under 🧪 CBV Test Console only
- No fake production data
- No auto-resolve / auto-escalate

## Permissions

- `OBSERVATION_VIEW`, `OBSERVATION_AUDIT_VIEW`, `OBSERVATION_ALERT_VIEW`
- ADMIN/MANAGER full observation; STAFF scoped; VIEW_ONLY read-only

## Test

`CBV_RF04_Test_runObservationRuntimeHealth()` — CBV_TCS_V1 envelope

## Next phase

**PHASE_RF_05_PLUGIN_RUNTIME_BASELINE**
