# PHASE_TASK_GS_06 — Continuous Operation Flow — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

---

## Summary

Phase nâng CBV TASK từ cognition runtime sang **Continuous Operational Flow Runtime**: giữ working context qua reload/interruption, resume flow, dependency chips, rhythm queues, completion loop — FE-only, local-first.

## Resume flow behavior

`ResumeFlowCard` + `buildResumeFlowSnapshot()`:
- Unfinished actions (priority 0)
- Last focused task + next action
- Recent interrupted tasks
- Last module opened

Shown on `/` (OperationalHome) and `/tasks`. **Tiếp tục** + keyboard **R**.

## Context persistence

`workingContext.ts` (sessionStorage):
| Field | Restored on reload |
|-------|-------------------|
| selectedTaskId | Auto-navigate `/tasks/:id` |
| filter, groupMode | URL search params |
| rhythmMode | Rhythm bar state |
| scrollY | Main panel scroll |
| panelOpen | Re-open selected task |

Not cleared on soft refresh / degraded runtime.

## Interruption recovery

- `markTaskInterrupted()` when switching tasks
- `markActionStarted()` when operator clicks call/follow-up in panel
- `getInterruptionMessage()` — "Đã gọi khách nhưng chưa cập nhật kết quả"
- `NextStepCompletionPrompt` — lightweight outcome chips (Đã liên hệ / Không nghe máy / Hẹn gọi lại)

## Dependency awareness

`dependencyRuntime.ts` — rule-based kinds: CUSTOMER, FINANCE, MANAGER, DOCUMENT, INVOICE, BLOCKED.

- TaskCard: dependency chip next to title
- Panel: **Phụ thuộc** section with waiting indicators

## Operational rhythm modes

| Mode | Filter |
|------|--------|
| Gọi điện | CALL_CUSTOMER, gọi/khách |
| Follow-up | WAITING, isWaiting |
| Duyệt | WAITING_APPROVAL |
| Việc nhanh | ACCEPT, high priority |
| Hàng loạt | IN_PROGRESS non-blocked |
| Theo dõi | waiting statuses |

## Recent context memory

`RecentContextStrip` replaces basic bar:
- Unfinished actions (warning chips)
- Recent tasks (interrupted highlighted)
- Recent modules

## Throughput

- **R** — resume last task
- J/K/Enter preserved
- Query string preserved on task navigation

## Observation

Extended `taskOperatorObservation.ts`: UNFINISHED_ACTION, RESUME_FLOW, INTERRUPTED_TASK.

## Files

| Area | Files |
|------|-------|
| Utils | `workingContext.ts`, `flowResume.ts`, `dependencyRuntime.ts`, `taskContinuation.ts`, `taskRhythm.ts` |
| Components | `ResumeFlowCard`, `RecentContextStrip`, `NextStepCompletionPrompt`, `RhythmModeBar` |
| Updated | `TasksPage`, `TaskCard`, `OperationalContextPanel`, `OperationalHome`, `recentContext.ts` |
| Checks | `taskGs06Checks.ts` |

## Limitations

- Persistence session/local only — no cross-device
- Completion loop comment-only — no structured outcome DB field
- Rhythm filters heuristic — needs operator tuning
- Scroll restore timing may race with async list load

## Next recommendations

1. Persist working context to optional GAS append log
2. Structured call outcome column on TASK_MAIN
3. Cross-module return deep-link with hoSoId
4. "Snooze interruption" for unfinished actions
