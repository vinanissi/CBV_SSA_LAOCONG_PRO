# PHASE_TASK_GS_09C — Handoff

**From:** Fix visible USER_CODE in task card  
**Status:** GO

## Delivered

1. Surface-safe `resolveUserLabel` — raw `USR_*` never on card/panel/timeline primary text
2. `getCardOwnerMetaShort` for escalation/overdue meta line
3. TaskCard `metaShort` tooltip shows technical id on hover
4. Fallback `GET /api/users` when snapshot `userDisplayMap` empty
5. `runTaskGs09cChecks()` — USR_005 → Nguyễn Văn B assertion

## Verify

```bash
cd apps/workboard && npm run dev
```

- Find escalation task with `OWNER_ID=USR_005`
- Card scan line: `Escalation  Nguyễn Văn B` (not `USR_005`)
- Hover owner meta → tooltip shows `USR_005`
- Without directory map: `Escalation  Chưa rõ người xử lý`

```bash
cd apps/workboard && npm run build
```

Console: `import { runTaskGs09cChecks } from './src/modules/task/taskGs09cChecks'` → all checks GO.

## Do NOT

- Render `task.ownerId` / `task.owner` directly when value matches `USR_*`
- Fix only TaskCard with string replace — use `userDisplay.ts`
- Change DB or GAS schema in this phase

## Depends on

GS_09A snapshot `userDisplayMap` or GS_09B `resolveUserLabel` foundation.

## Next (optional)

- Trigger lightweight re-render after `/api/users` resolves (state bump in TasksPage)
- Enrich mock tasks with `ownerUser` for offline dev parity
