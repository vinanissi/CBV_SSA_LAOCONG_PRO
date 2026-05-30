# PHASE UI — Runtime Trace Audit Report

**Date:** 2026-05-30  
**Phase:** `PHASE_UI_RUNTIME_TRACE_AUDIT`  
**Mode:** AUDIT-ONLY — no UI/code changes  
**Standard:** CBV Operational Ecosystem Standard V1  
**Prior:** `PHASE_UI_DB_DESIGN_AUDIT_REPORT.md`, `PHASE_UI_DB_DESIGN_AUDIT_HANDOFF.md`  
**FE root:** `apps/workboard/` (note: `src/features/tasks/` and `src/features/work-inbox/` **NOT FOUND** — actual code under `src/modules/task/` and `src/modules/task/inbox/`)

---

## Executive Summary

Trace audit lần theo chuỗi **Button → React → API → Worker → GAS → Sheet → append log → UI feedback** cho toàn bộ CTA operator.

| Metric | Count |
|--------|-------|
| CTA audited | 42 |
| **WIRED** (end-to-end khi Worker+GS_01 bật) | 8 |
| **PARTIAL** | 14 |
| **STUB** | 12 |
| **BROKEN** | 4 |
| **UNKNOWN** (env-dependent / mock-only) | 4 |

**Focus Mode V3 đứt ở:** React handler — nút `Hoàn thành` / `Chuyển tiếp` / `Tạm dừng` **disabled** (`WorkInboxFocusModeV3.tsx`); Focus Runtime path gọi `showFocusRuntimeFeedback()` thay vì API khi `onPause`/`onForward` không được truyền từ `WorkInboxGroupsPanel`.

**Route 404:** `OperatorMainSidebar` → `/observe`, `/config` (không có trong `routes.tsx`).

**Source of truth (production target):** `TASK_MAIN` + `TASK_UPDATE_LOG` qua TASK_GS_01 — xem draft `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`.

**AppSheet:** Dấu vết trong repo (env, module registry, docs) — **không** là read path chính của workboard inbox; operator mở AppSheet qua tab mới/iframe.

---

## Trace Legend

| Status | Meaning |
|--------|---------|
| WIRED | UI → API → GAS → sheet (+ log khi thiết kế) với feedback |
| PARTIAL | Một hoặc nhiều tầng thiếu / sai sheet / mock / permission gap |
| STUB | UI có nút; handler cố ý không ghi hoặc toast "đang chuẩn bị" |
| BROKEN | Link/route/handler lỗi (404, no-op) |
| UNKNOWN | Phụ thuộc `VITE_CBV_API_BASE_URL` / mock |

---

## 1. Task / Work Inbox — CTA Trace Matrix

### 1.1 Nhận việc (Accept / IN_PROGRESS)

```text
CTA: Nhận việc
UI Label: Nhận việc / Nhận
Screen / Component: TaskCard, InlineQuickActions, OperationalContextPanel, TasksPage.handleAccept
React Handler: useInlineExecution.runQuickAction(ACCEPT) | handleAccept → api.updateTaskStatus
Hook / Client Function: apps/workboard/src/modules/task/useInlineExecution.ts, TasksPage.tsx
Worker Endpoint: POST /api/tasks/:id/status  { status: IN_PROGRESS, note }
GAS Function: taskDbHandleAction_ → taskDbUpdateTaskStatus_ (taskDbApi.js → taskDbService.js)
Sheet Read/Write: TASK_MAIN (STATUS, UPDATED_*); optional DONE_AT if DONE
Append-only Log: TASK_UPDATE_LOG (STATUS_CHANGE); CBV_AUDIT_LOG if sheet exists
Permission Check: Worker canViewModule(TASK) on read; write: NO canUpdateTask on status handler; GAS: token only
Current Status: PARTIAL
Evidence: useInlineExecution.ts:34-41; taskGsDb.ts:246-271; taskDbService.js:510-535
Risk: HIGH — STAFF có thể ghi task không thuộc mình; mock mode không ghi sheet
Fix Recommendation: Worker enforce canUpdateTask(user, task); GAS verify OWNER_ID; block mock in prod
```

### 1.2 Hoàn tất (Complete)

```text
CTA: Hoàn tất
UI Label: Hoàn tất / Xong
Screen / Component: TaskCard, useInlineExecution.runMicroUpdate, handleComplete, TaskUpdateForm
React Handler: api.completeTask(taskId, note)
Hook / Client Function: useInlineExecution.ts:104-112; TasksPage.tsx:548-570
Worker Endpoint: POST /api/tasks/:id/complete
GAS Function: taskDbCompleteTask_ → taskDbUpdateTaskStatus_(DONE)
Sheet Read/Write: TASK_MAIN STATUS=DONE, DONE_AT
Append-only Log: TASK_UPDATE_LOG; CBV_AUDIT_LOG optional
Permission Check: Same gap as status update
Current Status: PARTIAL (WIRED when GS_01+Worker; permission PARTIAL)
Evidence: client.ts:247-253; taskDbService.js:585-587
Risk: CRITICAL if unauthorized complete allowed
Fix Recommendation: canUpdateTask before POST; UI feedback already via taskFeedback.runWithFeedback
```

### 1.3 Cập nhật trạng thái (form)

```text
CTA: Cập nhật trạng thái
UI Label: Cập nhật / Trạng thái (TaskUpdateForm)
Screen / Component: TaskUpdateForm in detail panel
React Handler: api.updateTaskStatus | api.completeTask | api.assignTask
Hook / Client Function: TaskUpdateForm.tsx:34-71
Worker Endpoint: POST status | assign | complete (same as above)
GAS Function: taskDbUpdateTaskStatus_ | taskDbAssignTask_ | taskDbCompleteTask_
Sheet Read/Write: TASK_MAIN
Append-only Log: TASK_UPDATE_LOG
Permission Check: FE capability.writeMode; Worker assign checks canAssignTask only
Current Status: PARTIAL
Evidence: TaskUpdateForm.tsx; taskGsDb.ts
Risk: MEDIUM — locked when writeMode LOCKED (good); open write still no row-level check
Fix Recommendation: Gate form with canUpdateTask per task
```

### 1.4 Ghi chú (Comment)

```text
CTA: Ghi chú
UI Label: Ghi chú / Tiếp tục (CONTINUE → comment)
Screen / Component: TaskUpdateForm, useInlineExecution (CONTINUE, RESCHEDULE)
React Handler: api.addTaskComment
Hook / Client Function: useInlineExecution.ts:84-91; TaskUpdateForm.tsx:63-65
Worker Endpoint: POST /api/tasks/:id/comments
GAS Function: taskDbAddComment_ (no TASK_MAIN field change)
Sheet Read/Write: TASK_UPDATE_LOG append only
Append-only Log: TASK_UPDATE_LOG ✓; CBV_AUDIT_LOG optional
Permission Check: None on Worker beyond auth
Current Status: PARTIAL (WIRED append path; permission gap)
Evidence: taskDbService.js:567-582
Risk: MEDIUM — spam log / cross-task if no authZ
Fix Recommendation: Require canUpdateTask; rate-limit
```

### 1.5 Chuyển xử lý / Assign

```text
CTA: Chuyển xử lý / Chuyển / Handoff
UI Label: Chuyển / Chuyển giao / Chuyển tiếp
Screen / Component: Inline handoff flow, TaskUpdateForm assignee, FocusActionBar "Chuyển giao"
React Handler: runHandoff → api.updateTaskStatus(WAITING, note) NOT assignTask
Hook / Client Function: useInlineExecution.ts:133-151; handoffQuickActions.ts
Worker Endpoint: POST /api/tasks/:id/status (handoff) OR POST assign when form used
GAS Function: taskDbUpdateTaskStatus_ (handoff) | taskDbAssignTask_ (form)
Sheet Read/Write: Handoff: STATUS only; Form assign: OWNER_ID
Append-only Log: TASK_UPDATE_LOG
Permission Check: assign route: canAssignTask (ADMIN/MANAGER only)
Current Status: PARTIAL
Evidence: runHandoff uses updateTaskStatus not assignTask; taskDbAssignTask_ exists but underused
Risk: HIGH — handoff không đổi OWNER_ID; operator thinks reassigned
Fix Recommendation: Handoff → assignTask + status; or rename UI "Ghi chú chuyển"
```

### 1.6 Tạm dừng / WAITING

```text
CTA: Tạm dừng
UI Label: Tạm dừng / Chờ khách / Chờ duyệt
Screen / Component: useInlineExecution WAIT_CUSTOMER, WAIT_APPROVAL; Focus V3 Tạm dừng
React Handler: api.updateTaskStatus(WAITING|WAITING_APPROVAL) | Focus: disabled/stub
Worker Endpoint: POST /api/tasks/:id/status
GAS Function: taskDbUpdateTaskStatus_
Sheet Read/Write: TASK_MAIN STATUS
Append-only Log: TASK_UPDATE_LOG
Permission Check: Gap as above
Current Status: PARTIAL (list path) / STUB (Focus V3 & Focus Runtime secondary)
Evidence: WorkInboxFocusModeV3.tsx:126-134 disabled; FocusActionBar → showFocusRuntimeFeedback
Risk: HIGH for Focus — primary operator flow cannot pause
Fix Recommendation: Wire Focus to useInlineExecution WAIT_CUSTOMER path
```

### 1.7 Mở hồ sơ liên quan

```text
CTA: Mở hồ sơ liên quan
UI Label: Liên kết hồ sơ / Mở hồ sơ
Screen / Component: RightContextTabs, task relatedHoSoId display
React Handler: Text display only — no navigate(/hoso/:id)
Hook / Client Function: RightContextTabs.tsx:107-108
Worker Endpoint: N/A (read relatedHoSoId from GET /api/tasks/:id)
GAS Function: taskDbGetTaskDetail_ reads RELATED_ENTITY_*
Sheet Read/Write: TASK_MAIN read only
Append-only Log: N/A
Permission Check: canViewModule TASK
Current Status: STUB
Evidence: No Link to /hoso with query/id
Risk: MEDIUM — operator cannot jump to record
Fix Recommendation: Deep link /hoso?hoSoId= from RELATED_ENTITY_ID
```

### 1.8 Làm mới dữ liệu

```text
CTA: Làm mới dữ liệu
UI Label: (implicit reload) / ErrorState onRetry / loadWorkspace(true)
Screen / Component: TasksPage.loadWorkspace, OperationalHome reload, RuntimeFooterDrawer
React Handler: api.getTaskWorkspaceSnapshot(force)
Hook / Client Function: TasksPage.tsx loadWorkspace
Worker Endpoint: GET /api/tasks/workspace-snapshot
GAS Function: CBV_TaskDb_getTaskWorkspaceSnapshot → taskDbGetWorkspaceSnapshot_
Sheet Read/Write: TASK_MAIN read
Append-only Log: N/A
Permission Check: canViewModule(TASK)
Current Status: WIRED (read refresh)
Evidence: taskGsDb.ts:125-194; taskDbService.js:278-345
Risk: LOW
Fix Recommendation: Expose explicit "Làm mới" button in inbox header
```

### 1.9 Filters — Việc của tôi / Chờ xử lý / Quá hạn / Chờ duyệt

```text
CTA: Filter tabs (mine, pending, overdue, approval)
UI Label: Việc của tôi, Chờ xử lý, Quá hạn, Chờ duyệt
Screen / Component: TaskControlSurface, TasksPage URL ?filter=
React Handler: applyTaskFilter / deriveVisibleTaskRuntime — client-only on snapshot
Hook / Client Function: taskFilterRuntime.ts
Worker Endpoint: GET workspace-snapshot (optional query params rarely used by FE)
GAS Function: taskDbApplyFilters_ only if Worker passes status/assignee
Sheet Read/Write: Read TASK_MAIN (full snapshot)
Append-only Log: N/A
Permission Check: canViewModule on initial load only
Current Status: PARTIAL
Evidence: FE filters client-side; snapshot returns all rows
Risk: CRITICAL visibility — filter hides UI but data already loaded
Fix Recommendation: Server-side filter + canViewTask per row
```

### 1.10 Inbox groups — Quá hạn / Hôm nay / Chờ / Theo dõi / Hoàn thành

```text
CTA: V3 inbox group chips (InboxStatus)
UI Label: Quá hạn, Hôm nay, Chờ xử lý, Theo dõi, Hoàn thành
Screen / Component: WorkInboxGroupsPanel, workInboxAdapter, WorkInboxStatusChip
React Handler: mapTasksToInboxItems → buildVisibleInboxGroups — pure client derive
Hook / Client Function: inboxGroups.ts, workInboxAdapter.ts
Worker Endpoint: Same snapshot GET
GAS Function: Same
Sheet Read/Write: TASK_MAIN read
Append-only Log: N/A
Permission Check: N/A
Current Status: PARTIAL
Evidence: Status map from TASK_MAIN.STATUS + urgency, not HOME_ALERT.STATUS
Risk: MEDIUM — label lệch DB HOME_ALERT OPEN/RESOLVED
Fix Recommendation: Document mapping table in UI contract
```

### 1.11 Focus Mode V3 — Hoàn thành

```text
CTA: Focus V3 — Hoàn thành
UI Label: Hoàn thành
Screen / Component: WorkInboxFocusModeV3 (legacy focus when focusRuntime off)
React Handler: onComplete?.(current) — prop NOT passed from WorkInboxGroupsPanel
Hook / Client Function: WorkInboxFocusModeV3.tsx:108-116 disabled=true
Worker Endpoint: NONE
GAS Function: NONE
Sheet Read/Write: NONE
Append-only Log: NONE
Permission Check: N/A
Current Status: STUB
Evidence: ACTION_STUB_TITLE; buttons disabled opacity-60
Risk: CRITICAL UX — "giao diện đẹp nút không hoạt động"
Fix Recommendation: Pass handleComplete from TasksPage → WorkInboxGroupsPanel → Focus V3
```

### 1.12 Focus Mode V3 — Chuyển tiếp / Tạm dừng

```text
CTA: Focus V3 — Chuyển tiếp / Tạm dừng
UI Label: Chuyển tiếp / Tạm dừng
Screen / Component: WorkInboxFocusModeV3
React Handler: disabled onClick stubs
Worker Endpoint: NONE
Current Status: STUB
Evidence: WorkInboxFocusModeV3.tsx:117-134
Risk: CRITICAL
Fix Recommendation: Wire useInlineExecution handoff + WAITING
```

### 1.13 Focus Runtime — Bắt đầu xử lý

```text
CTA: Focus Runtime — ▶ Bắt đầu xử lý
UI Label: Bắt đầu xử lý
Screen / Component: FocusActionBar.onPrimary → handleOpenFocusItem
React Handler: resolveFocusItemOpenTarget → onOpenTask (navigation only)
Worker Endpoint: NONE on click; subsequent GET detail
GAS Function: taskDbGetTaskDetail_ on open
Sheet Read/Write: Read only
Current Status: PARTIAL
Evidence: WorkInboxGroupsPanel.tsx:94-107 — opens task route, does not set IN_PROGRESS
Risk: MEDIUM — mislabel "Bắt đầu xử lý" vs navigate
Fix Recommendation: Primary = accept task OR rename "Mở chi tiết"
```

### 1.14 Focus Runtime — Tạm dừng / Chuyển giao / Thao tác khác

```text
CTA: Focus Runtime secondary actions
UI Label: ⏸ Tạm dừng, Chuyển giao, … Thao tác khác
Screen / Component: FocusActionBar
React Handler: showFocusRuntimeFeedback() when onPause/onForward undefined
Hook / Client Function: focusRuntimeFeedback.ts — toast "Chức năng đang chuẩn bị"
Worker Endpoint: NONE
Current Status: STUB
Evidence: FocusActionBar.tsx:12-18, 30-42; WorkInboxGroupsPanel does not pass onPause/onForward
Risk: HIGH
Fix Recommendation: Phase 01 implementation prompt
```

### 1.15 Focus — Thoát focus / Prev / Next

```text
CTA: Thoát Focus / Việc trước / Việc tiếp
UI Label: Thoát Focus, ← Quay lại inbox, FocusHeader prev/next
Screen / Component: WorkInboxFocusModeV3, FocusTaskWorkspace, FocusHeader
React Handler: setState index / setViewMode / onBackToInbox — local UI only
Worker Endpoint: NONE
Sheet Read/Write: NONE
Current Status: WIRED (UI navigation only)
Evidence: FocusTaskWorkspace goPrev/goNext; WorkInboxLayoutContext
Risk: LOW
Fix Recommendation: None
```

### 1.16 Tạo việc

```text
CTA: Tạo việc
UI Label: Tạo việc (TaskCreateModal)
Screen / Component: TaskCreateModal, OperationalAlertHeader onCreate
React Handler: api.createTask
Worker Endpoint: POST /api/tasks
GAS Function: taskDbCreateTask_
Sheet Read/Write: TASK_MAIN append row
Append-only Log: TASK_UPDATE_LOG CREATE; CBV_AUDIT_LOG
Permission Check: canCreateTask (ADMIN/MANAGER)
Current Status: PARTIAL (WIRED path; role gate OK on Worker)
Evidence: taskGsDb.ts:215-243; taskDbService.js:463-504
Risk: LOW for create; MEDIUM if write locked in env
Fix Recommendation: Show capability in UI when LOCKED
```

### 1.17 Quick actions — Gọi / Theo dõi / Xác nhận (local only)

```text
CTA: Gọi khách / Theo dõi / Xác nhận (start micro flow)
UI Label: Gọi, Theo dõi, Xác nhận
React Handler: runQuickAction → localOnly: true, appendExecutionLog (sessionStorage)
Worker Endpoint: NONE on first click
Current Status: STUB (by design manual-first)
Evidence: useInlineExecution.ts:43-59
Risk: LOW — intentional memory-first
Fix Recommendation: Keep; optional later CALL log to TASK_UPDATE_LOG on confirm
```

---

## 2. Home Alert — CTA Trace Matrix

### 2.1 Xem cảnh báo

```text
CTA: Xem cảnh báo
UI Label: Xem (AlertCard)
Screen / Component: OperationalHome, AlertCard
React Handler: Link to alert.href (usually /tasks/...)
Worker Endpoint: GET /api/today → getTodaySummary (mockData)
GAS Function: NONE on Worker today path
Sheet Read/Write: HOME_ALERT (intended) — NOT read in Worker today handler
Current Status: PARTIAL
Evidence: workboard.ts:51-61 uses mock getTodaySummary
Risk: HIGH — alerts not from live HOME_ALERT sheet in Worker
Fix Recommendation: Worker adapter read HOME_ALERT projection from GAS RF_02/CbvStaffWorkspace
```

### 2.2 Nhận cảnh báo / Resolve cảnh báo

```text
CTA: Nhận cảnh báo / Resolve
UI Label: (NOT in workboard FE)
Screen / Component: NOT FOUND IN REPO (workboard)
React Handler: N/A
Worker Endpoint: NOT FOUND
GAS Function: HomeAlert_claimAlert, HomeAlert_resolveAlert (05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js)
Sheet Read/Write: HOME_ALERT (ASSIGNED_TO, STATUS, IS_RESOLVED)
Append-only Log: ADMIN_AUDIT_LOG via GAS
Current Status: STUB (GAS exists; UI absent)
Evidence: AppSheet docs only; no api client method
Risk: CRITICAL gap for alert-first ops
Fix Recommendation: New Worker routes POST /api/home-alert/:id/claim|resolve
```

### 2.3 Mở việc / hồ sơ liên quan từ alert

```text
CTA: Mở việc liên quan
UI Label: Xem → /tasks/:id
React Handler: AlertItem.href navigation
Worker Endpoint: Indirect via task detail
Current Status: PARTIAL
Evidence: mock alerts embed href; live HOME_ALERT RELATED_ENTITY_* not bound
Fix Recommendation: Map RELATED_ENTITY_TYPE/ID to routes
```

---

## 3. Hồ sơ — CTA Trace Matrix

### 3.1 Mở hồ sơ

```text
CTA: Mở hồ sơ
UI Label: HoSoCard click
Screen / Component: HoSoPage
React Handler: setDetail panel — read-only stub content
Worker Endpoint: GET /api/hoso
GAS Function: getHoSo_ stub in Code.js doGet
Sheet Read/Write: Intended HO_SO_MASTER — Worker returns mockData HOSO
Current Status: PARTIAL (read mock; no HO_SO_MASTER bind)
Evidence: hoso.ts:8-19; HoSoPage "Chỉ xem"
Risk: MEDIUM
Fix Recommendation: GAS RF06 adapter → HO_SO_MASTER
```

### 3.2 Xem giấy tờ / Upload

```text
CTA: Xem giấy tờ / Upload
UI Label: NOT FOUND in HoSoPage
Worker Endpoint: NONE
GAS: HO_SO_FILE read exists in schema
Current Status: STUB
Fix Recommendation: HO_SO_FILE list in detail drawer
```

### 3.3 Mở task liên quan / Cập nhật trạng thái hồ sơ

```text
CTA: Mở task liên quan / Cập nhật HS
Current Status: STUB — not in HoSoPage
Fix Recommendation: Cross-link from HO_SO_MASTER RELATED_ENTITY
```

---

## 4. Finance — CTA Trace Matrix

### 4.1 Xem giao dịch / Mở chứng từ / Cập nhật

```text
CTA: Xem giao dịch
UI Label: FinanceCard
Screen / Component: FinancePage
Worker Endpoint: GET /api/finance → mockData FINANCE
GAS: getFinance_ stub
Current Status: PARTIAL (read-only mock)
Evidence: finance.ts; FinancePage "Chỉ xem"
CTA: Cập nhật trạng thái — NOT FOUND
Current Status: STUB
Risk: LOW until finance ops go live
```

---

## 5. Admin / System — CTA Trace Matrix

### 5.1 Observation / Health

```text
CTA: Quan sát / Health
Screen / Component: ObservationPage, /observation
Worker Endpoint: GET /api/observation → mockData
GAS: partial stub
Sheet: SYSTEM_HEALTH_LOG / CBV_TEST_REPORTS — NOT bound on Worker
Current Status: PARTIAL (display mock cards)
Evidence: observation.ts
```

### 5.2 Plugins / Config

```text
CTA: Cấu hình mô-đun
Screen / Component: PluginsPage /plugins
Worker Endpoint: GET /api/plugins → mock plugins
ROLE_PERMISSION_MATRIX / FEATURE_FLAG: NOT read
Current Status: STUB (read-only capability list)
Evidence: plugins.ts
```

### 5.3 Sidebar broken routes

```text
CTA: Quan sát (sidebar)
UI Label: Quan sát → /observe
Current Status: BROKEN (404)
Evidence: OperatorMainSidebar.tsx:82-86 vs routes.tsx (only /observation)

CTA: Cấu hình (sidebar)
UI Label: Cấu hình → /config
Current Status: BROKEN (404)
Evidence: OperatorMainSidebar.tsx:87-92 vs routes.tsx (/plugins)
```

### 5.4 Test Console

```text
CTA: Test Console
Screen / Component: NOT in operator menu (correct per standard)
Worker/GAS: CBV_TCS_* in gas-runtime-api and 05_GAS_RUNTIME menus
Current Status: STUB in operator UI (absent by design); GAS WIRED for admin
Evidence: 000_TEST_CONSOLE/CBV_TCS_V1
```

---

## 6. Summary Lists

### 6.1 Fully WIRED (within scope + env)

| CTA | Notes |
|-----|-------|
| Làm mới snapshot | GET workspace-snapshot |
| Focus prev/next/exit | UI-only |
| Filter tab visual state | CSS active class |
| Task create | When write enabled + ADMIN/MANAGER |
| Accept/Complete/Comment | GS_01 path when Worker connected — **permission still PARTIAL** |

### 6.2 STUB / BROKEN (priority fix)

| CTA | Status | Breakpoint |
|-----|--------|------------|
| Focus V3 Hoàn thành / Chuyển / Tạm dừng | STUB | React disabled |
| Focus Runtime Tạm dừng / Chuyển giao | STUB | showFocusRuntimeFeedback |
| HOME_ALERT claim/resolve | STUB | No FE/Worker |
| Mở hồ sơ from task | STUB | No Link |
| Sidebar /observe, /config | BROKEN | Route 404 |
| HoSo/Finance write | STUB | No UI |
| Gọi/Theo dõi micro start | STUB | By design (memory-first) |

### 6.3 PARTIAL (highest impact)

| CTA | Gap |
|-----|-----|
| Handoff | Uses status POST not assign |
| All task writes | No canUpdateTask on Worker status/complete/comment |
| Snapshot + filters | All rows loaded; client filter only |
| /api/today alerts | Mock not HOME_ALERT |
| HoSo/Finance/Observation reads | mockData not sheet |

---

## 7. Source Of Truth Findings

| Question | Finding |
|----------|---------|
| TASK_MAIN canonical? | **Yes** for TASK_GS_01 Worker path (ADR draft) |
| TASKS legacy RF12? | **Yes** — `gas-runtime-api/Config.js` TASKS + Tasks.js; parallel POST when task-db action not matched |
| TASK_TIMELINE vs TASK_UPDATE_LOG | RF12 writes TASK_TIMELINE; GS_01 UI reads/writes TASK_UPDATE_LOG only |
| UI uses which table? | **TASK_MAIN** snapshot + detail; timeline from **TASK_UPDATE_LOG** |
| HOME_ALERT primary or projection? | **Projection** — GAS generates from TASK_MAIN/finance/logs; UI today summary **not** reading sheet live on Worker |
| UI updates HOME_ALERT? | **No** FE path |
| HOME_ALERT → TASK link | RELATED_ENTITY_* in sheet; FE uses task href from adapter |
| HO_SO UI sheet | Worker **mock**; schema canonical **HO_SO_MASTER** + HO_SO_FILE; user DB may have HO_SO_XA_VIEN tabs as types |
| Deep link task→hồ sơ | **Not implemented** |

---

## 8. AppSheet Integration Findings

| Item | Status |
|------|--------|
| FE env | `VITE_CBV_APPSHEET_TASK_URL`, `VITE_CBV_APPSHEET_HOSO_URL`, `VITE_CBV_APPSHEET_FINANCE_URL` in `.env.example` |
| Module registry | TASK_APPSHEET, HO_SO_APPSHEET — NEW_TAB / IFRAME |
| Worker adapter | `appSheetAdapter.ts` — fetch projection if URL+key configured; **fallback mock** |
| Task inbox data path | **NOT AppSheet** — Worker → GAS taskDb → TASK_MAIN |
| AppSheet read/write sheets (docs) | TASK_MAIN, HOME_ALERT per `04_APPSHEET/*`, `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` |
| AppSheet actions | HomeAlert_claimAlert, etc. — **AppSheet only**, not workboard |

**Conclusion:** AppSheet is parallel channel; workboard operator CTAs trace to **Google Sheets via GAS taskDb**, not AppSheet API.

---

## 9. Permission Runtime Findings

| Layer | Behavior | Gap |
|-------|----------|-----|
| FE PermissionGate | user.permissions[] from login | Not from ROLE_PERMISSION_MATRIX sheet |
| FE modulePermissions | LOCAL_MODULE_REGISTRY + roleRequired | Hard-coded |
| Worker canViewModule | Role → module access | OK for module entry |
| Worker canUpdateTask | Defined in taskPermissions.ts | **NOT called** in handleTaskDbStatus/Complete/Comment |
| Worker canAssignTask | Called on assign route only | Handoff bypasses |
| GAS taskDb | Token validation; permissionAllowed: true hardcoded | No canUserSeeTask |
| GAS RF12 | rf12CanWrite_, rf12CanUpdateTask_ | Separate from taskDb; uses TASKS row shape |
| ROLE_PERMISSION_MATRIX | Sheet exists | **NOT consumed** |

---

## 10. Sheet Write / Append Log Findings

| Action | TASK_MAIN | TASK_UPDATE_LOG | CBV_AUDIT_LOG | API_AUDIT_LOG | TASK_TIMELINE | TASKS |
|--------|-----------|-----------------|---------------|---------------|---------------|-------|
| GS_01 status | PATCH | APPEND | optional | — | — | — |
| GS_01 complete | PATCH | APPEND | optional | — | — | — |
| GS_01 assign | PATCH OWNER | APPEND | optional | — | — | — |
| GS_01 comment | — | APPEND | optional | — | — | — |
| GS_01 create | APPEND | APPEND | optional | — | — | — |
| RF12 update | — | — | — | APPEND | APPEND | PATCH |
| HOME_ALERT claim | — | — | via GAS audit | — | — | — |

**Gap:** RF12 path still capable if misconfigured Worker env.

---

## 11. Route Findings

| Route | Status |
|-------|--------|
| `/inbox`, `/tasks` | OK |
| `/home` | OK |
| `/observation` | OK |
| `/plugins` | OK |
| `/observe` | **404** (sidebar) |
| `/config` | **404** (sidebar) |
| `/admin/*` | **NOT FOUND** |
| Test Console URL | **NOT in operator routes** (OK) |

---

## 12. Risk Ranking

| ID | Risk | Severity |
|----|------|----------|
| R1 | Task writes without row-level permission | CRITICAL |
| R2 | Snapshot loads all TASK_MAIN rows | CRITICAL |
| R3 | Dual TASK_MAIN vs TASKS write paths | CRITICAL |
| R4 | Focus Mode primary actions STUB | HIGH |
| R5 | Handoff does not assign OWNER_ID | HIGH |
| R6 | HOME_ALERT not live on /api/today | HIGH |
| R7 | Sidebar 404 routes | HIGH |
| R8 | Mock mode indistinguishable in UI | MEDIUM |
| R9 | Status label vs HOME_ALERT vocabulary | MEDIUM |
| R10 | HoSo/Finance mock projection | MEDIUM |

---

## 13. Recommended Fix Order

| Order | Item | Phase |
|-------|------|-------|
| 1 | Fix `/observe` → `/observation`, `/config` → `/plugins` | IMPLEMENTATION_01 |
| 2 | Wire Focus V3 + Focus Runtime to `useInlineExecution` | IMPLEMENTATION_01 |
| 3 | Worker: canUpdateTask on status/complete/comment | IMPLEMENTATION_02 |
| 4 | Snapshot row filter canUserSeeTask | IMPLEMENTATION_02 |
| 5 | Handoff → assignTask + status | IMPLEMENTATION_02 |
| 6 | Rename Focus primary or wire ACCEPT on click | IMPLEMENTATION_01 |
| 7 | Worker HOME_ALERT read for /api/today | IMPLEMENTATION_03 |
| 8 | HOME_ALERT claim/resolve API + UI | IMPLEMENTATION_03 |
| 9 | HoSo GAS bind HO_SO_MASTER | IMPLEMENTATION_04 |
| 10 | ROLE_PERMISSION_MATRIX reader | IMPLEMENTATION_05 |
| 11 | Disable RF12 write fallback | IMPLEMENTATION_05 |

---

## 14. Focus Mode V3 — Exact Breakpoint Diagram

```text
TasksPage (has useInlineExecution ✓)
    ↓ props NOT passed
WorkInboxGroupsPanel
    ↓ onComplete/onForward/onPause undefined
WorkInboxFocusModeV3 OR WorkInboxFocusRuntime
    ↓
WorkInboxFocusModeV3: buttons disabled=true (STUB)
WorkInboxFocusRuntime → FocusActionBar
    ↓ onPause/onForward undefined
showFocusRuntimeFeedback("Chức năng đang chuẩn bị")  ← STUB
    ✗ api.updateTaskStatus / completeTask NEVER CALLED
```

**Fix anchor:** Pass `handleComplete`, `runHandoff`, `WAITING` handler from `TasksPage` → `WorkInboxGroupsPanel` → Focus components.

---

## 15. Next Implementation Prompt

```text
PHASE: PHASE_UI_DB_DESIGN_IMPLEMENTATION_01_IA_AND_FOCUS_ACTIONS

READ FIRST:
- 00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_RUNTIME_TRACE_AUDIT_REPORT.md
- 00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md

SCOPE:
1. Fix OperatorMainSidebar routes (/observation, /plugins).
2. Wire Focus V3 + FocusActionBar to useInlineExecution (complete, handoff, WAITING).
3. Pass handlers from TasksPage → WorkInboxGroupsPanel.
4. Rename "Bắt đầu xử lý" OR wire ACCEPT on primary click.
5. npm run build + inbox checks PASS.

OUT OF SCOPE: Worker permission enforcement, HOME_ALERT API, RF12 disable.

OUTPUT: PHASE_UI_DB_DESIGN_IMPLEMENTATION_01_REPORT.md (append-only)
```

---

## References

- `apps/workboard/src/app/routes.tsx`
- `apps/workboard/src/components/layout/OperatorMainSidebar.tsx`
- `apps/workboard/src/modules/task/useInlineExecution.ts`
- `apps/workboard/src/modules/task/inbox/components/WorkInboxFocusModeV3.tsx`
- `apps/workboard/src/modules/task/inbox/focusRuntime/FocusActionBar.tsx`
- `workers/api/src/router.ts`
- `workers/api/src/modules/taskGsDb.ts`
- `gas-runtime-api/taskDbService.js`, `Code.js`
- `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`, `46_CBV_PERMISSION_RUNTIME.js`

---

*Append-only — PHASE_UI_RUNTIME_TRACE_AUDIT — 2026-05-30*
