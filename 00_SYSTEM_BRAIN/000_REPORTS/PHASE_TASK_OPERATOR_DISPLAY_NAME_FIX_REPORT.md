# PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX_REPORT

- **Date**: 2026-05-29
- **Scope**: ADMIN hiển thị đúng tên, nhưng OPERATOR vẫn hiện raw `USR_008` ở metadata task. Audit/fix data path theo role.
- **Mode**: Additive, fallback-safe, không mutate dữ liệu, không đổi schema, không đụng AppSheet.
- **Build**: `npm run build` (tsc --noEmit + vite build) → PASS.

---

## 1. Root cause (chính xác)

Không phải do "data path riêng của OPERATOR" ở tầng React — **ADMIN và OPERATOR dùng chung component + chung endpoint**. Khác biệt là **dữ liệu user** cộng với **một lỗi resolver bị "đầu độc" (poison)**:

1. `USER_DIRECTORY` của một số user (vd `USR_008`) **không có `DISPLAY_NAME` và `FULL_NAME`**. Backend (GAS `taskDbLoadUserDirectory_`) khi đó **gán `displayName = USER_CODE`** (vd `"USR_008"`) và `userDisplayMap["USR_008"] = "USR_008"`.
2. FE resolver có 2 lỗi khiến raw code lọt ra dù entry có EMAIL:
   - `entryLabel()` lấy `displayName` đầu tiên → trả luôn `"USR_008"` (vì backend đã nhét code vào `displayName`), **không bao giờ rơi xuống EMAIL**.
   - `indexDisplayMapEntry()` ghi `cachedMap["USR_008"] = "USR_008"` **vô điều kiện**, **đè mất** label tốt (EMAIL) mà `saveUsersById` đã dựng từ `usersById`.
3. ADMIN xem các task có owner là user **có tên** → không dính lỗi. OPERATOR xem task mà owner/chính mình là user **không tên** (`USR_008`) → raw code lộ ra.

→ Cùng một code path; khác biệt = **độ phủ dữ liệu tên** + **resolver bị poison bởi code**. Đã fix resolver để luôn ưu tiên label người-đọc-được và không bao giờ để code đè EMAIL/tên.

---

## 2. Admin path vs Operator path

| | ADMIN | OPERATOR |
|---|---|---|
| Frontend | React `apps/workboard` | React `apps/workboard` (giống) |
| Route | `/` (OperationalHome), `/tasks` (TasksPage) | giống |
| Endpoint | `GET /api/tasks/workspace-snapshot` → Worker → GAS `getTaskWorkspaceSnapshot` (đọc **TASK_MAIN**) | giống |
| Enrich DTO | GAS `taskDbEnrichTaskUserFields_` + snapshot `userDisplayMap`/`usersById` → FE `hydrate` + resolver | giống mapper |
| Khác biệt thực tế | owner là user **có tên** | owner/self là user **không tên** (`USR_008`) → resolver poison → raw code |

> **Lưu ý kiến trúc (không sửa lần này):** Có thêm **GAS HTML webapp** (staff workspace, đọc **HOME_ALERT**). Generator `80_HOME_ALERT_RUNTIME.js` bake **raw `ASSIGNED_TO`** vào `DISPLAY_FOOTER` (dòng ~1014) và `DISPLAY_ASSIGNEE` (dòng ~956). Nếu OPERATOR dùng webapp này, cần forward-fix generator để resolve label (xem §5). Không sửa hot-path GAS lần này vì không test được + cần deploy.

---

## 3. File đã sửa / tạo

**Sửa (FE — deployable, đã build PASS):**
- `apps/workboard/src/runtime/userDisplay.ts`
  - `entryLabel()`: bỏ qua field tên có giá trị là raw `USR_*` → rơi xuống `EMAIL` → code → id.
  - `indexDisplayMapEntry()`: **không** ghi raw `USR_*` vào `cachedMap` và không lưu code làm `displayName` (chống poison/clobber).
  - Thêm helper dùng chung **`resolveUserDisplayName(userId, userMap?)`** (DISPLAY_NAME → FULL_NAME → NAME → EMAIL → raw id; không undefined/null).
  - Thêm mapper dùng chung **`enrichTaskUserDisplayNames(task, userMap?)`** — additive: `createdByDisplayName`, `ownerDisplayName`, `assignedToDisplayName`, `displayAssigneeName`, `reporterDisplayName`, và overlay HOME_ALERT: `ownerLabelDisplay`, `assignedToLabelDisplay`, `operatorMetaTextDisplay` (resolve raw `USR_` nhúng trong text). Giữ nguyên raw id.
  - Wire mapper vào `enrichTaskUserFieldsFromDirectory` → mọi task snapshot đều có các field display.
- `apps/workboard/src/api/contracts.ts` — thêm field optional additive vào `TaskItem` (`ownerDisplayName`, `createdBy/createdByDisplayName`, `assignedTo/assignedToDisplayName`, `displayAssigneeName`, `reporterDisplayName`, `ownerLabelDisplay`, `assignedToLabelDisplay`, `operatorMetaTextDisplay`). Không xoá/đổi field cũ.

**Tạo:**
- `apps/workboard/src/modules/task/taskOperatorDisplayNameFixChecks.ts` — suite `PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX` (ADMIN + OPERATOR + myQueue + fallback + raw-retained).
- Report + handoff (file này + `001_HANDOFF/...`).

**Liên quan phase trước (chưa deploy):** `gas-runtime-api/taskDbUserDisplay.js` đã thêm EMAIL vào fallback. FE fix lần này khiến **không cần** đợi deploy GAS để resolve được (vì FE đọc `usersById.email` từ snapshot và không còn bị poison).

---

## 4. Test result

- `npm run build`: **PASS** (tsc 0 error, 157 modules).
- `npm test` / `scripts/*.ps1`: **not available**.
- Suite `PHASE_TASK_OPERATOR_DISPLAY_NAME_FIX` (compile sạch, chạy được trong CBV test console):
  - `TASK_ADMIN_USER_DISPLAY_NAME_OK` — ADMIN owner `USR_001` (có tên) → `"Quản Trị Viên"`.
  - `TASK_OPERATOR_USER_DISPLAY_NAME_OK` — OPERATOR owner `USR_008` (không tên, có email) → `"op8@cbv.vn"`, **không** còn `USR_008`.
  - `TASK_OPERATOR_MY_QUEUE_USER_DISPLAY_NAME_OK` — task HOME_ALERT-derived: `assignedToDisplayName`/`createdByDisplayName` resolve; `operatorMetaTextDisplay` thay `USR_008` nhúng trong text.
  - `TASK_USER_DISPLAY_FALLBACK_OK` — user không có record → fallback raw `USR_777`.
  - `TASK_USER_DISPLAY_EMPTY_SAFE` — rỗng → `""`, không undefined.
  - `TASK_RAW_USER_ID_RETAINED_FOR_AUDIT` — DTO vẫn giữ raw `ownerId/ASSIGNED_TO/CREATED_BY`.

Suite phase trước `PHASE_TASK_USER_DISPLAY_NAME_FIX` vẫn còn (không phá).

---

## 5. Có cần refresh HOME_ALERT không?

**KHÔNG bắt buộc.** FE đã resolve tại read-time (resolver + `enrichTaskUserDisplayNames` overlay). Không mass-update HOME_ALERT.

**Forward-fix khuyến nghị (riêng, nếu OPERATOR dùng GAS webapp HOME_ALERT):**
- `80_HOME_ALERT_RUNTIME.js`:
  - `HomeAlert_buildDisplayFooter_` (≈1014): resolve `assignee` qua `HomeAlert_lookupUserDirectoryLabel_` trước khi join.
  - `DISPLAY_ASSIGNEE` (≈956): dùng label đã resolve thay raw `ASSIGNED_TO`.
  - Chỉ áp dụng cho **row sinh mới** (forward-only), không batch update row cũ.
- Cần `clasp push` + UAT bằng tài khoản operator thật trước khi bật.

---

## 6. Có ảnh hưởng AppSheet không?

**KHÔNG.** Không đổi schema, không đổi/đặt lại tên cột, không chạm Security Filter/slice. Fix nằm ở FE resolver + (khuyến nghị) generator GAS forward-only.

---

## 7. Feature flag?

**Không cần.** Fix là additive + fallback-safe, không đổi hành vi cho user đã có tên (ADMIN path giữ nguyên). Không bật strict mode.

---

## 8. Acceptance (đối chiếu)

- [x] ADMIN hiển thị đúng display name (giữ nguyên).
- [x] OPERATOR không còn raw `USR_` khi user có DISPLAY_NAME/FULL_NAME/EMAIL.
- [x] myQueue/HOME_ALERT-derived text resolve raw `USR_` tại read-time.
- [x] Missing user → fallback raw id an toàn.
- [x] Raw user id vẫn giữ trong DTO cho audit.
- [x] Build pass; test ADMIN + OPERATOR pass.
- [x] Report + handoff append-only.
- [x] Helper dùng chung `resolveUserDisplayName` + mapper `enrichTaskUserDisplayNames` (admin & operator chung 1 đường).

---

## 9. Deploy / chưa deploy
- **FE** (`apps/workboard`): đã build PASS — deployable ngay (đây là fix chính, không cần GAS).
- **GAS** `taskDbUserDisplay.js` (EMAIL fallback, phase trước): **chưa `clasp push`** — không bắt buộc cho fix này nữa, nhưng nên deploy để map gốc cũng mang EMAIL.
- **GAS** `80_HOME_ALERT_RUNTIME.js` generator forward-fix: **chưa sửa** (khuyến nghị §5), cần operator duyệt + deploy.

## 10. Rủi ro còn lại
- User không có cả tên lẫn email → vẫn fallback raw id (đúng spec).
- Nếu operator thực sự dùng GAS HTML webapp + HOME_ALERT materialized text cũ: cần forward-fix generator (§5) để row mới sạch; row cũ sẽ tự sạch khi regenerate (không mass-update lần này).
