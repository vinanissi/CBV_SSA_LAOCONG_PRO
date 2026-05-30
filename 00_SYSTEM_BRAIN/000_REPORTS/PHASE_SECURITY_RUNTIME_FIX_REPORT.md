# PHASE_SECURITY_RUNTIME_FIX — Report

**Date:** 2026-05-30  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Phase:** `PHASE_SECURITY_RUNTIME_FIX`  
**Mode:** SECURITY-FIRST RUNTIME FIX (Worker API only — no UI/GAS/schema changes)  
**Status:** **GO_WITH_WARNINGS**

---

## Executive Summary

Runtime Trace Audit identified **CRITICAL** gaps: task writes without row-level authorization, workspace snapshot returning unfiltered `TASK_MAIN` rows, and legacy RF12 / mock fallback paths that could mask production failures.

This phase implements **Worker-side row-level security** aligned with GAS `canUserSeeTask` (TASK_MAIN PRO baseline: `IS_PRIVATE`, `SHARED_WITH`) and blocks operator writes outside `google_sheet_existing_db` mode.

**Outcome:** All targeted task-db endpoints now enforce `canUserSeeTask` / write permission checks before GAS calls. Snapshot responses are filtered per user on the Worker. Legacy TASKS write routes are blocked when task-db runtime is configured. Permission smoke tests and builds pass locally.

**Residual risk:** GAS snapshot summary rows may omit `isPrivate` / `sharedWith` / `reporterId` — private tasks may appear public until GAS exposes those fields on list rows (out of scope this phase). MANAGER assign scope is role-only, not module-scoped per task.

---

## Files Changed

| File | Change |
|------|--------|
| `workers/api/src/auth/taskPermissions.ts` | Row-level permission model: `canUserSeeTask`, `canUpdateTask`, `canCommentTask`, `canCompleteTask`, `canAssignTask`, `toTaskPermissionFields` |
| `workers/api/src/modules/taskGsDb.ts` | Snapshot filter, write pre-checks, `taskDbRuntimeRequired`, sanitized responses |
| `workers/api/src/router.ts` | Legacy RF12 write block, task-db detail routing, PATCH block in GS_01 mode |
| `workers/api/src/auth/taskPermissions.test.ts` | Permission smoke tests |
| `workers/api/package.json` | `test:permissions` script |
| `workers/api/tsconfig.json` | Exclude `*.test.ts` from `tsc` |
| `workers/api/src/modules/modules.ts` | Fix pre-existing `.filter(canAccessModule)` type error (unrelated but blocked typecheck) |

**Not changed (per scope):** UI, GAS, schema, HOME_ALERT, AppSheet, Focus Mode.

---

## Permission Model Implemented

Location: `workers/api/src/auth/taskPermissions.ts`

| Function | Rule summary |
|----------|----------------|
| `canUserSeeTask` | ADMIN: all. Public (`IS_PRIVATE` false/absent): role-based module visibility (FINANCE/HO_SO) + STAFF/MANAGER/VIEW_ONLY see public. Private: owner, assignee, reporter, createdBy, SHARED_WITH, MANAGER+donViId match. |
| `canUpdateTask` | VIEW_ONLY: deny. Must pass `canUserSeeTask`. ADMIN/MANAGER: allow. STAFF: assigned only. FINANCE/HO_SO: module-scoped tasks. |
| `canCommentTask` | Same as `canUpdateTask`. |
| `canCompleteTask` | Same as `canUpdateTask`. |
| `canAssignTask` | ADMIN or MANAGER only (role gate). |
| `canCreateTask` | ADMIN or MANAGER; VIEW_ONLY denied. |

Aligns with workspace rule: ADMIN sees all; private tasks limited to owner/reporter/shared (+ ADMIN).

---

## Endpoint Protection Matrix

| Endpoint | Method | Protection |
|----------|--------|------------|
| `/api/tasks/workspace-snapshot` | GET | Module gate + `taskDbRuntimeRequired` + **`filterSnapshotForUser`** (`canUserSeeTask` per row) |
| `/api/tasks/:id` | GET | Module gate + load detail + **`canUserSeeTask`** → 403 if denied |
| `/api/tasks/:id/status` | POST | Runtime required + load task + **`canUpdateTask`** → 403 + GAS write |
| `/api/tasks/:id/complete` | POST | Runtime required + load task + **`canCompleteTask`** → 403 + GAS write |
| `/api/tasks/:id/comments` | POST | Runtime required + load task + **`canCommentTask`** → 403 + GAS write |
| `/api/tasks/:id/assign` | POST | Runtime required + **`canAssignTask`** + visibility + GAS write |
| `/api/tasks` | POST | **`canCreateTask`**; assignee in body requires **`canAssignTask`** |
| `/api/tasks/:id` | PATCH | **Blocked** in `google_sheet_existing_db` mode (legacy RF12 path) |
| POST sub-routes | POST | **Blocked** unless `isTaskDbRuntimeMode(env)` |

HTTP 403 mapping: `router.ts` `resolveStatus()` when envelope errors contain `Không có quyền`.

---

## Snapshot Filtering Result

**Before:** GAS returned full `TASK_MAIN` set; Worker passed through; FE relied on client filtering.

**After:**

```text
GAS getTaskWorkspaceSnapshot
  → Worker receives raw snapshot (cache may store raw)
  → filterSnapshotForUser() on tasks, blockedTasks, dueTasks, overdueTasks
  → canUserSeeTask() per row
  → counts recomputed from filtered tasks
  → warning: TASK_SECURITY_ROW_FILTER
```

Each returned task gets `permissionAllowed` and `isMine` from `sanitizeTaskForUser`.

---

## Write Protection Result

All write handlers follow:

```text
1. taskDbRuntimeRequired(env)
2. loadTaskForPermissionCheck → gsGetTaskDetail + canUserSeeTask
3. canUpdateTask | canCommentTask | canCompleteTask | canAssignTask
4. If fail → forbidden (403)
5. GAS write (no mock success)
6. Return sanitized task / log
```

**Handoff warning:** `handleTaskDbStatus` appends warning `HANDOFF_STATUS_ONLY — chuyển xử lý qua status không đổi OWNER_ID; dùng POST /assign để giao việc`.

---

## Mock / Fallback Safety Result

| Scenario | Behavior |
|----------|----------|
| `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db` | Writes require GAS; `taskDbRuntimeRequired` blocks legacy path |
| GAS not configured | `GOOGLE_SHEET_RUNTIME_NOT_CONFIGURED` error envelope — no fake success |
| GAS call fails | `taskDbErrorEnvelope` with `ok: false` — no mock write |
| POST `/api/tasks` with GAS configured but wrong mode | Explicit error + `TASK_RUNTIME_LEGACY_WRITE_BLOCKED` |
| POST status/assign/comment/complete without GS_01 mode | Blocked with legacy write warning |

Adapter does not fall back to mock data for task-db writes when in `google_sheet_existing_db` mode.

---

## Legacy RF12 Safety Result

| Path | GS_01 mode | Effect |
|------|------------|--------|
| POST `/api/tasks/:id/{status\|assign\|comments\|complete}` | Required | Legacy TASKS/TIMELINE not used |
| PATCH `/api/tasks/:id` | Blocked | Forces explicit POST sub-routes |
| POST `/api/tasks` | Routes to `handleTaskDbCreate` | No `handleCreateTask` (TASKS) |
| GET `/api/tasks/:id` | `handleTaskDbDetail` when configured | TASK_MAIN detail path |

Warning code: `TASK_RUNTIME_LEGACY_WRITE_BLOCKED`.

---

## Tests Run

### Permission smoke (`npm run test:permissions`)

```
taskPermissions smoke: PASS
```

Coverage:

- ADMIN sees all private tasks
- STAFF cannot see unrelated private task
- STAFF sees private when in SHARED_WITH
- VIEW_ONLY cannot update
- STAFF can complete/comment assigned task; cannot complete unrelated
- MANAGER can assign; STAFF cannot assign

### API smoke

Not run against live GAS in this session (no deployed harness). Logic verified by handler unit path + permission tests. Recommended manual checks after deploy:

- GET workspace-snapshot as STAFF → no unrelated private rows
- POST complete/status/comment/assign on foreign task → 403

### Build

| Command | Result |
|---------|--------|
| `workers/api`: `npm run typecheck` | **PASS** |
| `workers/api`: `npm run test:permissions` | **PASS** |
| `apps/workboard`: `npm run build` | **PASS** |

---

## Remaining Risks

1. **Snapshot privacy fields:** If GAS summary rows omit `isPrivate`/`sharedWith`, Worker treats missing `isPrivate` as public (matches GAS default). Mitigation requires GAS snapshot to include privacy columns (future phase).
2. **MANAGER assign scope:** `canAssignTask` is role-only; no per-task module/donVi check on assign.
3. **GET `/api/tasks` list (legacy mock path):** Still available when not in task-db mode — not used in production GS_01 config but not removed.
4. **`/api/today` mock:** Unchanged; not in security phase scope.
5. **Focus handoff UI:** Still calls status-only handoff — documented via status POST warning; fix in `PHASE_FOCUS_RUNTIME_FIX`.

---

## Next Recommended Phase

**PHASE_FOCUS_RUNTIME_FIX**

- Wire Focus Mode V3 / FocusActionBar to real runtime (`useInlineExecution` pattern).
- Fix sidebar `/observe` → `/observation`, `/config` → `/plugins`.
- Do not re-open Worker security unless regression found.

---

*Append-only report. Related: `PHASE_UI_RUNTIME_TRACE_AUDIT_REPORT.md`, `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`.*
