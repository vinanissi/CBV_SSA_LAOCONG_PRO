# PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME — Report

**Phase:** PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Commit (base, uncommitted):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`

---

## 1. Summary

USER role can create own tasks from Work Inbox via `POST /api/work-inbox/create-task` (Worker → GAS `wiOpCreateUserTask`). Simple create dialog on `/inbox` replaces legacy admin form for focus runtime. Timeline/audit append on create. Local snapshot insert + focus open — no full workspace reload by default.

---

## 2. Files changed

| Layer | File |
|-------|------|
| GAS | `workInboxCreateTask.js` (new) |
| GAS | `workInboxOperationalService.js`, `workInboxOperationalConfig.js`, `taskDbConfig.js` |
| Worker | `contracts/workInboxCreateTask.ts`, `auth/workInboxCreatePermissions.ts`, `modules/workInboxCreateTask.ts`, `router.ts` |
| Worker | `auth/userContext.ts`, `auth/taskPermissions.ts`, `auth/workInboxPermissions.ts`, `adapters/googleSheetWorkInboxOperationalAdapter.ts`, `modules/taskWrite.ts` |
| FE | `inbox/create/*` (dialog, hook, types, local insert, checks) |
| FE | `TasksPage.tsx`, `OperationalAlertHeader.tsx`, `RuntimeStatusBar.tsx`, `api/client.ts`, `api/mockApi.ts`, `api/contracts.ts`, `workInboxActionTypes.ts`, `workInboxOperationalPermissions.ts`, `shared/constants/index.ts` |

---

## 3. Permission changes

| Role | Create | Assign on create |
|------|--------|------------------|
| ADMIN / MANAGER | Yes | Yes |
| USER | Yes (own only) | No |
| OPERATOR / STAFF | No (unchanged) | No |
| VIEWER / VIEW_ONLY | No | No |

New `USER` role in Worker + FE contracts with `CREATE_OWN_TASK` permission.

---

## 4. Create task flow

1. USER clicks `+ Việc` (footer) or `+ Tạo việc` (header) on Work Inbox focus route  
2. `WorkInboxCreateTaskDialog` — `useWorkInboxCreateTaskRuntime` (optional RCLA context)  
3. `POST /api/work-inbox/create-task` → GAS `wiOpCreateUserTask`  
4. `taskDbCreateTask_` with owner=actor; timeline + audit append  
5. FE: `insertCreatedTaskIntoSnapshot`, navigate `/inbox/:taskId`, selective detail load, toast

---

## 5. Runtime/API contract

**Request:** `{ traceId, actor, actorRole, title, description?, priority?, dueDate?, relatedPhone?, relatedPlate? }`

**Response envelope data:** `{ task, taskPatch, timelineEvent, auditEvent, refreshPolicy: 'SELECTIVE' }`

---

## 6. Test results

```
runWorkInboxUserCreateTaskRuntimeChecks() → GO_WITH_WARNINGS, 14/14 PASS
npm run build → PASS
```

---

## 7. Manual verification (recommended)

1. Login as USER (`x-cbv-role: USER` or auth session)  
2. Create title-only task → NEW, owner=self, focus opens  
3. VIEWER: `+ Việc` disabled  
4. USER assign other user → 403 on API  
5. ADMIN create still works via same dialog on inbox / legacy modal on `/tasks`

---

## 8. Remaining risks

- Live GAS deploy required for production timeline/audit  
- Some filters may not show new task until filter matches (local insert adds to `tasks[]`)  
- OPERATOR/STAFF cannot create (by design — USER-only pilot path)

---

## 9. Pilot recommendation

**GO_WITH_WARNINGS** — enable USER pilot after GAS deploy + one live create verification.

---

## 10. Commit hash

Base: `a3e088b42f5c1141b3a220132377b308b8c5b01c` (changes uncommitted at report time)
