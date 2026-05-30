# HOTFIX_WORK_INBOX_CREATE_BUTTON_DISABLED — Handoff

**Status:** GO

## Shipped

- Footer **+ Tạo việc** enabled for USER, STAFF/OPERATOR, ADMIN, MANAGER
- Click opens `WorkInboxCreateTaskDialog` via `TaskWriteContext.openWorkInboxCreate`
- VIEWER/VIEW_ONLY: disabled + tooltip **Bạn không có quyền tạo việc**
- Create flow unchanged: `/api/work-inbox/create-task` → local insert → focus open
- Removed misleading **· Sắp mở** on permission-denied create button

## Verify

```powershell
cd apps/workboard
npx tsx -e "import { runHotfixWorkInboxCreateButtonDisabledChecks } from './src/modules/task/inbox/create/hotfixWorkInboxCreateButtonDisabledChecks.ts'; console.log(runHotfixWorkInboxCreateButtonDisabledChecks());"
npm run build
```

Manual:

1. Login STAFF → footer **+ Tạo việc** → dialog → create → focus new task  
2. Login VIEWER → button disabled, hover tooltip  
3. Confirm no full workspace reload after create

## Deploy

- Restart Worker dev/prod after permission file changes  
- GAS: ensure `workInboxCreateTask.js` deployed (STAFF assign guard)

## Do not regress

- `PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT` — no snapshot reload on create  
- `PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME` — dialog + API contract  
- Legacy `TaskCreateModal` remains for admin paths; footer must use Work Inbox dialog only
