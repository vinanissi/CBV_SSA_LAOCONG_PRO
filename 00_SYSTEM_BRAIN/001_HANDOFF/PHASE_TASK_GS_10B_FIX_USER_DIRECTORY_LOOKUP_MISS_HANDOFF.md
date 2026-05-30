# PHASE_TASK_GS_10B — Handoff

**From:** USER_DIRECTORY lookup miss fix  
**Status:** GO

## Delivered

1. GAS + FE normalized `USER_CODE` keys (trim, uppercase `USR_*`)
2. Field alias support: `OWNER_ID` / `ownerId` / `owner_id`
3. Snapshot task enrichment: `ownerUser`, `displayOwner`, `reporterUser`, `displayReporter`
4. FE local enrichment after snapshot hydrate (`TasksPage`)
5. Display priority: `ownerUser.displayName` → `displayOwner` → `userDisplayMap[ownerId]` → `ownerId`
6. DEV `[USER_LOOKUP_MISS]` console warning
7. `runTaskGs10bChecks()` validation suite

## Verify

```bash
cd gas-runtime-api && clasp push

cd apps/workboard && npm run dev
```

- Task `OWNER_ID = USR_005` shows directory `DISPLAY_NAME` on card + panel
- DevTools: no `[USER_LOOKUP_MISS]` when directory loaded
- If warning appears: check snapshot JSON for `userDisplayMap` / `usersById`

```bash
cd apps/workboard && npm run build
```

Dev console:

```typescript
import { runTaskGs10bChecks } from '@/modules/task/taskGs10bChecks';
runTaskGs10bChecks();
```

## Key files

| Area | Path |
|------|------|
| GAS user map | `gas-runtime-api/taskDbUserDisplay.js` |
| GAS task map | `gas-runtime-api/taskDbService.js` |
| FE display | `apps/workboard/src/runtime/userDisplay.ts` |
| Snapshot hydrate | `apps/workboard/src/modules/task/TasksPage.tsx` |
| Checks | `apps/workboard/src/modules/task/taskGs10bChecks.ts` |

## Do NOT

- Map `OWNER_ID` to `USER_DIRECTORY.ID` first
- Hardcode display names
- Change sheet schema

## If still broken in prod

1. Confirm GAS Web App redeployed after `clasp push`
2. Inspect `/api/tasks/workspace-snapshot` response: `userDisplayMap.USR_005` must exist
3. Check `USER_DIRECTORY.USER_CODE` column has no trailing spaces (normalizer handles most cases)
