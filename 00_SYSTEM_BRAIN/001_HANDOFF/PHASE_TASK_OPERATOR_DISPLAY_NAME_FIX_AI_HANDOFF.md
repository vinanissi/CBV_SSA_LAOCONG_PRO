# PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX — AI HANDOFF

- **Date**: 2026-05-29
- **Status**: FIX COMPLETE (FE build PASS, deployable). GAS không bắt buộc cho fix này.
- **Report**: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX_REPORT.md`

## Vấn đề
ADMIN hiển thị đúng tên; OPERATOR vẫn hiện raw `USR_008` ở metadata task.

## Root cause
Cùng code path React (ADMIN/OPERATOR chung snapshot `/api/tasks/workspace-snapshot` đọc TASK_MAIN). Khác biệt:
1. `USER_DIRECTORY` của `USR_008` thiếu `DISPLAY_NAME`/`FULL_NAME` → backend nhét `displayName = "USR_008"` và map `["USR_008"]="USR_008"`.
2. FE resolver bị poison:
   - `entryLabel` trả `displayName` (=code) trước, không tới EMAIL.
   - `indexDisplayMapEntry` ghi code vào `cachedMap` vô điều kiện, đè EMAIL từ `usersById`.
ADMIN xem user có tên nên không dính.

## Đã sửa (FE — `apps/workboard`)
- `src/runtime/userDisplay.ts`:
  - `entryLabel`: bỏ qua giá trị là raw `USR_*` → rơi xuống EMAIL → code → id.
  - `indexDisplayMapEntry`: không ghi raw `USR_*` vào cache, không lưu code làm displayName.
  - Helper chung **`resolveUserDisplayName(userId, userMap?)`**.
  - Mapper chung **`enrichTaskUserDisplayNames(task, userMap?)`** (additive *DisplayName + overlay HOME_ALERT `operatorMetaTextDisplay`/`ownerLabelDisplay`/`assignedToLabelDisplay`), wire vào `enrichTaskUserFieldsFromDirectory`.
- `src/api/contracts.ts`: thêm field optional additive vào `TaskItem`.
- Test: `src/modules/task/taskOperatorDisplayNameFixChecks.ts` (suite `PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX`).

## Render rule (FE)
`createdByDisplayName || createdBy`, `ownerDisplayName || ownerId`, `assignedToDisplayName || assignedTo || 'chưa giao'`. Resolver/card đã không lộ raw `USR_` khi resolve được; raw id giữ trong DTO.

## CHƯA làm / khuyến nghị
- GAS `80_HOME_ALERT_RUNTIME.js` forward-fix: resolve `assignee` trong `HomeAlert_buildDisplayFooter_` (~1014) và `DISPLAY_ASSIGNEE` (~956) qua `HomeAlert_lookupUserDirectoryLabel_`. Forward-only, không batch update. Cần `clasp push` + UAT operator.
- GAS `taskDbUserDisplay.js` (EMAIL fallback phase trước): nên `clasp push` để map gốc cũng có EMAIL (không bắt buộc).
- Backfill `USER_DIRECTORY.DISPLAY_NAME/FULL_NAME` còn rỗng (manual, có backup, không auto-fix).

## Ràng buộc đã giữ
Additive; không xoá raw id; không đổi schema/cột; không mutate TASK_MAIN/HOME_ALERT; không refresh HOME_ALERT hàng loạt; không đụng AppSheet; không phá ADMIN path; build pass.

## Kiểm chứng
`npm run build` PASS. Suite: ADMIN(name), OPERATOR(email, no USR_), myQueue overlay, missing→raw fallback, empty→"", raw retained.
