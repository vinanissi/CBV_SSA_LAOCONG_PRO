# PHASE_RF_05 — Plugin Runtime Baseline — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Phase

**PHASE_RF_05_PLUGIN_RUNTIME_BASELINE**

## Branch

`phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Baselines

RF_01 through RF_04

## Goal

Operational Module Plugin Runtime Baseline — plugin registry, contract, capability descriptors, route/permission/observation/coordination/quick-action bindings, TASK/FINANCE/HO_SO skeletons. No marketplace. No auto-execute.

## Scope

1. Plugin Registry v1 (hardcoded read-only)
2. Plugin Contract v1 + validator
3. Module Capability Descriptor v1
4. Plugin Permission / Route / Observation / Coordination / Quick Action bindings
5. TASK (ACTIVE), FINANCE (STUB), HO_SO (STUB) skeletons
6. Plugin Workboard UI + test console CBV_TCS_V1

## Routes

- `/workspace/plugins`, `/workspace/plugins/task`, `/finance`, `/ho-so`, `/health`
- Aliases: `/workboard/plugins`, `/workboard/plugin-*`

## Constraints

No schema change, no marketplace, no auto-execute, no fake ACTIVE for unimplemented capabilities.

## Next phase

**PHASE_RF_06_FINANCE_HOSO_PLUGIN_ACTIVATION**
