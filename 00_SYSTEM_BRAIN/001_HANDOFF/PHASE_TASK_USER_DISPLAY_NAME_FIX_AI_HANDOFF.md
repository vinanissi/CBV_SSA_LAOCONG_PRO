# PHASE_TASK_USER_DISPLAY_NAME_FIX — AI HANDOFF

- **Date**: 2026-05-29
- **Status**: FIX COMPLETE (FE build PASS) — GAS change chưa `clasp push`.
- **Report**: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_USER_DISPLAY_NAME_FIX_REPORT.md`

## Vấn đề
FE module TASK/"Việc vận hành" hiển thị mã user (vd `USR_008`) ở dòng metadata thay vì DISPLAY_NAME/FULL_NAME.

## Root cause (tóm tắt)
Pipeline resolve tên đã đúng tầng nhưng:
1. Chuỗi fallback hiển thị thiếu **EMAIL** (`DISPLAY_NAME → FULL_NAME → EMAIL → code`).
2. `OperationalHome` (Bàn điều phối) render card mà **không hydrate USER_DIRECTORY + không enrich** owner (khác `TasksPage`).
3. Còn lại: user thiếu cả tên lẫn email trong `USER_DIRECTORY` → fallback raw code (đúng spec).

## Đã sửa
- `gas-runtime-api/taskDbUserDisplay.js`: `taskDbLoadUserDirectory_` thêm EMAIL vào chuỗi fallback `display`.
- `apps/workboard/src/runtime/userDisplay.ts`: `UserDirectoryEntry.email`, `entryLabel` thêm email, carry email/fullName qua `saveUsersById`/`normalizeDirectoryUser`.
- `apps/workboard/src/components/dashboard/OperationalHome.tsx`: hydrate directory (`api.getUsers` nếu chưa load) + `enrichTasksUserFieldsFromDirectory` cho priority/my/overdue tasks.
- Test: `apps/workboard/src/modules/task/taskUserDisplayNameFixChecks.ts` (suite `PHASE_TASK_USER_DISPLAY_NAME_FIX`).

## Kiến trúc resolve (cho AI sau)
- Nguồn: `TASK_MAIN.OWNER_ID/REPORTER_ID` = **USER_CODE** (vd USR_008).
- GAS DTO: `taskDbLoadUserDirectory_` (key USER_CODE/ID) → `taskDbEnrichTaskUserFields_` set `owner/displayOwner/ownerUser` + emit `userDisplayMap`/`usersById` trong `getTaskWorkspaceSnapshot`.
- Worker: spread snapshot (giữ nguyên maps) → FE.
- FE: `hydrateUserDirectoryFromSnapshot` + `enrichTasksUserFieldsFromDirectory` (TasksPage) / `OperationalHome` (đã thêm). Render qua `getTaskOwnerDisplay`/`getCardOwnerMetaShort` (priority displayName → fallback raw id; "Chưa giao" khi rỗng).

## CHƯA làm / cần duyệt
- **`clasp push gas-runtime-api`** để GAS EMAIL-fallback có hiệu lực trên live (chỉ push khi operator yêu cầu).
- Backfill `USER_DIRECTORY.DISPLAY_NAME/FULL_NAME` còn rỗng (manual, có backup) — KHÔNG auto-fix.
- `/api/today` còn local projection ở Worker; khi bind thật cần enrich owner như snapshot.

## Ràng buộc đã giữ
- Không đổi schema/đổi tên cột; không mutate TASK_MAIN/HOME_ALERT; không refresh HOME_ALERT; không đụng AppSheet; raw ID giữ trong DTO; fallback an toàn; build pass.

## Kiểm chứng
- `npm run build` PASS. `npm test`/`scripts/*.ps1` = not available.
- Suite check: 6 case (DISPLAY_NAME, FULL_NAME, EMAIL, no-record fallback, empty→"Chưa giao", meta không lộ USR_).
