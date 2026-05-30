# PHASE_TASK_GS_10A — Handoff

**From:** OWNER / REPORTER USER_CODE mapping fix  
**Status:** GO

## Delivered

1. GAS directory index keyed by **`USER_CODE`** (TASK_MAIN OWNER_ID / REPORTER_ID contract)
2. Snapshot enrichment: `ownerUser`, `reporterUser`, `displayOwner`, `displayReporter`
3. FE `getTaskOwnerDisplay` / `getTaskReporterDisplay` with USER_CODE-first resolution
4. `runTaskGs10aChecks()` validation suite

## Verify

```bash
cd gas-runtime-api && clasp push
# Manual Web App deploy if clasp deploy blocked

cd apps/workboard && npm run dev
```

- Task with `OWNER_ID = USR_005` shows **Trần Thị B** on card, panel, escalation meta
- Task with `REPORTER_ID = USR_001` shows **Nguyễn Văn A** when reporter surfaced
- Raw `USR_*` only in tooltips / debug (technical id), not primary labels

```bash
cd apps/workboard && npm run build
```

Import checks in dev console:

```typescript
import { runTaskGs10aChecks } from '@/modules/task/taskGs10aChecks';
runTaskGs10aChecks();
```

## Key files

| Area | Path |
|------|------|
| GAS user map | `gas-runtime-api/taskDbUserDisplay.js` |
| GAS task map | `gas-runtime-api/taskDbService.js` |
| FE display | `apps/workboard/src/runtime/userDisplay.ts` |
| Contracts | `apps/workboard/src/api/contracts.ts` |
| Checks | `apps/workboard/src/modules/task/taskGs10aChecks.ts` |

## Do NOT

- Map `OWNER_ID` / `REPORTER_ID` to `USER_DIRECTORY.ID` first
- Expose raw `USR_*` on TaskCard or escalation lines
- Rename sheet columns or change DB schema

## Next (optional)

- Surface `displayReporter` in OperationalContextPanel detail section
- Align `/api/auth/me` session user with `USER_CODE` key consistently
