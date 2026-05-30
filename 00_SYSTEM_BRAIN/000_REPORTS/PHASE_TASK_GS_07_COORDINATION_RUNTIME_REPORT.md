# PHASE_TASK_GS_07 — Coordination Runtime — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

---

## Summary

Phase nâng CBV TASK sang **Operational Coordination Runtime**: waiting chain, handoff visibility, escalation signals, team overload awareness, coordination queues — rule-based, local compute.

## Waiting chain runtime

`getWaitingDependency()` returns:
- waitingType (FINANCE_APPROVAL, CUSTOMER, MANAGER_APPROVAL, …)
- waitingLabel, waitingOwner, waitingSince, waitingDurationHours

Cards show compact waiting chip with duration when ≥24h.

## Handoff visibility

`buildHandoffChain()` — owner → timeline handoffs → waiting targets (FINANCE, CUSTOMER, SUPERVISOR).

Timeline highlights `[HANDOFF]` and `[WAITING]` entries.

## Escalation runtime

Rule-based signals (no auto-escalate):
- CRITICAL: overdue SLA, needsEscalation
- HIGH: waiting ≥48h, blocked stale, approval stale
- suggestAction on each signal

## Team pressure

`computeTeamPressure()` — pending/overdue/waitingApprovals per owner.

`TeamPressureStrip` shows overloaded owners (≥12 pending or ≥4 overdue).

TaskCard: `⚠ quá tải` on overloaded owner tasks.

## Coordination queues

8 modes: Tất cả · Chờ phản hồi · Chờ duyệt · Chờ khách · Chờ tài liệu · Follow-up · Escalation · Quá tải

Layered after rhythm filter on TasksPage.

## Signal filtering

Hierarchy: CRITICAL_BLOCK → ACTIVE_WAITING → AWARENESS → HISTORICAL

Historical stale (>365d) suppresses escalation chips on cards.

## Context panel order

1. Next action  
2. Waiting dependency  
3. Current owner  
4. Handoff chain  
5. Escalation  
6. Title/SLA  
7. Timeline (coordination highlights)  
8. Files / update form  

## Coordination memory

SessionStorage per task: lastHandoff, lastWaiting, handoffChain snapshot.

Preserved across AppSheet module switch (session-only).

## Files

| Utils | Components |
|-------|------------|
| coordinationRuntime, handoffRuntime, escalationRuntime, teamPressure, coordinationQueues, coordinationSignalFiltering, coordinationMemory | CoordinationQueueBar, TeamPressureStrip, HandoffChain |

Updated: TaskCard, OperationalContextPanel, TimelineList, TaskGroupSection, TasksPage, workingContext

## Limitations

- waitingOwner inferred from rules, not DB column
- Handoff parsed from timeline text heuristics
- Team pressure thresholds fixed (12/4)
- No cross-operator realtime presence

## Next recommendations

1. TASK_MAIN columns: WAITING_ON, WAITING_SINCE, HANDOFF_TO
2. GAS projection of waiting chain in snapshot
3. Coordination page merge with live task pressure
4. Slack/email nudge from escalation signals (optional)
