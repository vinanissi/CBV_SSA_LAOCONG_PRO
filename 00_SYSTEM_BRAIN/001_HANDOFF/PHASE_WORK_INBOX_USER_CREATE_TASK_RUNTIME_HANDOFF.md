# PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME — Handoff

**Status:** GO_WITH_WARNINGS

## Shipped

- USER create via `/api/work-inbox/create-task` → GAS `wiOpCreateUserTask`
- `WorkInboxCreateTaskDialog` on Work Inbox focus route (`TasksPage`)
- Permissions: USER create own; VIEWER blocked; no assign-for-others for USER
- Local snapshot insert + focus open (no full snapshot reload)
- Timeline `TASK_CREATED_BY_USER` + audit `ACTION_USER_CREATE_TASK`

## Verify

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxUserCreateTaskRuntimeChecks } from './src/modules/task/inbox/create/workInboxCreateTaskChecks.ts'; console.log(runWorkInboxUserCreateTaskRuntimeChecks());"
npm run build
```

Manual: USER create → focus open; VIEWER button disabled.

## Deploy

Push GAS files including `workInboxCreateTask.js` and updated action registries.

## Do not regress

- Network hygiene (no snapshot on create success path)
- RCLA context provider
- OPERATOR existing action permissions
