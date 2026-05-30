# PHASE_TASK_GS_07 — Coordination Runtime — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_TASK_GS_07_COORDINATION_RUNTIME`  
**Baseline:** GS_06 continuous operation flow

## Goal

Operational Coordination Runtime — waiting chain, handoff visibility, escalation signals, team pressure, coordination queues. FE-only, no BPM/websocket.

## Deliverables

- `coordinationRuntime.ts`, `handoffRuntime.ts`, `escalationRuntime.ts`, `teamPressure.ts`
- `coordinationQueues.ts`, `coordinationSignalFiltering.ts`, `coordinationMemory.ts`
- UI: CoordinationQueueBar, TeamPressureStrip, HandoffChain
- Panel dependency-first layout, timeline handoff highlights
- `taskGs07Checks.ts` + docs
