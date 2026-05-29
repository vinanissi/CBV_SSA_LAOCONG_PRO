# PHASE_TASK_PERMISSION_AUDIT — AI HANDOFF

- **Phase**: `PHASE_TASK_PERMISSION_01_AUDIT_ONLY`
- **Date**: 2026-05-29
- **Status**: AUDIT-ONLY COMPLETE — không sửa code/schema/AppSheet
- **Report**: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_PERMISSION_AUDIT_REPORT.md`
- **Decision**: `00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_PERMISSION_MODEL.md`

## Mục tiêu phase
Audit thiết kế phân quyền **xem việc** module TASK/WORKSPACE trên DB Google Sheets + AppSheet + WebApp, đề xuất cập nhật an toàn (append-only, manual-first, không phá luồng cũ).

## Bối cảnh runtime (cho AI kế tiếp)
- 3 nguồn task: **`TASK_MAIN`** (canonical, AppSheet + worker snapshot), **`TASKS`** (sheet riêng RF_12 worker — deprecated, trùng nghĩa), **`HOME_ALERT`** (queue/inbox projection).
- WebApp React (`apps/workboard`) → Cloudflare Worker (`workers/api`) → GAS (`gas-runtime-api`) action `getTaskWorkspaceSnapshot` → `taskDbReadMainSummaries_()` đọc **all** rows.
- Permission runtime hard-code trong `05_GAS_RUNTIME/46_CBV_PERMISSION_RUNTIME.js` (roles: ADMIN/MANAGER/STAFF/FINANCE/HO_SO/VIEW_ONLY). `ROLE_PERMISSION_MATRIX` sheet KHÔNG được đọc.
- `canUserSeeTask()` ở `05_GAS_RUNTIME/45_SHARED_WITH_SERVICE.js` đã có nhưng chỉ chạy khi truyền `resource.taskRow` cho `CBV_Permission_can(TASK_VIEW/TASK_DETAIL)`; list/snapshot không truyền.

## Phát hiện chính (xem report mục 4)
- **G1/G2 CRITICAL**: snapshot trả all task, `permissionAllowed=true` hard-code, FE không ẩn.
- **G3 HIGH**: AppSheet Security Filter PRO chỉ tài liệu hoá, chưa xác nhận deploy.
- **G4/G5 HIGH**: thiếu `VIEW_SCOPE` + scope DON_VI/TEAM; `ROLE_PERMISSION_MATRIX` chưa dùng.
- **G6 HIGH**: 3 nguồn task trùng nghĩa.

## Map nghĩa cột (QUAN TRỌNG — không tạo cột trùng)
| Khái niệm mục tiêu | Cột thực tế trong TASK_MAIN/USER_DIRECTORY |
|---|---|
| ASSIGNED_TO | `OWNER_ID` (OWNER_ID = assignee, không có ASSIGNEE_ID) |
| WATCHERS | `SHARED_WITH` (list ID, comma-separated) |
| VISIBILITY | `IS_PRIVATE` (boolean) |
| CREATED_BY/reporter | `REPORTER_ID` + `CREATED_BY` |
| MANAGER_USER_ID (user) | `USER_DIRECTORY.SUPERVISOR_ID` |
| IS_ACTIVE (user) | `STATUS`/`USER_STATUS = ACTIVE` + `IS_DELETED` |
| THIẾU (cần append) | `TASK_MAIN.TEAM_ID`, `TASK_MAIN.ASSIGNED_TEAM`, `TASK_MAIN.IS_CONFIDENTIAL`; `USER_DIRECTORY.VIEW_SCOPE`; `ROLE_PERMISSION_MATRIX.CAN_VIEW_*` |

## Việc đã làm trong phase này
- Đọc schema manifest, permission runtime, shared-with service, task repo/service, webapp API, home alert reader, RF_12 task/permission, AppSheet security docs, React workboard data flow.
- Tạo 3 file: report + handoff (file này) + ADR. **Không** chạm runtime/schema/AppSheet.

## Việc CHƯA làm (để phase sau)
- Chưa append cột nào.
- Chưa implement `CbvTaskPermission_canViewTask_`.
- Chưa tạo test console permission.
- Chưa verify AppSheet filter trên app live.
- Chưa giải quyết trùng nghĩa `TASKS` vs `TASK_MAIN`.

## Next phase đề xuất (theo thứ tự an toàn)
1. **Verify AppSheet Security Filter** (tài khoản thật, không đụng code) — rủi ro production hiện hữu nhất.
2. `PHASE_TASK_PERMISSION_02_SCHEMA_APPEND_PLAN` — kế hoạch append cột + cập nhật `90_BOOTSTRAP_SCHEMA.js` & `90_BOOTSTRAP_AUDIT_SCHEMA.js`.
3. `PHASE_TASK_PERMISSION_03_PERMISSION_ENGINE_SHADOW` — engine + đọc `ROLE_PERMISSION_MATRIX` + shadow diff.
4. `PHASE_TASK_PERMISSION_04_TEST_CONSOLE`.
5. `PHASE_TASK_PERMISSION_05_CONTROLLED_WEBAPP_ENABLE` (FEATURE_FLAG, WebApp trước).
6. `PHASE_TASK_PERMISSION_06_APPSHEET_FILTER_ENABLE`.

## Ràng buộc an toàn (CBV V1 — bắt buộc giữ)
- Append-only; không xoá/đổi tên cột; không đổi AppSheet production filter trực tiếp; không bật strict ngay; không mutate TASK_MAIN khi chưa backup/test; không overwrite report cũ; không push nếu test fail.
- Tuân `.cursor/rules/task-main-pro-production-baseline.mdc`: KHÔNG hạ cấp SHARED_WITH/IS_PRIVATE; cập nhật schema manifest + audit schema khi thêm cột.

## Feature flags đề xuất (sheet FEATURE_FLAG đã tồn tại)
`TASK_PERMISSION_ENGINE_ENABLED=false`, `TASK_PERMISSION_SHADOW_MODE=true`, `TASK_PERMISSION_APPSHEET_FILTER_READY=false`, `TASK_PERMISSION_STRICT_MODE=false`, `TASK_PERMISSION_AUDIT_LOG_ENABLED=true`.

## File anchor để bắt đầu phase sau
- Engine sẽ đặt cạnh `05_GAS_RUNTIME/46_CBV_PERMISSION_RUNTIME.js` (hoặc file mới `47_CBV_TASK_VIEW_SCOPE_RUNTIME.js`).
- Snapshot cần lọc tại `gas-runtime-api/taskDbService.js` (`taskDbReadMainSummaries_`/`taskDbApplyFilters_`) — thêm bước `canViewTask` sau khi đọc actor.
