# PHASE_TASK_GS_01_RATE_LIMIT_SAFE_EXISTING_DB_BINDING

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

Branch: `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Mục tiêu

Kết nối CBV TASK Runtime với DB hiện có, KHÔNG tạo schema TASK mới.

## DB hiện có

- File: `DEV_FIN_CBV_SSA_LAOCONG_DB.xlsx`
- Spreadsheet ID: `1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE`
- URL: https://docs.google.com/spreadsheets/d/1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE/edit

## Nguyên tắc bắt buộc

1. KHÔNG tạo DB mới.
2. KHÔNG tạo schema TASKS mới.
3. KHÔNG đổi tên sheet/tab hiện có.
4. KHÔNG đổi header hiện có theo kiểu destructive.
5. KHÔNG clear dữ liệu.
6. KHÔNG xoá dòng/cột.
7. Chỉ bind vào các sheet hiện có.
8. Nếu thiếu cột bắt buộc, chỉ báo warning trong report.
9. FE không gọi GAS trực tiếp.
10. FE chỉ gọi Worker.
11. Worker gọi GAS Web App.
12. Thiết kế rate-limit-safe: đọc gộp, cache, không polling nhanh.
13. Write append-only ở log/update/event.
14. Không nhảy phase, không redesign toàn hệ.

## DB Contract

| Sheet | Vai trò |
|-------|---------|
| TASK_MAIN | task state chính |
| TASK_CHECKLIST | checklist / bước xử lý |
| TASK_ATTACHMENT | tài liệu xử lý |
| TASK_UPDATE_LOG | log cập nhật, comment, status change |

Không dùng: TASKS, TASK_EVENTS, TASK_COMMENTS, TASK_AUDIT_LOG (schema mới).

## GAS Runtime

Files: `gas-runtime-api/taskDbConfig.js`, `taskDbSchemaMap.js`, `taskDbService.js`, `taskDbApi.js`, `taskDbCache.js`, `taskDbAudit.js`, `taskDbTestConsole.js`

`CBV_TASK_DB_ID = '1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE'`

Function: `CBV_TaskDb_validateExistingDb()` — validate only, no bootstrap.

## API Actions

health, validateExistingDb, getTaskWorkspaceSnapshot, getTaskDetail, createTask, updateTaskStatus, assignTask, addTaskComment, completeTask

## Worker Routes

- GET `/api/tasks/health`
- GET `/api/tasks/validate-db`
- GET `/api/tasks/workspace-snapshot`
- GET `/api/tasks/:id`
- POST `/api/tasks`
- POST `/api/tasks/:id/status`
- POST `/api/tasks/:id/assign`
- POST `/api/tasks/:id/comments`
- POST `/api/tasks/:id/complete`

## ENV

```
GAS_TASK_API_URL=
GAS_TASK_API_TOKEN=
CBV_TASK_SHEET_ID=1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE
CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
```

## Acceptance

GO khi: bind TASK_MAIN, TASK_UPDATE_LOG append-only, snapshot + cache, Worker routes, FE gọi Worker, write thật, npm build PASS.
