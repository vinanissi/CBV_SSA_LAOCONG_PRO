# PHASE_TASK_GS_09F — Handoff

**From:** Operational contrast hierarchy  
**Status:** GO

## Delivered

1. **6-layer contrast stack** — workspace → surface → active → selected → signal → primary action
2. **Surface tokens** — darker workspace, lighter cards, new `surface.active` + `border.strong`
3. **Task cards** — solid borders, shadows, stronger focus ring, dimmed siblings
4. **Signals** — ~2× tint opacity, semibold dominant labels, brighter escalation chips
5. **Action tiers** — `.inline-action-primary` / `-secondary` / `-passive`
6. **Detail panel** — left shadow + strong border separation from queue
7. **`runTaskGs09fChecks()`** — CSS contract validation

## Verify

```bash
cd apps/workboard && npm run dev
```

Open `/tasks` and confirm:

- [ ] Queue cards visually separate from canvas background
- [ ] Selected card has visible ring/glow
- [ ] Escalation label readable at a glance (violet, semibold)
- [ ] `[Xử lý]` stands out vs `[Chờ KH]` / `[Chuyển]` vs muted `[Xong]`
- [ ] Right panel clearly distinct from task list
- [ ] Owner/metadata line readable (not too dim)

```bash
cd apps/workboard && npm run build
```

Dev console:

```typescript
import { runTaskGs09fChecks } from '@/modules/task/taskGs09fChecks';
runTaskGs09fChecks();
```

## Key files

| Area | Path |
|------|------|
| Tokens | `apps/workboard/tailwind.config.ts` |
| Component CSS | `apps/workboard/src/styles/index.css` |
| Action tiers | `apps/workboard/src/components/ui/InlineQuickActions.tsx` |
| Card meta | `apps/workboard/src/components/ui/TaskCard.tsx` |
| Detail panel | `apps/workboard/src/components/layout/DetailPanel.tsx` |

## Do NOT

- Revert to flat `/80` opacity cards
- Add rainbow status colors
- Reduce card density or change layout grid

## Screenshots

Capture before/after at `/tasks` with a task selected and escalation queue visible. Reference values in `PHASE_TASK_GS_09F_OPERATIONAL_CONTRAST_HIERARCHY_REPORT.md`.
