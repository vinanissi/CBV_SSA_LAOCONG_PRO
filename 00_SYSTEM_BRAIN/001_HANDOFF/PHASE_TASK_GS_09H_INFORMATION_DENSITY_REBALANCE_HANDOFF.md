# PHASE_TASK_GS_09H — Handoff

**From:** Information density rebalance on light operational workspace  
**Status:** GO

## Delivered

1. **Compact operational line** — `buildCompactCardLine()` merges dominant signal + due + owner into one scan line
2. **Progressive disclosure** — secondary signals (stale, etc.) on focus/hover only; suppressed in tooltip
3. **Card scan rhythm** — `task-card-scan-row` min-height, tighter `task-group-body` spacing
4. **Action hierarchy** — primary accept uses `inline-action-primary`; passive ✓ muted until hover
5. **Signal priority model** — L1 critical → L4 passive in `signalPriority.ts`
6. **Right panel rebalance** — execution zone top, coordination middle, timeline/files bottom
7. **Context compression** — Quick Focus icon-only; Recent context without section label
8. **`runTaskGs09hChecks()`** validation suite

## Verify

```bash
cd apps/workboard && npm run dev
```

- [ ] Queue cards show **one meta line** (not 3 separate spans)
- [ ] Example format: `⚠ Escalation · hạn MM/DD · Owner name`
- [ ] Hover/focus selected card shows extra detail (e.g. stale days) if applicable
- [ ] Card heights feel even when scanning queue
- [ ] `[Xử lý]` / ▶ primary action visually dominant vs ✓ passive
- [ ] Right panel: **Thực thi** block at top with next action + owner/SLA
- [ ] Timeline and files below title/status
- [ ] Quick Focus chips show icon only until active

```bash
cd apps/workboard && npm run build
```

Dev console:

```typescript
import { runTaskGs09hChecks } from '@/modules/task/taskGs09hChecks';
runTaskGs09hChecks();
```

## Key files

| Area | Path |
|------|------|
| Compact line | `apps/workboard/src/shared/utils/informationBalance.ts` |
| Signal levels | `apps/workboard/src/shared/utils/signalPriority.ts` |
| Disclosure | `apps/workboard/src/shared/utils/scanRhythm.ts` |
| Queue card | `apps/workboard/src/components/ui/TaskCard.tsx` |
| Right panel | `apps/workboard/src/components/ui/OperationalContextPanel.tsx` |
| CSS rhythm | `apps/workboard/src/styles/index.css` |
| Checks | `apps/workboard/src/modules/task/taskGs09hChecks.ts` |

## Do NOT

- Dashboard-ify queue or add giant spacing
- Show all metadata on default collapsed cards
- Revert GS_09G light theme default
- Add animation-heavy hover effects or expensive recalculation

## Next phase hints

- Capture before/after screenshots on real queue data for UAT sign-off
- Monitor operator feedback on 3-part meta line vs 2-part for low-signal tasks
- Consider panel sticky execution bar merge with zone header if further compression needed
