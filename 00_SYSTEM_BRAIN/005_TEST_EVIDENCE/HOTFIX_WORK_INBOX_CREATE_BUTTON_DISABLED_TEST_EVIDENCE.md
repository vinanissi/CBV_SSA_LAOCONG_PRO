# HOTFIX_WORK_INBOX_CREATE_BUTTON_DISABLED — Test Evidence

**Date:** 2026-05-30  
**Verdict:** GO

## Static checks

```text
Command: npx tsx -e "import { runHotfixWorkInboxCreateButtonDisabledChecks } from './src/modules/task/inbox/create/hotfixWorkInboxCreateButtonDisabledChecks.ts'; console.log(runHotfixWorkInboxCreateButtonDisabledChecks());"

Result: GO — 11/11 PASS
  CREATE_BUTTON_NOT_DISABLED_FOR_USER
  CREATE_BUTTON_NOT_DISABLED_FOR_OPERATOR
  CREATE_BUTTON_OPENS_DIALOG
  CREATE_DIALOG_SUBMIT_CALLS_API
  VIEWER_CREATE_BUTTON_DISABLED
  CREATE_TASK_OPENS_FOCUS
  NO_FULL_SNAPSHOT_AFTER_CREATE
  CREATE_BUTTON_LABEL_FIXED
  CREATE_BUTTON_PERMISSION_TOOLTIP
  CREATE_OPERATOR_WORKER_PERMISSION
  CREATE_TASK_BUILD_PASS
```

## Build

```text
Command: npm run build (apps/workboard)
Result: PASS — tsc + vite build OK
```

## Manual smoke (pending)

- [ ] STAFF: **+ Tạo việc** enabled → dialog → create → focus  
- [ ] USER: same path  
- [ ] VIEWER: disabled + tooltip **Bạn không có quyền tạo việc**  
- [ ] Network tab: no full workspace snapshot after create success
