# PHASE_TASK_GS_05 — Handoff

**From:** PHASE_TASK_GS_05 operator cognition runtime  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

## Delivered

1. **Attention hierarchy** — ACTION NOW / HIGH / AWARENESS / BACKGROUND với visual intensity
2. **Next-action engine** — rule-based, 1 chip/card + panel callout
3. **Cognition grouping** — default mode; toggle "Trạng thái" giữ GS_04 groups
4. **Warning suppression** — stale >365d faded; degraded suppresses card signals
5. **Action-first cards** — action chip → title → signal → meta
6. **Working memory panel** — next step → waiting → SLA → timeline (limit 8)
7. **Recent context bar** — resume last task, localStorage recent 5
8. **Session observation** — switch/reopen/queue size tracking
9. **Runtime signal filter** — không spam warning banner khi degraded

## Verify locally

```bash
cd workers/api && npm run dev
cd apps/workboard && npm run dev
```

Open `/tasks`:
- Default grouping = Cognition (7 workflow groups)
- Cards show next-action chip (e.g. "Nhận việc", "Gỡ vướng")
- Historical stale tasks faded, no "Stale 9178d" badge
- Open task → panel shows "Làm gì tiếp theo" first
- Switch tasks → "Bạn đang làm dở" bar appears
- Toggle "Trạng thái" → GS_04 status groups

## Checks

`apps/workboard/src/modules/task/taskGs05Checks.ts` → `runTaskGs05Checks()`

## Do NOT

- Revert to status-first card layout
- Show raw stale days >365 on cards
- Add AI/ML scoring
- Add GAS fan-out for cognition compute

## Next

- Operator feedback on cognition group labels
- Keyboard `R` for resume last task
- Optional GAS observation append for rapid-switch events
