# HOTFIX_WORK_INBOX_CREATE_BUTTON_DISABLED — Report

**Phase:** HOTFIX_WORK_INBOX_CREATE_BUTTON_DISABLED  
**Verdict:** GO  
**Date:** 2026-05-30  
**Commit (base, uncommitted):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`

---

## 1. Root cause

Footer nút **+ Việc · Sắp mở** không hoạt động vì ba lớp lỗi chồng nhau:

1. **Permission gate sai:** `RuntimeStatusBar` disable khi `!capability?.canCreate`. Worker `canCreateTask()` chỉ cho ADMIN/MANAGER/USER — role pilot **STAFF** (Operation/Nhân viên) trả `canCreate: false` dù operator cần tạo việc.
2. **Sai dialog:** Footer gọi `openCreate()` → legacy `TaskCreateModal`, không phải `WorkInboxCreateTaskDialog` (chỉ mount trên `TasksPage` qua state `workInboxCreateOpen`).
3. **UI misleading:** Mọi nút locked dùng suffix **· Sắp mở**, kể cả khi bị chặn quyền — operator không phân biệt được “chưa ship” vs “không có quyền”.

Không có `pointer-events: none` hay feature flag. `onClick` có nhưng handler mở modal cũ; nút create bị `disabled=true` với STAFF.

---

## 2. Fix summary

| Area | Change |
|------|--------|
| Footer | Label **+ Tạo việc**; enable theo `canRoleCreateWorkInboxTask` + capability; `openWorkInboxCreate()`; tooltip **Bạn không có quyền tạo việc** khi VIEWER |
| Context bridge | `TaskWriteContext`: `openWorkInboxCreate`, `registerOpenWorkInboxCreate` |
| TasksPage | Register handler mở dialog; `?create=1` deep-link; `canCreateTaskUi` đồng bộ role |
| Permissions | STAFF/OPERATOR được tạo (pilot); VIEW_ONLY/VIEWER blocked |
| Constants | Quick bar create label **+ Tạo việc**, href `/inbox` |

Luồng tạo: footer → `WorkInboxCreateTaskDialog` → `POST /api/work-inbox/create-task` → `insertCreatedTaskIntoSnapshot` → navigate focus — **không** full workspace reload.

---

## 3. Files changed (hotfix scope)

| Layer | File |
|-------|------|
| FE | `components/runtime/RuntimeStatusBar.tsx` |
| FE | `modules/task/TaskWriteContext.tsx` |
| FE | `modules/task/TasksPage.tsx` |
| FE | `modules/task/inbox/create/workInboxCreateTaskTypes.ts` |
| FE | `modules/task/inbox/create/hotfixWorkInboxCreateButtonDisabledChecks.ts` (new) |
| FE | `shared/constants/index.ts` |
| FE | `api/mockApi.ts` |
| Worker | `auth/taskPermissions.ts` |
| Worker | `auth/userContext.ts` |
| Worker | `auth/workInboxCreatePermissions.ts` |
| GAS | `workInboxCreateTask.js` (STAFF không assign cho người khác) |

---

## 4. Permission matrix (after hotfix)

| Role | Footer create | Assign on create |
|------|---------------|------------------|
| ADMIN / MANAGER | Yes | Yes |
| USER | Yes (own) | No |
| STAFF / OPERATOR | Yes (pilot) | No |
| VIEW_ONLY / VIEWER | No (disabled + tooltip) | No |

---

## 5. Test status

| Check ID | Result |
|----------|--------|
| CREATE_BUTTON_NOT_DISABLED_FOR_USER | PASS |
| CREATE_BUTTON_NOT_DISABLED_FOR_OPERATOR | PASS |
| CREATE_BUTTON_OPENS_DIALOG | PASS |
| CREATE_DIALOG_SUBMIT_CALLS_API | PASS |
| VIEWER_CREATE_BUTTON_DISABLED | PASS |
| CREATE_TASK_OPENS_FOCUS | PASS |
| NO_FULL_SNAPSHOT_AFTER_CREATE | PASS |
| CREATE_BUTTON_LABEL_FIXED | PASS |
| CREATE_BUTTON_PERMISSION_TOOLTIP | PASS |
| CREATE_OPERATOR_WORKER_PERMISSION | PASS |
| BUILD_PASS | PASS |

**Suite:** `runHotfixWorkInboxCreateButtonDisabledChecks()` → **GO** (11/11)

```powershell
cd apps/workboard
npx tsx -e "import { runHotfixWorkInboxCreateButtonDisabledChecks } from './src/modules/task/inbox/create/hotfixWorkInboxCreateButtonDisabledChecks.ts'; console.log(runHotfixWorkInboxCreateButtonDisabledChecks());"
npm run build
```

---

## 6. Manual verification

| Scenario | Expected | Status |
|----------|----------|--------|
| STAFF/USER login → footer **+ Tạo việc** | Enabled, clickable | Pending operator smoke |
| Click → dialog | `WorkInboxCreateTaskDialog` opens | Pending |
| Submit → API | `POST /api/work-inbox/create-task` 200 | Pending live |
| Success | Focus opens new task, no full snapshot | Pending |
| VIEWER login | Button disabled, tooltip permission | Pending |

---

## 7. Constraints respected

- No DB schema change  
- No layout redesign  
- RCLA preserved (Worker API → GAS, no FE→GAS bypass)  
- Network hygiene: local insert only on create success path
