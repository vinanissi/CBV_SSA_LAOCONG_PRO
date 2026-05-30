# PHASE_TASK_GS_02_REAL_OPERATIONAL_USAGE — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO_WITH_WARNINGS

---

## Summary

Phase chuyển CBV TASK từ mock-heavy sang **real operational usage**: snapshot TASK_MAIN thật, Operational Context Panel, urgency layer, quick actions, observation append-only.

## Runtime Connection

| Item | Value |
|------|-------|
| Mode | `google_sheet_existing_db` |
| FE | `VITE_CBV_API_BASE_URL` + `VITE_CBV_TASK_RUNTIME_MODE` |
| Worker | `GAS_TASK_API_URL`, `CBV_TASK_RUNTIME_MODE`, `CBV_TASK_WRITE_MODE=gas` |
| Mock disabled | Task workspace khi Worker + runtime mode active |

## Snapshot & Cache

- Single call: `GET /api/tasks/workspace-snapshot`
- GAS cache TTL: **20s**
- Worker tracks `workerLatencyMs`
- No per-task fan-out on list; detail lazy on select

## Urgency Layer

GAS computes per task:
- `isBlocked`, `isOverdue`, `isWaiting`, `isStale`, `noOwner`, `needsEscalation`, `slaRiskLevel`, `labels[]`

FE: TaskCard + OperationalContextPanel display urgency labels.

## Operational Context Panel

Right panel (`OperationalContextPanel.tsx`):
- Task summary, SLA, due, assignee, related hồ sơ
- Timeline + recent updates
- Files, pending action, next step
- Quick actions: Nhận việc, Hoàn tất
- Mobile: bottom sheet collapse

## Operator Workflow

- Quick actions on card + panel
- Keyboard: Enter open, ESC close, Arrow select
- Optimistic patch local state after write
- Soft snapshot refresh (no full page reload)
- Selected task preserved on refresh

## Observation Runtime

`TASK_OPERATOR_OBSERVATION` append-only when sheet exists or `CBV_OBSERVATION_DEV=1`:
- SNAPSHOT_SLOW, OVERDUE_ESCALATION, BLOCKED_STALE

## Files Changed

| Area | Files |
|------|-------|
| GAS | `taskDbService.js`, `taskDbConfig.js`, `taskDbObservation.js`, `taskDbTestConsoleGs02.js` |
| Worker | `taskGsDb.ts`, `googleSheetTaskDbAdapter.ts`, `.dev.vars` |
| FE | `client.ts`, `TasksPage.tsx`, `TaskCard.tsx`, `OperationalContextPanel.tsx`, `TaskRuntimeBar.tsx`, `DetailPanel.tsx`, `taskDisplay.ts`, `.env` |

## Test Results

| Check | Result |
|-------|--------|
| Worker typecheck | PASS (local) |
| FE build | PASS (local) |
| Live GAS + Sheet E2E | PENDING — requires `clasp push` + running Worker dev |

## Friction Observed (design-time)

- Detail panel requires lazy GAS call — acceptable for rate-limit safety
- Without `VITE_CBV_API_BASE_URL`, dev falls back to labeled mock only

## Limitations

- Priority/dueDate update not in GS_01 write API (status/assign/comment/complete only)
- SHARED_WITH / IS_PRIVATE filter not in snapshot yet
- Observation sheet not auto-created in production

## Next Phase Recommendation

- Live operator session + friction log from real usage
- SHARED_WITH visibility filter
- Coordination queue sync from TASK_MAIN counts

---

*Append-only report — PHASE_TASK_GS_02*
