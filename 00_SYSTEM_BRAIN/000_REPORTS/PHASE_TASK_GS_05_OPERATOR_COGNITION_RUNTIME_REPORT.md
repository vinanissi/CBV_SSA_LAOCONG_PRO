# PHASE_TASK_GS_05 — Operator Cognition Runtime — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

---

## Summary

Phase chuyển CBV TASK từ "runtime hiển thị nhiều thông tin" sang **Operational Cognition Runtime**: ưu tiên attention, giảm warning fatigue, hướng operator tới next action. FE-only — không đổi DB/GAS schema.

## Attention hierarchy

| Level | Visual | Triggers |
|-------|--------|----------|
| ACTION NOW | Red border, bold signal | Escalation, overdue+mine, blocked+owner waiting |
| HIGH ATTENTION | Amber border | Overdue, blocked, no owner, stale 5–365d, near due ≤3d |
| AWARENESS | Subtle, 85% opacity | Waiting, informational |
| BACKGROUND | 50% opacity, no card signal | DONE, stale >365d non-actionable |

Sort: `sortByAttention()` trong cognition groups.

## Warning suppression

| Rule | Behavior |
|------|----------|
| Stale > 365 ngày | BACKGROUND; meta "lâu không cập nhật"; no card badge |
| Stale < 7 ngày (non-critical) | Signal suppressed on card |
| Degraded runtime | Card signals suppressed; warnings filtered from list banner |
| Historical overdue non-actionable | Awareness only via attention level |

## Next-action engine

Rule-based `getTaskNextAction()` — không AI:

| Status/condition | Action |
|------------------|--------|
| NEW/ASSIGNED | Nhận việc |
| BLOCKED | Gỡ vướng |
| OVERDUE | Ưu tiên xử lý |
| WAITING + pending | From pendingAction |
| WAITING | Chờ phản hồi / Gọi khách |
| IN_PROGRESS + stale | Cập nhật tiến độ |
| No owner | Giao việc |

Card shows **one** next-action chip before title.

## Cognition grouping

Toggle `?group=cognition` (default) vs `?group=status` (GS_04 groups):

1. Cần xử lý ngay
2. Việc nhanh (<5 phút)
3. Chờ phản hồi
4. Chờ duyệt
5. Có thể xử lý hàng loạt
6. Theo dõi
7. Awareness / nền

Default collapsed: monitor, awareness.

## Actionability-first card

Layout: `[NEXT ACTION] Title` → `⚠ critical signal · meta` → icon actions.

Replaces status-first overload from GS_04.

## Working memory panel

`OperationalContextPanel` order:
1. Sticky quick actions (accept/complete/update)
2. Next step callout
3. Waiting dependency
4. Title + SLA + critical signal
5. Timeline (default 8, expand)
6. Files, description (collapsed sections)

## Interruption support

- `recentContext.ts` — localStorage max 5 recent tasks
- `RecentContextBar` — "Bạn đang làm dở" + resume chip
- `recordTaskSwitch()` — session observation (rapid switch, reopen)

## Runtime signal filtering

- `filterRuntimeWarningsForCards(degraded, warnings)` — hides sync/slow spam from list banner
- `suppressSignals={degraded}` on cards when runtime degraded
- Runtime bar remains single source for latency/degraded state

## Operator throughput

- Accept (▶) shown when next action = ACCEPT
- Complete (✓) on non-accept in-progress tasks
- Keyboard J/K/Enter/ESC preserved from GS_04

## Observation (lightweight)

`taskOperatorObservation.ts` — sessionStorage append-only:
- TASK_SWITCH, TASK_REOPEN, RAPID_SWITCH, QUEUE_SIZE, WARNING_OVERLOAD

No GAS fan-out in this phase.

## Files changed

| Area | Files |
|------|-------|
| Utils | `taskAttention.ts`, `taskNextAction.ts`, `taskSignalFiltering.ts`, `taskCognitionGrouping.ts`, `recentContext.ts`, `taskOperatorObservation.ts` |
| Components | `TaskCard.tsx`, `OperationalContextPanel.tsx`, `RecentContextBar.tsx`, `TaskGroupSection.tsx` |
| Page | `TasksPage.tsx` |
| Display | `taskDisplay.ts` (re-exports) |
| Styles | `index.css` (next-action chips, attention, recent context) |
| Checks | `taskGs05Checks.ts` |
| Docs | prompt, report, handoff |

## Tests run

```bash
cd apps/workboard && npm run build
```

`runTaskGs05Checks()` — 12 checks (attention, suppression, next action, grouping, recent context, signal filter).

## Observed limitations

- Next-action rules chưa cover mọi pendingAction variant — cần mở rộng theo operator feedback
- Cognition "batchable" heuristic đơn giản (IN_PROGRESS non-blocked)
- Observation chỉ session/local — chưa wire GAS TASK_OPERATOR_OBSERVATION sheet
- Bulk actions (mark reviewed) chưa implement — deferred

## Next recommendations

1. Operator UAT: đo thời gian scan "việc tiếp theo" trước/sau
2. SessionStorage group collapse prefs
3. Wire observation events to GAS append when sheet enabled
4. Expand next-action rules từ real pendingAction corpus
5. Keyboard shortcut for "resume last task" (e.g. `R`)
