# PHASE_TASK_OPERATOR_DISPLAY_NAME — CLOSEOUT REPORT

**Phase:** Closeout audit sau fix Worker snapshot enrichment  
**Date:** 2026-05-29  
**Status:** **PASS (GO)**

---

## 1. Root cause — confirmed

| # | Finding | Evidence |
|---|---------|----------|
| 1 | ADMIN hydrate USER_DIRECTORY qua `/api/users` (200) | Probe `x-cbv-role: ADMIN` → 8 users |
| 2 | OPERATOR/STAFF bị 403 tại `/api/users` | Probe `x-cbv-role: STAFF` → **403** |
| 3 | Snapshot GAS bake `displayOwner: "USR_008"` (raw) | Probe task: `ownerId/displayOwner/owner = USR_008` |
| 4 | Trước fix snapshot không có `userDisplayMap`/`usersById` | Rootcause report + probe before fix |
| 5 | FE resolver đúng nhưng thiếu map → OPERATOR hiện raw code | `getTaskOwnerDisplay` skip raw `displayOwner`, cần `resolveMappedLabel` |

**Kết luận:** Lỗi role-specific do **data path**, không phải resolver FE sai.

---

## 2. Fix location — verified

**File:** `workers/api/src/modules/taskGsDb.ts`

| Requirement | Status | Detail |
|-------------|--------|--------|
| Enrich `userDisplayMap` + `usersById` trong snapshot | ✅ | `handleTaskWorkspaceSnapshot` L175–191 |
| Nguồn = `gsGetUserDirectory(env)` (cùng `/api/users`) | ✅ | `loadUserDirectory` L49–57 |
| Cache TTL 5 phút | ✅ | `USER_DIRECTORY_TTL_MS = 5 * 60 * 1000` L34 |
| Fallback warning khi enrich fail | ✅ | `USER_DIRECTORY_ENRICH_SKIPPED` / `USER_DIRECTORY_ENRICH_FAILED` |
| Role-agnostic (không yêu cầu ADMIN) | ✅ | Enrich trước `createEnvelope`, không check role |
| Không xóa raw ID trong DTO | ✅ | Task vẫn giữ `ownerId/owner/displayOwner` raw |

**FE (không sửa thêm):** `TasksPage.tsx` L285 — `hydrateUserDirectoryFromSnapshot(res.data)` trước enrich tasks; L287–291 chỉ gọi `/api/users` khi map chưa loaded.

---

## 3. Admin path — before / after

| Step | Before | After |
|------|--------|-------|
| Snapshot | Không có map | Có `userDisplayMap` + `usersById` |
| `/api/users` | 200 → hydrate | 200 → hydrate (vẫn hoạt động) |
| Card owner | Tên đúng (qua `/api/users`) | Tên đúng (snapshot map hoặc `/api/users`) |
| Raw audit ID | Giữ | Giữ |

**Regression ADMIN:** Không phát hiện.

---

## 4. Operator path — before / after

| Step | Before | After |
|------|--------|-------|
| `/api/users` | **403** | **403** (giữ nguyên — không cần mở) |
| Snapshot | Không map → không hydrate | Map embedded → hydrate OK |
| Card metadata | `Cũ · USR_008` | `Operation 1` (hoặc tên directory) |
| Phụ thuộc `/api/users` | **Có (fail)** | **Không** |

---

## 5. Runtime probe evidence (local Worker `localhost:8787`)

### ADMIN snapshot
```
keys: tasks, counts, blockedTasks, dueTasks, overdueTasks, runtime, schemaWarnings, userDisplayMap, usersById
userDisplayMap.USR_008 = Operation 1
```

### STAFF snapshot
```
keys: tasks, counts, blockedTasks, dueTasks, overdueTasks, runtime, schemaWarnings, userDisplayMap, usersById
userDisplayMap.USR_008 = Operation 1
usersById count = 8
task.ownerId = USR_008 (raw retained)
task.displayOwner = USR_008 (raw retained)
```

### STAFF /api/users
```
HTTP 403 (expected — UI vẫn đúng qua snapshot map)
```

### UI meta simulation (post-hydrate, không gọi /api/users)
```
getFullMetaLine → "Operation 1 · lâu không cập nhật"
getTaskOwnerDisplay → "Operation 1"
visible USR_008 → false
```

---

## 6. Test results

### Closeout suite — `runTaskOperatorDisplayNameCloseoutChecks()`
| ID | Result |
|----|--------|
| TASK_OPERATOR_SNAPSHOT_HAS_USER_DISPLAY_MAP | PASS |
| TASK_OPERATOR_USERS_ENDPOINT_CAN_REMAIN_FORBIDDEN | PASS |
| TASK_ADMIN_USER_DISPLAY_NAME_OK | PASS |
| TASK_OPERATOR_USER_DISPLAY_NAME_OK | PASS |
| TASK_RAW_USER_ID_RETAINED_FOR_AUDIT | PASS |
| TASK_USER_DISPLAY_FALLBACK_OK | PASS |
| TASK_USER_DISPLAY_EMPTY_MAP_FALLBACK_OK | PASS |

**Suite status:** GO (0 failed)

### Prior fix suite — `runTaskOperatorDisplayNameFixChecks()`
**Suite status:** GO (0 failed) — poisoned `displayName=USR_*` resolver cases

### Build
| Command | Result |
|---------|--------|
| `apps/workboard npm run build` | ✅ PASS |
| `workers/api npm run typecheck` | ⚠️ Pre-existing errors in `src/modules/modules.ts` only — **not related to this phase** |

---

## 7. Risk remaining

| Risk | Level | Mitigation |
|------|-------|------------|
| GAS vẫn bake raw `displayOwner` | Low | Worker enrich + FE resolver skip raw code |
| Directory cache stale 5 phút | Low | Acceptable; tên đổi hiếm |
| `OperationalHome` (mock `/api/today`) | Low | Không phải runtime TASK thật; có try/catch |
| Worker enrich fail | Low | Warning + fallback raw ID, không crash |

---

## 8. HOME_ALERT — cần refresh không?

**Không cần batch update HOME_ALERT cũ.**

- Module TASK thật (`TasksPage`) resolve owner qua snapshot map + FE resolver tại read time.
- HOME_ALERT text cũ có thể còn raw USR_* trong cột materialized — FE overlay `operatorMetaTextDisplay` / `resolveTimelineText` xử lý khi render.
- Không mutate sheet, không batch job.

---

## 9. GAS — cần sửa không?

**Không bắt buộc cho closeout phase này.**

Forward-fix tùy chọn:
- `gas-runtime-api/taskDbUserDisplay.js` — resolve `displayOwner`/`displayAssignee` đúng tên tại nguồn
- Giảm phụ thuộc Worker enrich layer

---

## 10. AppSheet — cần sửa không?

**Không.** Không đổi schema, không sửa security filter, không touch AppSheet.

---

## 11. Kết luận kỹ thuật

| Decision | Answer |
|----------|--------|
| Mở `/api/users` cho OPERATOR? | **Không cần** |
| Sửa AppSheet? | **Không** |
| Batch update HOME_ALERT? | **Không** |
| Phase follow-up GAS? | **Tùy chọn** (forward-fix displayOwner tại nguồn) |
| Phase status | **PASS — GO** |
