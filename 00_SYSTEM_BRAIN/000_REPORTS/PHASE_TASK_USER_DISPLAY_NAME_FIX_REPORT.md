# PHASE_TASK_USER_DISPLAY_NAME_FIX_REPORT

- **Date**: 2026-05-29
- **Scope**: FE module TASK / "Việc vận hành" hiển thị mã user (vd `USR_008`) ở dòng metadata thay vì tên người.
- **Mode**: Fix đúng tầng (DTO/runtime), append-only report, không mutate dữ liệu, không đổi schema/AppSheet.
- **Standard**: CBV OPERATIONAL ECOSYSTEM STANDARD V1
- **Build**: `npm run build` (tsc --noEmit + vite build) → PASS.

---

## 1. Root cause

Hệ thống **đã có sẵn pipeline resolve USER_ID → tên** đúng tầng (GAS DTO → snapshot map → FE resolver). Mã `USR_008` chỉ lộ ra khi **owner code không resolve được thành label**, do một trong hai nguyên nhân:

1. **Thiếu dữ liệu tên trong `USER_DIRECTORY`** cho user đó: cả `DISPLAY_NAME` và `FULL_NAME` đều rỗng. Khi đó loader GAS (`taskDbLoadUserDirectory_`) fallback `display = USER_CODE` → `userDisplayMap[USR_008] = "USR_008"` → resolver trả lại chính mã. **Trước fix, EMAIL không nằm trong chuỗi fallback** (dù prompt resolver yêu cầu `DISPLAY_NAME || FULL_NAME || NAME || EMAIL || id`).
2. **Màn hình render trước khi nạp USER_DIRECTORY**: trang "Bàn điều phối" (`OperationalHome`) render `TaskCard` từ `getTodaySummary()` nhưng **không hydrate user directory và không enrich owner** (khác với `TasksPage` vốn đã hydrate + enrich từ snapshot). Khi directory cache rỗng, `getTaskOwnerDisplay` fallback về raw `ownerId`.

→ Không phải hard-code tên, không phải chỉ lỗi 1 component. Đây là (1) thiếu 1 bậc fallback (EMAIL) ở tầng DTO/resolver và (2) 1 màn hình thiếu bước hydrate/enrich.

---

## 2. Đã sửa ở tầng nào

| Tầng | Thay đổi | Vì sao đúng tầng |
|---|---|---|
| **GAS DTO (Option A — tốt nhất)** | Thêm **EMAIL** vào chuỗi fallback hiển thị: `DISPLAY_NAME → FULL_NAME → EMAIL → USER_CODE → id`. | Enrich tại nguồn (`taskDbLoadUserDirectory_`) để `userDisplayMap`/`usersById` trong snapshot luôn mang label người-đọc-được; raw `OWNER_ID/REPORTER_ID` giữ nguyên trên row. |
| **FE resolver (Option B — bổ trợ)** | `userDisplay.ts`: `entryLabel` thêm bậc `email`; carry `email`/`fullName` qua `saveUsersById`, `normalizeDirectoryUser`. | Để cả nguồn `/api/users` và `usersById` snapshot cùng resolve nhất quán theo chuỗi như GAS. |
| **FE màn hình (đóng gap)** | `OperationalHome.tsx`: hydrate `USER_DIRECTORY` (gọi `api.getUsers()` nếu chưa load) + `enrichTasksUserFieldsFromDirectory` cho `priorityTasks/myTasks/overdueTasks` trước khi render. | Bảo đảm dashboard cũng resolve tên; fallback an toàn nếu directory lỗi. |
| **FE test (CBV_TCS_V1)** | Thêm suite `PHASE_TASK_USER_DISPLAY_NAME_FIX` (5+1 case). | Test được, không trộn business menu. |

**Không** chỉ replace text ở component; **không** hard-code `USR_008` hay tên người.

---

## 3. File đã sửa / tạo

**Sửa:**
- `gas-runtime-api/taskDbUserDisplay.js` — thêm EMAIL vào chuỗi fallback `display` trong `taskDbLoadUserDirectory_`.
- `apps/workboard/src/runtime/userDisplay.ts` — `UserDirectoryEntry.email`; `entryLabel` thêm bậc email; carry email/fullName qua `saveUsersById` + `normalizeDirectoryUser`.
- `apps/workboard/src/components/dashboard/OperationalHome.tsx` — hydrate directory + enrich task arrays trước khi render.

**Tạo (append-only):**
- `apps/workboard/src/modules/task/taskUserDisplayNameFixChecks.ts` — test suite.
- `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_USER_DISPLAY_NAME_FIX_REPORT.md` (file này).
- `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_TASK_USER_DISPLAY_NAME_FIX_AI_HANDOFF.md`.

**KHÔNG đụng:** schema (`90_BOOTSTRAP_SCHEMA.js`), `TASK_MAIN` data, `HOME_ALERT` data, AppSheet security/filter, tên field cũ.

---

## 4. Data source FE đang dùng (xác định)

- **Trang Tasks ("Việc vận hành")** → `GET /api/tasks/workspace-snapshot` → Cloudflare Worker → GAS `getTaskWorkspaceSnapshot` đọc **`TASK_MAIN`**. Snapshot **đã kèm** `userDisplayMap` + `usersById` (từ `USER_DIRECTORY`). FE `TasksPage` đã `hydrateUserDirectoryFromSnapshot` + `enrichTasksUserFieldsFromDirectory`.
- **Trang "Bàn điều phối" (`OperationalHome`)** → `GET /api/today` (hiện là local projection ở Worker — `modules/workboard.ts` dùng `mockData.getTodaySummary`). Trước fix **không** hydrate/enrich → đã đóng gap.
- **Mock mode** (không cấu hình `VITE_CBV_API_BASE_URL`) → `mockApi` trả task demo (tên có sẵn).

### Mapping USER_ID → DISPLAY_NAME xử lý ở tầng nào
Chính ở **GAS DTO**: `taskDbLoadUserDirectory_` (đọc `USER_DIRECTORY`, key theo `USER_CODE`/`ID`) → `taskDbEnrichTaskUserFields_` set `owner/displayOwner/ownerUser.displayName` + emit `userDisplayMap`/`usersById` trong snapshot → **FE** `userDisplay.ts` (`resolveUserLabel`, `getTaskOwnerDisplay`) ưu tiên display name, fallback raw id. Raw `ownerId`/`reporterId` luôn được giữ để debug/audit.

---

## 5. Test result

- `npm run build` (tsc --noEmit + vite build): **PASS** (157 modules, 0 type error).
- `npm test`: **not available** (workboard không có script `test`; chỉ có `dev`/`build`/`preview`/`typecheck`).
- `./scripts/test.ps1`, `./scripts/report.ps1`: **not available** (không tồn tại trong repo).
- Suite `PHASE_TASK_USER_DISPLAY_NAME_FIX` (chạy được trong CBV test console, đã compile sạch qua tsc):
  - `TASK_USER_DISPLAY_NAME_RESOLVED` — có DISPLAY_NAME → hiển thị tên.
  - `TASK_USER_DISPLAY_FULLNAME_FALLBACK` — chỉ FULL_NAME → hiển thị FULL_NAME.
  - `TASK_USER_DISPLAY_EMAIL_FALLBACK` — chỉ EMAIL → hiển thị EMAIL.
  - `TASK_USER_DISPLAY_FALLBACK_SAFE` — không có record → fallback `USR_899`.
  - `TASK_USER_DISPLAY_UNASSIGNED_SAFE` — owner rỗng → "Chưa giao".
  - `TASK_USER_ID_NOT_RENDERED_WHEN_DISPLAY_NAME_EXISTS` — meta card không lộ `USR_` khi đã có tên.

---

## 6. Có cần refresh dữ liệu HOME_ALERT không?

**KHÔNG.** Việc resolve tên xảy ra ở thời điểm đọc/enrich (GAS DTO + FE), không phụ thuộc cột `DISPLAY_*`/`OPERATOR_*`/`ASSIGNED_TO_LABEL` đã bake sẵn trong `HOME_ALERT`. Các thẻ task vận hành đọc `TASK_MAIN` (qua snapshot) / `today summary`, không đọc text USR_ đã lưu cứng trong HOME_ALERT. Không mutate / không regenerate HOME_ALERT trong phase này.

> Nếu sau này thấy `USR_008` lộ ra trong các cột `OPERATOR_SECONDARY_TEXT`/`DISPLAY_FOOTER`/`DESKTOP_SECONDARY_LINE` của HOME_ALERT (text cũ): đó là phase riêng — sửa **generator** HOME_ALERT (Phase 80/82) để enrich khi sinh, KHÔNG sửa overlay FE và KHÔNG mass-update dữ liệu cũ.

---

## 7. Có ảnh hưởng AppSheet không?

**KHÔNG.** Không đổi schema, không đổi/đặt lại tên cột, không chạm Security Filter/slice AppSheet. AppSheet vẫn đọc `TASK_MAIN` như cũ; fix chỉ ở tầng DTO runtime (GAS task DB API) + FE webapp.

---

## 8. Rủi ro còn lại

1. **User không có cả tên lẫn email** → vẫn fallback raw `USR_xxx` (đúng acceptance: "không tìm được user → giữ USR_008"). Khắc phục triệt để = **bổ sung dữ liệu `USER_DIRECTORY.DISPLAY_NAME/FULL_NAME`** (report-only; KHÔNG auto-fix dữ liệu nhân sự trong phase này).
2. **Thay đổi GAS chưa deploy**: `taskDbUserDisplay.js` cần `clasp push` tới GAS runtime để live có hiệu lực. **Chưa push** (theo quy tắc: chỉ push khi operator yêu cầu). FE fix (build) đã sẵn sàng deploy.
3. **`/api/today` còn là local projection** ở Worker; khi bind thật vào TASK_MAIN cần đảm bảo trả `usersById`/owner enrich như snapshot (đã có guard FE hydrate qua `/api/users`).
4. Hiển thị EMAIL đầy đủ khi thiếu tên có thể hơi dài trên card (đã có truncation 14 ký tự ở meta ngắn); chấp nhận được vs raw code.

---

## 9. Acceptance (đối chiếu)

- [x] UI không còn `USR_008` nếu USER_DIRECTORY có DISPLAY_NAME/FULL_NAME (và nay cả EMAIL).
- [x] Raw `ownerId/reporterId` vẫn còn trong DTO/snapshot để debug/audit.
- [x] Không hard-code tên / không hard-code `USR_008`.
- [x] Không phá AppSheet; không đổi schema destructive.
- [x] Test fallback pass (no record → raw id; empty → "Chưa giao").
- [x] Build pass.
- [x] Report + handoff append-only.

---

## 10. Phase tiếp theo (nếu cần)
- `PHASE_TASK_USER_DIRECTORY_DATA_BACKFILL` — rà soát + điền `DISPLAY_NAME/FULL_NAME` còn rỗng trong `USER_DIRECTORY` (manual-first, có backup).
- `PHASE_TODAY_SUMMARY_REAL_DB_BIND` — bind `/api/today` vào TASK_MAIN runtime kèm enrich owner.
- Deploy GAS (`clasp push gas-runtime-api`) khi operator duyệt.
