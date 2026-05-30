# PHASE_TASK_GS_02_REAL_OPERATIONAL_USAGE

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

Branch: `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Goal

Real operational usage — no mock on task workspace, live context panel, urgency, operator workflow compression.

## Priorities

1. Real runtime: FE → Worker → GAS → TASK_MAIN
2. Operational Context Panel (right panel live)
3. Urgency layer on task cards
4. Quick actions + keyboard + optimistic patch
5. TASK_OPERATOR_OBSERVATION append-only

## ENV

Worker: `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`, `GAS_TASK_API_URL`  
FE: `VITE_CBV_API_BASE_URL`, `VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`

## Acceptance

GO when mock disabled, snapshot real, panel live, urgency works, builds pass.
