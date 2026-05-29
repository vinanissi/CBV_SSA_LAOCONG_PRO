# PHASE_TASK_OPERATOR_DISPLAY_NAME_ROOTCAUSE — REPORT

## Triệu chứng
- Role **ADMIN**: task card hiển thị đúng tên (`Operation 1`).
- Role **OPERATOR/STAFF**: vẫn hiển thị raw `USR_008` ở dòng metadata (`Cũ · USR_008`).
- `Cũ` chỉ là nhãn signal AWARENESS (stale > 365 ngày) trong `signalCollapse.ts:109`, không phải lỗi. Phần sai là owner `USR_008`.

## Root cause (xác định bằng probe runtime thật)
Probe trực tiếp Worker `http://localhost:8787`:

1. `GET /api/users` (x-cbv-role=ADMIN) → trả `USR_008 → "Operation 1"` (tên CÓ tồn tại trong USER_DIRECTORY).
2. `GET /api/users` (x-cbv-role=STAFF) → **403** (`handleGetUsers` chỉ cho `ADMIN_ALL` hoặc `MANAGER`).
3. `GET /api/tasks/workspace-snapshot` → mỗi task có `displayOwner: "USR_008"` (GAS bake raw code) và **KHÔNG** có `userDisplayMap`/`usersById`.

→ Cơ chế thật:
- FE resolver (`getTaskOwnerDisplay`) đã đúng: nó **bỏ qua** `displayOwner` khi giá trị là raw `USR_*`, rồi gọi `resolveMappedLabel(ownerId)` — nhưng cần directory map đã hydrate.
- **ADMIN**: FE gọi `/api/users` thành công → directory hydrate → resolve được tên.
- **OPERATOR**: `/api/users` trả 403 → directory KHÔNG hydrate → snapshot lại không mang map → owner giữ nguyên raw `USR_008`.

Đây là lý do lỗi **chỉ xảy ra với OPERATOR**, không phải vấn đề ở resolver FE.

## Fix (additive, role-agnostic, không đổi schema/AppSheet)
`workers/api/src/modules/taskGsDb.ts` — `handleTaskWorkspaceSnapshot`:
- Sau khi dựng snapshot, nếu chưa có `userDisplayMap`, nạp USER_DIRECTORY qua `gsGetUserDirectory(env)` (chính nguồn `/api/users` dùng) và gắn `userDisplayMap` + `usersById` (tối thiểu: id/code → tên; kèm email) vào snapshot.
- Map gắn ở **tầng Worker** → mọi role có quyền xem TASK đều nhận map, không cần endpoint admin-only.
- Có **in-memory cache TTL 5 phút** cho directory → an toàn rate-limit (1 GAS call/khung TTL).
- Lỗi nạp directory → bỏ qua, thêm warning `USER_DIRECTORY_ENRICH_SKIPPED|FAILED`, snapshot vẫn chạy (fallback raw id, không vỡ).

FE không cần sửa: `TasksPage` đã gọi `hydrateUserDirectoryFromSnapshot(res.data)` trước, nên `userDisplayMap` từ snapshot được nạp cho mọi role; nhánh `getUsers()` admin-only bị skip vì directory đã loaded.

## Kiểm chứng runtime (sau fix)
`GET /api/tasks/workspace-snapshot` (x-cbv-role=**STAFF**):
```
KEYS: ..., userDisplayMap, usersById
USR_008 => Operation 1
```
→ OPERATOR nay nhận tên qua snapshot, không còn raw code.

## Phạm vi & ghi chú
- View bị báo lỗi là module TASK thật (`TasksPage`, snapshot `TASK_MAIN Connected`). Đã fix.
- Dashboard "Hôm nay" (`OperationalHome`) dùng `handleToday` = **mock data**, không phải runtime thật; vẫn giữ nhánh `getUsers()` có try/catch an toàn (403 không vỡ UI).
- Lỗi tsc tồn sẵn ở `src/modules/modules.ts` không liên quan thay đổi này.

## Khuyến nghị forward-fix (tuỳ chọn)
- GAS `gas-runtime-api` nên resolve `displayOwner`/`displayAssignee` đúng tên ngay từ nguồn (hiện đang bake raw code), để giảm phụ thuộc lớp enrich Worker.
