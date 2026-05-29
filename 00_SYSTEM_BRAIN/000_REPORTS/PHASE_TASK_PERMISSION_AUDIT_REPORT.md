# PHASE_TASK_PERMISSION_AUDIT_REPORT

- **Phase**: `PHASE_TASK_PERMISSION_01_AUDIT_ONLY`
- **Date**: 2026-05-29
- **Mode**: AUDIT-ONLY (read-first, append-only, no DB/schema/runtime mutation)
- **Standard**: CBV OPERATIONAL ECOSYSTEM STANDARD V1
- **DB**: `DEV_FIN_CBV_SSA_LAOCONG_DB` (Google Sheets `1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE`)
- **Scope**: Quyền **được xem việc** (view permission) cho module TASK / WORKSPACE
- **Baseline rule reference**: `.cursor/rules/task-main-pro-production-baseline.mdc` (SHARED_WITH + IS_PRIVATE PRO baseline — KHÔNG hạ cấp)

> Báo cáo này **không sửa code, không sửa schema, không sửa AppSheet**. Chỉ đọc mã nguồn + tài liệu trong repo và mô tả hiện trạng + đề xuất an toàn theo từng level.

---

## 1. Executive Summary

**Kết luận ngắn: Hiện trạng quyền xem task CHƯA an toàn ở tầng WebApp/API; ở tầng AppSheet thì model an toàn đã được *thiết kế nhưng chưa xác nhận đã deploy*.**

| Câu hỏi | Trả lời |
|---|---|
| Hiện trạng quyền xem task có an toàn chưa? | **Chưa.** Đường WebApp → Cloudflare Worker → GAS `getTaskWorkspaceSnapshot` trả **toàn bộ TASK_MAIN** (mọi dòng non-deleted) cho mọi user, **không** gọi `canUserSeeTask`. |
| Có rủi ro user thấy task không thuộc mình không? | **Có (CRITICAL)** trên WebApp snapshot. `permissionAllowed` bị hard-code `true`. Bộ lọc client (`mine/pending/overdue`) chỉ là lọc UI, không phải kiểm soát quyền. |
| Có rủi ro AppSheet/WebApp đọc all task không? | **WebApp: Có** (snapshot đọc all). **AppSheet: Rủi ro tiềm tàng** — Security Filter PRO (IS_PRIVATE/SHARED_WITH) đã được viết trong tài liệu nhưng checklist deploy không liệt kê → có khả năng app live mới chỉ lọc theo slice `STATUS`/`IS_ACTIVE`, chưa lọc theo người. |

**Điểm cốt lõi:**
- Tài sản bảo mật đã có sẵn: hàm `canUserSeeTask()` (`45_SHARED_WITH_SERVICE.js`) + cột `IS_PRIVATE`, `SHARED_WITH`, `OWNER_ID`, `REPORTER_ID` trong `TASK_MAIN`. **Nhưng không được áp dụng ở các đường list/snapshot.**
- Model hiện tại chỉ có 3 mức nhìn: **ADMIN (all)** / **public (`IS_PRIVATE=false` → ai cũng thấy)** / **private (owner/reporter/shared)**. **Chưa có** scoping theo `DON_VI_ID` / `TEAM_ID`, chưa có `VIEW_SCOPE`, chưa có vai trò MANAGER xem theo đội, OPERATOR xem queue chung, AUDITOR xem theo phạm vi.
- `ROLE_PERMISSION_MATRIX` (sheet) **tồn tại nhưng runtime KHÔNG đọc**; runtime dùng ma trận hard-code trong `46_CBV_PERMISSION_RUNTIME.js`.
- Tồn tại **3 nguồn task trùng nghĩa**: `TASK_MAIN` (canonical), `TASKS` (sheet riêng của RF_12 worker), `HOME_ALERT` (queue/inbox). Đây là rủi ro nhất quán dữ liệu + bảo mật.

---

## 2. Current DB Schema Map

Nguồn sự thật: `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` (`CBV_SCHEMA_MANIFEST`) và `gas-runtime-api/taskDbSchemaMap.js`.

### 2.1 USER_DIRECTORY (đang giữ thông tin user — đúng)
Cột hiện có (theo manifest):
`ID, USER_CODE, FULL_NAME, DISPLAY_NAME, EMAIL, PHONE, ROLE, POSITION, STATUS, IS_SYSTEM, ALLOW_LOGIN, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, USER_ID, EMPLOYEE_CODE, DON_VI_ID, TEAM_ID, SUPERVISOR_ID, ROLE_CODE, USER_STATUS, WORKLOAD_LIMIT, ACTIVE_QUEUE_COUNT, LAST_ACTIVE_AT, LAST_LOGIN_AT, IS_OPERATOR, IS_SUPERVISOR, IS_ADMIN, IS_RUNTIME_OWNER, IS_APPSHEET_ADMIN, APPSHEET_USER_ROLE, DEFAULT_DASHBOARD, DEFAULT_QUEUE, CAN_ASSIGN, CAN_ESCALATE, CAN_RESOLVE, CAN_APPROVE`

| Cột mục tiêu (đề xuất A) | Hiện trạng |
|---|---|
| USER_ID | ✅ có (`ID` là PK; cũng có cột `USER_ID` phụ) |
| EMAIL | ✅ có |
| FULL_NAME | ✅ có (`FULL_NAME` + `DISPLAY_NAME`) |
| ROLE | ✅ có |
| ROLE_CODE | ✅ có |
| DON_VI_ID | ✅ có |
| TEAM_ID | ✅ có |
| MANAGER_USER_ID | ⚠️ **Tương đương** `SUPERVISOR_ID` (khác tên). Không có cột tên `MANAGER_USER_ID`. |
| VIEW_SCOPE | ❌ **THIẾU** |
| IS_ACTIVE | ⚠️ Không có cột `IS_ACTIVE`; dùng `STATUS`/`USER_STATUS` (`ACTIVE`) + `IS_DELETED`. |

Bổ sung: đã có sẵn flag năng lực `IS_OPERATOR / IS_SUPERVISOR / IS_ADMIN / CAN_ASSIGN / CAN_ESCALATE / CAN_RESOLVE / CAN_APPROVE` và `APPSHEET_USER_ROLE`, `DEFAULT_QUEUE` — dùng được cho phân quyền mà không cần thêm cột.

### 2.2 ROLE_PERMISSION_MATRIX
Cột hiện có:
`PERMISSION_ID, ROLE_CODE, ACTION_CODE, MODULE_CODE, RESOURCE_TYPE, CAN_VIEW, CAN_CREATE, CAN_EDIT, CAN_EXECUTE, CAN_APPROVE, CAN_ASSIGN, CAN_ESCALATE, CAN_RESOLVE, STATUS, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED`

| Cột mục tiêu (đề xuất B) | Hiện trạng |
|---|---|
| ROLE_CODE | ✅ có |
| MODULE_CODE | ✅ có |
| CAN_CREATE / CAN_APPROVE / CAN_ASSIGN | ✅ có |
| CAN_VIEW_ALL / CAN_VIEW_DON_VI / CAN_VIEW_TEAM / CAN_VIEW_ASSIGNED / CAN_VIEW_CREATED_BY / CAN_VIEW_WATCHER | ❌ **THIẾU** (chỉ có 1 cột `CAN_VIEW` boolean) |
| CAN_UPDATE | ⚠️ tương đương `CAN_EDIT` |
| CAN_DELETE | ❌ thiếu (có `CAN_RESOLVE`/`CAN_ESCALATE`) |
| IS_ACTIVE | ⚠️ dùng `STATUS` |

⚠️ **Quan trọng: sheet này hiện KHÔNG được runtime tiêu thụ.** Permission runtime (`46_CBV_PERMISSION_RUNTIME.js`) hard-code `CBV_PERMISSION_ROLE_MATRIX` trong code, không đọc từ sheet. RF_12 (`999Y_RF12_GAS_RUNTIME_PERMISSIONS.js`) cũng hard-code theo `actor.role`.

### 2.3 TEAM_DIRECTORY
`TEAM_ID, TEAM_CODE, TEAM_NAME, DON_VI_ID, SUPERVISOR_ID, TEAM_TYPE, DEFAULT_QUEUE, WORKLOAD_LIMIT, ESCALATION_TEAM, STATUS, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED`
→ Đủ để map team → đơn vị → supervisor. ✅

### 2.4 DON_VI
`ID, DON_VI_TYPE, CODE, NAME, ... PARENT_ID, MANAGER_USER_ID, ... DON_VI_ID, PARENT_DON_VI_ID, ... DEFAULT_SUPERVISOR_ID, ... OWNER_USER_ID, RUNTIME_OWNER_ID, DON_VI_STATUS, IS_ACTIVE`
→ Có `MANAGER_USER_ID`, `PARENT_DON_VI_ID` (hỗ trợ phân cấp đơn vị), `IS_ACTIVE`. ✅

### 2.5 TASK_MAIN (canonical task DB)
Cột hiện có (manifest):
`ID, TASK_CODE, TITLE, DESCRIPTION, TASK_TYPE_ID, STATUS, PRIORITY, DON_VI_ID, OWNER_ID, REPORTER_ID, SHARED_WITH, IS_PRIVATE, START_DATE, DUE_DATE, DONE_AT, PROGRESS_PERCENT, RESULT_SUMMARY, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_STARRED, IS_PINNED, IS_DELETED, PENDING_ACTION`

| Cột mục tiêu (đề xuất C) | Hiện trạng |
|---|---|
| OWNER_ID | ✅ có (đang đóng vai trò **người phụ trách/assignee** — xem `APPSHEET_USER_LAYER.md`: "không có ASSIGNEE_ID; OWNER_ID = assignee") |
| ASSIGNED_TO | ⚠️ **Không có cột riêng**; nghĩa "được giao" đang nằm trong `OWNER_ID` |
| DON_VI_ID | ✅ có |
| TEAM_ID | ❌ **THIẾU** |
| ASSIGNED_TEAM | ❌ **THIẾU** |
| WATCHERS | ⚠️ **Tương đương** `SHARED_WITH` (list ID comma-separated) |
| VISIBILITY | ⚠️ Không có enum `VISIBILITY`; dùng boolean `IS_PRIVATE` |
| IS_CONFIDENTIAL | ❌ **THIẾU** (chỉ có `IS_PRIVATE`) |
| CREATED_BY | ✅ có; `REPORTER_ID` đóng vai người báo/tạo nghiệp vụ |

### 2.6 HOME_ALERT (queue/assignment layer)
Sheet rất rộng (~150 cột). Các cột liên quan queue/assignment/việc bị kẹt:
`ALERT_ID, ALERT_CODE, STATUS, ASSIGNED_TO, ASSIGNED_TEAM, ASSIGNED_BY, CLAIMED_AT, CLAIMED_BY, ASSIGNMENT_STATUS, ASSIGNMENT_QUEUE, QUEUE_GROUP, QUEUE_LABEL, IS_STUCK, STUCK_REASON, IS_BLOCKED, BLOCKED_REASON, SLA_STATUS, SLA_BREACH_LEVEL, OPERATOR_*` …
→ Đây là layer hiển thị "việc của tôi / chưa ai nhận / bị kẹt" cho WebApp. **HOME_ALERT có `ASSIGNED_TO` và `ASSIGNED_TEAM` (TASK_MAIN thì không).**

### 2.7 Nhận định trùng nghĩa (TASKS vs TASK_MAIN vs HOME_ALERT)
- **`TASK_MAIN`**: bảng việc nghiệp vụ chuẩn (AppSheet + worker snapshot + GAS service).
- **`TASKS`** (`gas-runtime-api/Code.js` + `taskDbConfig.js` cũ / `999Y_RF12_GAS_RUNTIME_*`): bảng việc **riêng** với header khác (`task_id, assignee, due_date…`), dùng cho RF_12 worker legacy. **Trùng nghĩa với TASK_MAIN** → rủi ro 2 nguồn sự thật.
- **`HOME_ALERT`**: layer cảnh báo/queue, derive runtime; vừa dùng cho AppSheet vừa cho WebApp inbox.

→ **Rủi ro MEDIUM-HIGH**: phân quyền phải định nghĩa rõ áp dụng trên nguồn nào. Khuyến nghị chốt `TASK_MAIN` là canonical, coi `TASKS` là deprecated, `HOME_ALERT` chỉ là projection.

---

## 3. Current Runtime Flow

### 3.1 AppSheet đang đọc gì
- AppSheet đọc **trực tiếp** `TASK_MAIN` + slices (`TASK_OPEN`, `TASK_DONE`, và — theo tài liệu — `TASK_MY_OPEN`, `TASK_MY_TASKS`).
- Security Filter PRO (theo `04_APPSHEET/APPSHEET_SECURITY_FILTERS.md`):
  ```
  OR(
    USERROLE() = "ADMIN",
    NOT([IS_PRIVATE]),
    AND([IS_PRIVATE], OR(
      [OWNER_ID]    = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
      [REPORTER_ID] = ANY(SELECT(...)),
      CONTAINS([SHARED_WITH], ANY(SELECT(...)))
    ))
  )
  ```
- **Trạng thái: tài liệu hoá (target), CHƯA xác nhận đã áp dụng trên app live.** `APPSHEET_MANUAL_CONFIG_CHECKLIST.md` / `APPSHEET_DEPLOY_CHECKLIST_MASTER.md` chỉ liệt kê `TASK_OPEN`/`TASK_DONE`, không có bước set Security Filter + `IS_PRIVATE`/`SHARED_WITH`.
- Model AppSheet **không** scope theo `DON_VI_ID`/`TEAM_ID`; chỉ public/private + owner/reporter/shared.
- HOME_ALERT trong AppSheet: chỉ có slice `[IS_ACTIVE]=TRUE` và các view-condition theo `ASSIGNMENT_QUEUE`; **không có row Security Filter theo `ASSIGNED_TO`/team**.

### 3.2 WebApp (React `apps/workboard`) đang đọc gì
- React → `fetch` Cloudflare Worker (`VITE_CBV_API_BASE_URL`), **không gọi GAS trực tiếp**.
- Trang Tasks gọi `GET /api/tasks/workspace-snapshot` → Worker → GAS action `getTaskWorkspaceSnapshot`.
- Có login (khi Worker bật): `POST /api/auth/login` → session localStorage (`token, userId, displayName, role`); request gắn `Authorization: Bearer` hoặc header `x-cbv-role`.
- **Bộ lọc client** (`taskFilterRuntime.ts`): `mine/pending/overdue/approval` + queue/rhythm — **chỉ là lọc hiển thị, không phải kiểm soát quyền**. `TaskItem.permissionAllowed` không được dùng để ẩn task.
- FE **không** mô hình hoá `IS_PRIVATE / SHARED_WITH / IS_CONFIDENTIAL / WATCHERS`; chỉ có `ownerId/reporterId/isMine/permissionAllowed`.
- Chế độ mock (`VITE_CBV_API_BASE_URL` rỗng): `mockApi` trả **toàn bộ** task demo cho mọi user.

### 3.3 API đang đọc gì (GAS)
- `gas-runtime-api/taskDbService.js` → `taskDbReadMainSummaries_()` đọc **mọi dòng `TASK_MAIN` non-deleted**, map summary, **không lọc theo user**.
- `taskDbApplyFilters_()` chỉ lọc theo `status/assignee/priority/q` được truyền tường minh — **không có `canUserSeeTask`**.
- `getTaskWorkspaceSnapshot` trả snapshot all-rows. → **CRITICAL: API trả all task cho non-admin.**
- Đường GAS RF_02 cũ (`999I_RF02_WORKBOARD_CORE_RUNTIME.js`): `CbvRf02TaskList_getModel_` lấy inbox từ HOME_ALERT (`CbvStaffWorkspace_getTaskInboxModel_(email)`), có gate role-level `CBV_Permission_assertCan(TASK_LIST)` nhưng **không** kiểm soát từng dòng; `permissionAllowed` là role-level.
- `canUserSeeTask()` (`45_SHARED_WITH_SERVICE.js`) **có** và được nối vào `CBV_Permission_can()` cho `TASK_VIEW`/`TASK_DETAIL` **chỉ khi** truyền `resource.taskRow` — nhưng các đường list/snapshot **không truyền taskRow**.

### 3.4 HOME_ALERT derive từ TASK_MAIN thế nào
- HOME_ALERT là bảng cảnh báo được sinh/đồng bộ bởi runtime (`80_HOME_ALERT_RUNTIME.js`, Phase 80–82) từ các nguồn nghiệp vụ (gồm task quá hạn/bị kẹt). Inbox WebApp đọc qua `CbvWebAppPilotData_getQueueCards(email)`:
  - Lọc: bỏ card đã resolved; **`if (assigned && email && assigned !== email) continue;`** → card có `ASSIGNED_TO` khác email bị ẩn, **nhưng card `ASSIGNED_TO` trống thì hiện cho tất cả**.
  - ⚠️ `ASSIGNED_TO` so sánh với **email**, trong khi assignment có thể lưu **ID/label** → rủi ro so khớp sai (ẩn nhầm hoặc lộ nhầm).

### 3.5 Event queue liên quan TASK_MAIN
- `CBV_EVENT_QUEUE` / `CBV_EVENT_LOG` / `API_AUDIT_LOG` / `CBV_AUDIT_LOG`: hạ tầng audit/event có sẵn. RF_12 `createTask_/updateTask_` đã ghi `appendAuditLog_` + `appendTimeline_` (append-only). Tuy nhiên **không có audit riêng cho hành vi "xem" task** và không log kết quả permission-check.

---

## 4. Permission Gap Analysis

| # | Mức | Vấn đề | Bằng chứng |
|---|---|---|---|
| G1 | 🔴 CRITICAL | API `getTaskWorkspaceSnapshot` trả **all TASK_MAIN** cho mọi user; không gọi `canUserSeeTask`. WebApp hiển thị tất cả. | `gas-runtime-api/taskDbService.js` `taskDbReadMainSummaries_` + `taskDbApplyFilters_` |
| G2 | 🔴 CRITICAL | `permissionAllowed` hard-code `true` ở mapper; FE không dùng để ẩn task. | `999Y_RF12_GAS_RUNTIME_TASKS.js:17`, `apps/workboard` contracts |
| G3 | 🟠 HIGH | AppSheet Security Filter PRO (IS_PRIVATE/SHARED_WITH) **chưa xác nhận deploy**; checklist deploy bỏ sót → app live có thể đang show all. | `APPSHEET_MANUAL_CONFIG_CHECKLIST.md`, `APPSHEET_DEPLOY_CHECKLIST_MASTER.md` |
| G4 | 🟠 HIGH | **Thiếu VIEW_SCOPE** và scoping `DON_VI_ID`/`TEAM_ID`. Không có MANAGER xem theo đội/đơn vị, OPERATOR xem queue/team, AUDITOR theo phạm vi. Model chỉ ADMIN/public/private. | `46_CBV_PERMISSION_RUNTIME.js`, `45_SHARED_WITH_SERVICE.js` |
| G5 | 🟠 HIGH | `ROLE_PERMISSION_MATRIX` (sheet) **không được runtime đọc**; quyền hard-code trong code → không cấu hình được, dễ lệch giữa AppSheet/WebApp. | `46_CBV_PERMISSION_RUNTIME.js`, `999Y_..._PERMISSIONS.js` |
| G6 | 🟠 HIGH | **3 nguồn task trùng nghĩa** (`TASK_MAIN` / `TASKS` / `HOME_ALERT`) → phân quyền không thống nhất; `TASKS` sheet không có IS_PRIVATE/SHARED_WITH. | `taskDbConfig.js` / `RF12_CONFIG.SHEETS.TASKS` vs `CBV_SCHEMA_MANIFEST.TASK_MAIN` |
| G7 | 🟡 MEDIUM | `HOME_ALERT` inbox so khớp `ASSIGNED_TO` với **email** (có thể lưu ID/label) → ẩn/lộ sai; card chưa giao hiện cho tất cả. | `97_WEBAPP_WORKSPACE_PILOT_DATA.js:114`, `93_WEBAPP_WORKSPACE_API.js:115` |
| G8 | 🟡 MEDIUM | Hard-code `ADMIN_EMAILS` trong code (2 email). Quyền admin phụ thuộc whitelist tĩnh thay vì `IS_ADMIN`/matrix. | `00_CORE_CONFIG.js:5` |
| G9 | 🟡 MEDIUM | **Không có audit log cho hành vi "xem"** task và không log permission-check result. | toàn bộ list path |
| G10 | 🟡 MEDIUM | `TASK_MAIN` thiếu `TEAM_ID`/`ASSIGNED_TEAM` → không thể lọc "việc của đội" tại nguồn (chỉ HOME_ALERT có). | `CBV_SCHEMA_MANIFEST.TASK_MAIN` |
| G11 | 🟢 LOW | Roles runtime (`ADMIN/MANAGER/STAFF/FINANCE/HO_SO/VIEW_ONLY`) khác bộ role mục tiêu (`admin/manager/operator/user/viewer/auditor`); cần bảng map. Đã có `CBV_PERMISSION_LEGACY_ROLE_MAP` (OPERATOR→STAFF, VIEWER→VIEW_ONLY) nhưng thiếu `USER`/`AUDITOR`. | `46_CBV_PERMISSION_RUNTIME.js:14-19` |
| G12 | 🟢 LOW | Chưa tách rõ "quyền xem" và "quyền thao tác" theo scope (mutate đã check role nhưng không check scope đơn vị/đội). | `999Y_..._PERMISSIONS.js` `rf12CanUpdateTask_` |

**Điểm tốt đã có (không phải gap):** `canUserSeeTask()` đã tồn tại; cột visibility đã có; `FEATURE_FLAG` sheet đã có; hạ tầng audit/append-only đã có; mutation RF_12 đã check role + ghi audit.

---

## 5. Safe Update Proposal (theo Level, ưu tiên ít thay đổi nhất)

### Level 0 — Audit only ✅ (đang ở đây)
- Không thay DB, không thay code, không thay AppSheet. Chỉ báo cáo này + handoff + ADR.

### Level 1 — Additive schema only (append-only, KHÔNG đổi logic)
Chỉ **thêm cột ở cuối bảng**, không đổi tên, không xoá, không backfill tự động:
- `USER_DIRECTORY`: thêm `VIEW_SCOPE` (enum: `ALL|DON_VI|TEAM|ASSIGNED|SELF|NONE`). *(MANAGER_USER_ID, IS_ACTIVE đã có tương đương — KHÔNG thêm trùng.)*
- `ROLE_PERMISSION_MATRIX`: thêm `CAN_VIEW_ALL, CAN_VIEW_DON_VI, CAN_VIEW_TEAM, CAN_VIEW_ASSIGNED, CAN_VIEW_CREATED_BY, CAN_VIEW_WATCHER` (+ tuỳ chọn `CAN_DELETE`).
- `TASK_MAIN`: thêm `TEAM_ID`, `ASSIGNED_TEAM`, `IS_CONFIDENTIAL` (tuỳ chọn `ASSIGNED_TO` nếu muốn tách khỏi `OWNER_ID`; `VISIBILITY` nếu muốn nâng từ boolean `IS_PRIVATE`).
- Cập nhật `90_BOOTSTRAP_SCHEMA.js` + `90_BOOTSTRAP_AUDIT_SCHEMA.js` (`optionalColumns`) theo baseline rule.
- **KHÔNG bật bất kỳ logic mới nào dùng các cột này.** Giá trị mặc định trống → hành vi cũ giữ nguyên.

### Level 2 — Read-only permission preview
- Thêm hàm `CbvTaskPermission_canViewTask_(user, task, policy)` (theo spec mục cuối) — chỉ tính toán, **không chặn**.
- Thêm test console (`PHASE_TASK_PERMISSION_04_TEST_CONSOLE`) chạy matrix user×task in ra kết quả.
- Log kết quả lọc (append vào `CBV_AUDIT_LOG`/`API_AUDIT_LOG`) **nhưng runtime cũ vẫn trả như cũ**.

### Level 3 — Shadow mode
- Runtime cũ vẫn chạy (trả all như hiện tại).
- Engine quyền chạy song song: tính `permissionFilteredResult`.
- So sánh `oldResult` vs `permissionFilteredResult`, ghi report chênh lệch (số dòng bị ẩn, theo role/scope). **Chưa ẩn thật.**

### Level 4 — Controlled enable
- Bật qua `FEATURE_FLAG` (sheet đã có).
- Bật **WebApp trước** (Worker/GAS snapshot lọc bằng `canViewTask`), AppSheet **giữ luồng cũ** đến khi Security Filter được verify bằng tài khoản thật.
- Strict mode tách riêng, mặc định off.

---

## 6. Proposed Feature Flags

Ghi vào sheet `FEATURE_FLAG` (đã tồn tại; cột `FEATURE_CODE, ENABLED, ROLLOUT_SCOPE, …`) — **mặc định an toàn**:

| FEATURE_CODE | ENABLED (default) | Ý nghĩa |
|---|---|---|
| `TASK_PERMISSION_ENGINE_ENABLED` | `false` | Bật engine lọc quyền ở runtime |
| `TASK_PERMISSION_SHADOW_MODE` | `true` | Tính song song + log chênh lệch, chưa chặn |
| `TASK_PERMISSION_APPSHEET_FILTER_READY` | `false` | Đánh dấu Security Filter AppSheet đã verify |
| `TASK_PERMISSION_STRICT_MODE` | `false` | Chặn cứng (ẩn task ngoài scope) |
| `TASK_PERMISSION_AUDIT_LOG_ENABLED` | `true` | Ghi audit cho permission-check/xem task |

> Trước khi engine có `FEATURE_FLAG` reader cho TASK, flag có thể đặt tạm bằng Script Property; không tự bật trong production.

---

## 7. AppSheet Update Proposal (KHÔNG tự áp dụng)

Giữ nguyên Security Filter PRO đã có trong tài liệu (dùng `ANY(SELECT(...))`, `CONTAINS([SHARED_WITH], ...)`, `IS_PRIVATE`). Nếu muốn mở rộng scope đơn vị/đội (sau khi append `TEAM_ID`), gợi ý dạng:

```
OR(
  USERROLE() = "ADMIN",
  NOT([IS_PRIVATE]),
  [OWNER_ID]    = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
  [REPORTER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
  CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))),
  [DON_VI_ID] = ANY(SELECT(USER_DIRECTORY[DON_VI_ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))
)
```

**Cảnh báo bắt buộc:**
- `USERROLE()` (AppSheet Account list) **khác** `ROLE`/`ROLE_CODE` trong `USER_DIRECTORY`. Phải kiểm bằng tài khoản thật.
- Filter ví dụ trong prompt dùng `[ASSIGNED_TEAM] = LOOKUP(USEREMAIL(),"USER_DIRECTORY","EMAIL","TEAM_ID")` — chỉ dùng được **sau khi** `TASK_MAIN.ASSIGNED_TEAM`/`TEAM_ID` được append và có dữ liệu đúng; `LOOKUP` theo EMAIL phải khớp đúng casing.
- **Không bật Security Filter** nếu chưa chắc `OWNER_ID/REPORTER_ID/SHARED_WITH` đã chứa **USER_DIRECTORY.ID** (tài liệu ghi app live có thể vẫn là text/email — risk show/hide nhầm).
- `IS_CONFIDENTIAL` (nếu append) nên là điều kiện ẩn mạnh hơn `IS_PRIVATE` cho VIEWER/AUDITOR.

---

## 8. Test Plan

### Test matrix (User × Task)
Thực thi ở **Level 2/3** (preview/shadow), KHÔNG chặn production.

**User cases:**
| Role | Kỳ vọng |
|---|---|
| ADMIN | thấy tất cả |
| MANAGER | thấy task thuộc `DON_VI_ID`/`TEAM_ID` của mình + tạo/phụ trách/được giao |
| OPERATOR | thấy được giao + `ASSIGNED_TEAM`/`TEAM_ID` + queue chung (nếu matrix cho) + watcher |
| USER | chỉ thấy việc mình tạo / phụ trách / được giao |
| VIEWER/AUDITOR | chỉ task không private/confidential, theo scope cấp; không mutate |
| INACTIVE (`STATUS≠ACTIVE`/`IS_DELETED`) | không thấy gì |

**Task cases:** có `OWNER_ID`(assignee); có `ASSIGNED_TEAM`; chưa giao; `IS_PRIVATE=true`; `IS_CONFIDENTIAL=true`; `IS_DELETED=true`; quá hạn (HOME_ALERT); trong queue; do user tạo (`REPORTER_ID`/`CREATED_BY`).

### Assertion mẫu
- ADMIN: `count == total non-deleted`.
- USER A: mọi task trả về phải thoả `OWNER_ID==A || REPORTER_ID==A || CREATED_BY==A || A∈SHARED_WITH`.
- Shadow diff: in ra số dòng `oldResult - filtered` theo từng role; CRITICAL nếu USER thấy task ngoài scope ở `oldResult`.

### Lệnh
- WebApp/Worker: `npm test`, `npm run build` (xem mục CHẠY KIỂM TRA).
- GAS: chạy test console mới (Level 2) thủ công trong Apps Script — chưa có script CLI cho GAS.

---

## 9. Rollback Plan

- **Tắt FEATURE_FLAG** → engine off, runtime cũ trả như trước.
- **Không xoá** cột đã append (append-only an toàn; giá trị trống = no-op).
- **Không đổi** AppSheet Security Filter nếu chưa deploy; nếu đã set, gỡ filter trong AppSheet Editor (không động dữ liệu).
- **Revert commit** code nếu có thay đổi runtime (chỉ ở Level ≥2).
- **Restore route cũ**: snapshot path không đổi ở Level 0–3, nên không cần restore.
- Không có backfill → không cần restore dữ liệu.

---

## 10. Implementation Plan (các phase sau, nếu được duyệt)

1. `PHASE_TASK_PERMISSION_01_AUDIT_ONLY` — báo cáo này (DONE).
2. `PHASE_TASK_PERMISSION_02_SCHEMA_APPEND_PLAN` — kế hoạch append cột (VIEW_SCOPE, CAN_VIEW_* , TEAM_ID/ASSIGNED_TEAM/IS_CONFIDENTIAL) + cập nhật schema manifest/audit; **chưa chạy**.
3. `PHASE_TASK_PERMISSION_03_PERMISSION_ENGINE_SHADOW` — `CbvTaskPermission_canViewTask_` + đọc `ROLE_PERMISSION_MATRIX` + shadow diff log.
4. `PHASE_TASK_PERMISSION_04_TEST_CONSOLE` — test console matrix user×task + assertions.
5. `PHASE_TASK_PERMISSION_05_CONTROLLED_WEBAPP_ENABLE` — bật lọc cho snapshot qua FEATURE_FLAG (WebApp trước).
6. `PHASE_TASK_PERMISSION_06_APPSHEET_FILTER_ENABLE` — verify + bật Security Filter AppSheet bằng tài khoản thật.

---

## 11. Files Changed

### Đã đọc (audit)
- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`
- `05_GAS_RUNTIME/46_CBV_PERMISSION_RUNTIME.js`
- `05_GAS_RUNTIME/45_SHARED_WITH_SERVICE.js`
- `05_GAS_RUNTIME/20_TASK_REPOSITORY.js`
- `05_GAS_RUNTIME/93_WEBAPP_WORKSPACE_API.js`
- `05_GAS_RUNTIME/999I_RF02_WORKBOARD_CORE_RUNTIME.js`
- `05_GAS_RUNTIME/999Y_RF12_GAS_RUNTIME_TASKS.js`
- `05_GAS_RUNTIME/999Y_RF12_GAS_RUNTIME_PERMISSIONS.js`
- `05_GAS_RUNTIME/999Y_RF12_GAS_RUNTIME_CONFIG.js`
- `05_GAS_RUNTIME/998Q_WEBAPP_STAFF_OPERATION_WORKSPACE.js`
- `05_GAS_RUNTIME/97_WEBAPP_WORKSPACE_PILOT_DATA.js`
- `05_GAS_RUNTIME/00_CORE_CONFIG.js`
- `gas-runtime-api/taskDbService.js`, `taskDbSchemaMap.js`, `Tasks.js`, `Code.js`
- `apps/workboard/src/api/{client,contracts,mockApi}.ts`, `auth/sessionStorage.ts`, `app/App.tsx`, `shared/utils/taskFilterRuntime.ts` (qua subagent)
- `04_APPSHEET/APPSHEET_SECURITY_FILTERS.md`, `APPSHEET_SLICE_MAP.md`, `TASK_SLICE_SECURITY_MAP.md`, `APPSHEET_USER_LAYER.md`, `TASK_MAIN_PRO_SPEC.md`, `APPSHEET_MANUAL_CONFIG_CHECKLIST.md`, … (qua subagent)

### Đã tạo (append-only, audit deliverables)
- `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_PERMISSION_AUDIT_REPORT.md` (file này)
- `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_TASK_PERMISSION_AUDIT_AI_HANDOFF.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_PERMISSION_MODEL.md`

### Đã sửa (runtime/schema/AppSheet)
- **KHÔNG.** Audit-only — không sửa code, schema, hay AppSheet.

---

## 12. Final Recommendation

- **Có nên cập nhật ngay không?** Không bật phân quyền cứng ngay. Nhưng **G1/G2 là CRITICAL** — nên ưu tiên Level 2→3 (preview + shadow) sớm để định lượng mức rò rỉ thực tế trước khi bật.
- **Cập nhật phần nào trước?**
  1. Xác minh **AppSheet Security Filter** đã deploy chưa (tài khoản thật) — đây là rủi ro production hiện hữu nhất, sửa được mà không đụng code/schema.
  2. Append schema Level 1 (VIEW_SCOPE, CAN_VIEW_*, TEAM_ID/ASSIGNED_TEAM/IS_CONFIDENTIAL) — append-only, no-op.
  3. Engine shadow (Level 3) cho WebApp snapshot.
- **Phần nào CHƯA động vào?** AppSheet production filter (chỉ verify), strict mode, backfill dữ liệu nhân sự, đổi tên cột, hợp nhất `TASKS`↔`TASK_MAIN`.
- **Rủi ro còn lại:**
  1. WebApp snapshot vẫn trả all đến khi Level 5.
  2. AppSheet có thể đang hiển thị all nếu filter chưa deploy.
  3. `ROLE_PERMISSION_MATRIX` chưa được dùng → quyền lệch giữa 2 kênh.
  4. `TASKS` vs `TASK_MAIN` trùng nghĩa chưa giải quyết.
  5. `ASSIGNED_TO` so khớp email/ID không nhất quán ở HOME_ALERT inbox.

---

## Phụ lục — Hàm tham chiếu đề xuất (chưa implement)

```javascript
function CbvTaskPermission_canViewTask_(user, task, policy) {
  if (!user || !task) return false;
  if (String(user.IS_ACTIVE).toUpperCase() === 'FALSE') return false;          // map: STATUS!=ACTIVE || IS_DELETED
  if (task.IS_DELETED === true || String(task.IS_DELETED).toUpperCase() === 'TRUE') {
    if (String(user.ROLE_CODE || user.ROLE).toUpperCase() !== 'ADMIN') return false;
  }
  var role = String(user.ROLE_CODE || user.ROLE || '').toUpperCase();
  var viewScope = String(user.VIEW_SCOPE || '').toUpperCase();
  if (role === 'ADMIN' || viewScope === 'ALL') return true;

  if (role === 'MANAGER') {
    return task.DON_VI_ID === user.DON_VI_ID
      || task.TEAM_ID === user.TEAM_ID
      || task.CREATED_BY === user.USER_ID
      || task.OWNER_ID === user.USER_ID            // OWNER_ID đang đóng vai assignee
      || task.REPORTER_ID === user.USER_ID;
  }
  if (role === 'OPERATOR' || role === 'STAFF') {
    return task.OWNER_ID === user.USER_ID
      || task.ASSIGNED_TEAM === user.TEAM_ID
      || task.TEAM_ID === user.TEAM_ID
      || _containsId(task.SHARED_WITH, user.USER_ID);
  }
  if (role === 'USER') {
    return task.CREATED_BY === user.USER_ID
      || task.REPORTER_ID === user.USER_ID
      || task.OWNER_ID === user.USER_ID;
  }
  if (role === 'VIEWER' || role === 'AUDITOR' || role === 'VIEW_ONLY') {
    return String(task.IS_PRIVATE).toUpperCase() !== 'TRUE'
      && String(task.IS_CONFIDENTIAL || '').toUpperCase() !== 'TRUE';
  }
  return false;
}
```
> Lưu ý map thực tế: `ASSIGNED_TO`→`OWNER_ID`, `WATCHERS`→`SHARED_WITH`, `VISIBILITY`→`IS_PRIVATE`, `IS_ACTIVE`→`STATUS=ACTIVE`. `TEAM_ID/ASSIGNED_TEAM/IS_CONFIDENTIAL/VIEW_SCOPE` cần append (Level 1) trước khi nhánh tương ứng có hiệu lực.
