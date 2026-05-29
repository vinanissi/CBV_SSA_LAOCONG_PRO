# PHASE_TASK_OPERATOR_DISPLAY_NAME — CLOSEOUT AI HANDOFF

## Context
OPERATOR/STAFF hiển thị raw `USR_008` trên task card vì `/api/users` trả 403 và snapshot không mang directory map. ADMIN hoạt động vì gọi được `/api/users`.

## Fix (already deployed in local Worker)
`workers/api/src/modules/taskGsDb.ts` → `handleTaskWorkspaceSnapshot` embeds `userDisplayMap` + `usersById` from `gsGetUserDirectory(env)` with 5-min TTL cache. Role-agnostic.

## FE (no change needed)
`TasksPage.tsx` L285: `hydrateUserDirectoryFromSnapshot(res.data)` — OPERATOR gets map from snapshot, skips admin-only `/api/users`.

## Verification commands
```powershell
# STAFF snapshot must include map
Invoke-RestMethod -Uri "http://localhost:8787/api/tasks/workspace-snapshot?limit=5" -Headers @{ "x-cbv-role"="STAFF" }

# STAFF /api/users still 403 — OK
Invoke-WebRequest -Uri "http://localhost:8787/api/users" -Headers @{ "x-cbv-role"="STAFF" } -UseBasicParsing

# FE test suites
cd apps/workboard
npx tsx -e "import { runTaskOperatorDisplayNameCloseoutChecks } from './src/modules/task/taskOperatorDisplayNameCloseoutChecks.ts'; console.log(runTaskOperatorDisplayNameCloseoutChecks())"
npx tsx -e "import { runTaskOperatorDisplayNameFixChecks } from './src/modules/task/taskOperatorDisplayNameFixChecks.ts'; console.log(runTaskOperatorDisplayNameFixChecks())"

# Build
npm run build
```

## Test files
- `apps/workboard/src/modules/task/taskOperatorDisplayNameCloseoutChecks.ts` — closeout suite (7 checks)
- `apps/workboard/src/modules/task/taskOperatorDisplayNameFixChecks.ts` — poisoned resolver suite (6 checks)

## Reports
- Root cause: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_OPERATOR_DISPLAY_NAME_ROOTCAUSE_REPORT.md`
- Closeout: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_OPERATOR_DISPLAY_NAME_CLOSEOUT_REPORT.md`

## Do NOT
- Open `/api/users` to STAFF unless product explicitly requires it
- Hard-code USR_008 or "Operation 1"
- Batch mutate HOME_ALERT
- Change DB schema or AppSheet

## Optional follow-up (GAS)
Resolve `displayOwner`/`displayAssignee` at GAS source in `gas-runtime-api/taskDbUserDisplay.js` — reduces Worker dependency but not required for OPERATOR fix.

## Pre-existing unrelated
`workers/api/src/modules/modules.ts` — tsc errors, not part of this phase.
