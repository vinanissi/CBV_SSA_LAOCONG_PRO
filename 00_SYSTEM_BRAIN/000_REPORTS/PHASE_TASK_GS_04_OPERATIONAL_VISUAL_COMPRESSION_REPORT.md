# PHASE_TASK_GS_04 — Operational Visual Compression — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

---

## Summary

Phase nén giao diện vận hành TASK: compact cards, urgency hierarchy, operational grouping, focus mode, compressed context panel. FE-only — không đổi runtime backend.

## Before → After (visual density)

| Aspect | Before (GS_03) | After (GS_04) |
|--------|----------------|---------------|
| Task card height | ~180px+ (p-4, multi-block) | ~48–56px compact row |
| List structure | Flat + duplicate overdue/blocked queues | 9-group collapsible queue |
| Counters | 6 large grid cards | Single inline strip |
| Context panel | Dense vertical sections | Hierarchy: next step → summary → timeline → files |
| Timeline | Full list always | Default 10, expand on demand |
| Keyboard | Arrow + Enter | J/K + Arrow + Enter + ESC |

## Urgency hierarchy

| Tier | Visual | Triggers |
|------|--------|----------|
| CRITICAL | Red left border | Overdue, escalation, SLA HIGH |
| HIGH | Amber left border | Blocked, waiting, stale |
| MEDIUM | Slate left border | No owner, NEW/ASSIGNED |
| NORMAL | No accent | Stable tasks |

Scan pattern: `[STATUS] Title` + `⚠ hint · meta · owner · due`

## Grouping

Groups (priority order, deduped):
1. Quá hạn
2. Bị kẹt
3. Chờ xử lý
4. Chờ duyệt
5. Hôm nay
6. Gần tới hạn (3 ngày)
7. Không cập nhật lâu
8. Của tôi
9. Khác

Default collapsed: upcoming, other, mine. Auto-expand when focused task in group.

## Focus mode

- Selected task: `task-card-focused` ring + full opacity
- Other tasks when panel open: `task-card-dimmed` (40% opacity)
- Auto-scroll into view on select (smooth unless degraded runtime)

## Runtime-aware UI

- Degraded: no pulse on panel skeleton, scroll `behavior: auto`
- Stale message: "Đang dùng dữ liệu gần nhất do runtime chậm."
- Preserve view on soft refresh (from GS_03)

## Render optimization

- `React.memo` on `TaskCard`, `TaskGroupSection`
- Urgency computed once per card via shared utils
- No timeline/files on list cards
- Detail panel lazy sections (update form collapsed by default)

## Files changed

| Area | Files |
|------|-------|
| Utils | `taskGrouping.ts`, `taskDisplay.ts` |
| Components | `TaskCard.tsx`, `TaskGroupSection.tsx`, `OperationalContextPanel.tsx`, `TimelineList.tsx`, `FileList.tsx`, `CompactRuntimeCounters.tsx` |
| Page | `TasksPage.tsx` |
| Styles | `index.css` (compact card, group headers, counters) |
| Checks | `taskGs04Checks.ts` |
| Docs | prompt, report, handoff |

## Tests run

| Check | Result |
|-------|--------|
| `runTaskGs04Checks()` unit logic | PASS |
| FE typecheck + build | PASS |
| Manual UX review | Recommended — verify on live data |

## Limitations

- No virtualized list (acceptable for <200 tasks per snapshot limit)
- Group collapse state local per section (not persisted)
- Screenshots not captured in CI — manual before/after recommended

## Next recommendations

1. Operator feedback session on real workload density
2. Virtual scroll if task count exceeds 200 regularly
3. Persist collapsed group prefs in sessionStorage if needed
