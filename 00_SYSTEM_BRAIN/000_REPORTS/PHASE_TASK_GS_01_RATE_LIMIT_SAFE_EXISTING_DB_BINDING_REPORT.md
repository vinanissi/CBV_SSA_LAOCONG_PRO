# PHASE_TASK_GS_01_RATE_LIMIT_SAFE_EXISTING_DB_BINDING — Report

**Date:** 2026-05-25  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO_WITH_WARNINGS

---

## Summary

CBV TASK Runtime được bind vào Google Sheet DB hiện có qua luồng **FE → Worker → GAS → Sheet**, không tạo schema TASKS mới.

## DB Binding

| Field | Value |
|-------|-------|
| Mode | `google_sheet_existing_db` / `existing_db_binding` |
| Spreadsheet ID | `1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE` |
| Primary sheet | `TASK_MAIN` |
| Log sheet | `TASK_UPDATE_LOG` (append-only) |
| Optional read | `TASK_CHECKLIST`, `TASK_ATTACHMENT` |
| Optional audit | `CBV_AUDIT_LOG` (append if present) |

**Không tạo:** TASKS, TASK_EVENTS, TASK_COMMENTS, TASK_AUDIT_LOG

## Header Mapping (manifest baseline)

### TASK_MAIN (expected)

`ID`, `TASK_CODE`, `TITLE`, `DESCRIPTION`, `TASK_TYPE_ID`, `STATUS`, `PRIORITY`, `DON_VI_ID`, `OWNER_ID`, `REPORTER_ID`, `SHARED_WITH`, `IS_PRIVATE`, `START_DATE`, `DUE_DATE`, `DONE_AT`, `PROGRESS_PERCENT`, `RESULT_SUMMARY`, `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `IS_STARRED`, `IS_PINNED`, `IS_DELETED`, `PENDING_ACTION`

**Required for runtime:** `ID`, `TITLE`, `STATUS`, `OWNER_ID`

### TASK_UPDATE_LOG

`ID`, `TASK_ID`, `UPDATE_TYPE`, `ACTION`, `ACTOR_ID`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `IS_DELETED`

Runtime mapping: `UPDATE_TYPE=NOTE` for comments, `STATUS_CHANGE` for status/assign/create.

## GAS Runtime Files

| File | Role |
|------|------|
| `gas-runtime-api/taskDbConfig.js` | Sheet ID, cache TTL, status enums |
| `gas-runtime-api/taskDbSchemaMap.js` | Header read + validation report |
| `gas-runtime-api/taskDbService.js` | Read/write service |
| `gas-runtime-api/taskDbApi.js` | POST JSON action router |
| `gas-runtime-api/taskDbCache.js` | CacheService 30s |
| `gas-runtime-api/taskDbAudit.js` | TASK_UPDATE_LOG + CBV_AUDIT_LOG append |
| `gas-runtime-api/taskDbTestConsole.js` | TCS suite |
| `gas-runtime-api/Code.js` | Routes taskDb actions |

Key function: `CBV_TaskDb_validateExistingDb()` — validate only, no bootstrap.

## API Actions (GAS POST JSON)

`health`, `validateExistingDb`, `getTaskWorkspaceSnapshot`, `getTaskDetail`, `createTask`, `updateTaskStatus`, `assignTask`, `addTaskComment`, `completeTask`

## Worker Routes

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/tasks/health` | `gsTaskDbHealth` |
| GET | `/api/tasks/validate-db` | `gsTaskDbValidate` |
| GET | `/api/tasks/workspace-snapshot` | `gsGetTaskWorkspaceSnapshot` |
| GET | `/api/tasks/:id` | `gsGetTaskDetail` (when runtime mode) |
| POST | `/api/tasks` | `gsCreateTask` (when runtime mode) |
| POST | `/api/tasks/:id/status` | `gsUpdateTaskStatus` |
| POST | `/api/tasks/:id/assign` | `gsAssignTask` |
| POST | `/api/tasks/:id/comments` | `gsAddTaskComment` |
| POST | `/api/tasks/:id/complete` | `gsCompleteTask` |

Adapter: `workers/api/src/adapters/googleSheetTaskDbAdapter.ts`

## ENV

```
GAS_TASK_API_URL=
GAS_TASK_API_TOKEN=
CBV_TASK_SHEET_ID=1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE
CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
```

## FE Changes

- `apps/workboard/src/api/client.ts` — `getTaskWorkspaceSnapshot`, task action POSTs
- `apps/workboard/src/modules/task/TasksPage.tsx` — snapshot UI, counts, runtime bar, warnings
- No GAS URL hardcoded; Worker only

## Cache Strategy

- GAS `CacheService` TTL **30s** per filter key
- Single bulk read of `TASK_MAIN` per snapshot miss
- No per-task fan-out on list view
- Default limit **150**, max **200**

## Rate-Limit Handling

Worker maps `GOOGLE_SHEET_RATE_LIMIT` with `retryable: true` and user-facing Vietnamese message.

## Test Results

| Check | Result |
|-------|--------|
| GAS files created | PASS |
| Worker typecheck | PASS (local) |
| FE build | PASS (local) |
| Live GAS deploy + Sheet bind | PENDING — requires deploy + `GAS_TASK_API_URL` |
| Write tests 11–15 | SKIPPED — `TCS_WRITE=1` not run in this session |

**Overall:** GO_WITH_WARNINGS — code complete; live Sheet validation and write proof pending deploy.

## Known Limitations

1. GAS chưa deploy trong session này — cần `clasp push` + Web App deploy.
2. Header mapping warnings chỉ báo cáo, không tự thêm cột.
3. RF_12 path (`TASKS`/`TASK_TIMELINE`) vẫn tồn tại song song khi `CBV_TASK_RUNTIME_MODE` không set.
4. Visibility `IS_PRIVATE`/`SHARED_WITH` chưa filter ở snapshot (phase sau).
5. Write permission dùng actor từ Worker header — chưa sync AppSheet user table.

## Next Steps

1. Deploy GAS: `cd gas-runtime-api && clasp push && deploy Web App`
2. Set Worker secrets: `GAS_TASK_API_URL`, `GAS_TASK_API_TOKEN`, `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`
3. Run `CBV_TCS_TASK_GS_01_runAll()` với `TCS_WRITE=1` trên Sheet DEV
4. Verify FE against Worker with real snapshot
5. Nếu header thiếu cột bắt buộc — quyết định migration có chủ đích trước khi thêm cột

---

*Append-only report — PHASE_TASK_GS_01*
