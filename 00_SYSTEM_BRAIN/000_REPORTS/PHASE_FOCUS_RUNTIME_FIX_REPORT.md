# PHASE_FOCUS_RUNTIME_FIX — Report

**Date:** 2026-05-30  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Phase:** `PHASE_FOCUS_RUNTIME_FIX`  
**Mode:** RUNTIME WIRING FIX (UI → secured Worker → GAS)  
**Status:** **GO**

---

## Executive Summary

Focus Mode V3 and Focus Runtime previously showed action buttons but did not call the secured task API (`api.completeTask`, `api.updateTaskStatus`, handoff via `useInlineExecution`). Secondary actions fell back to `showFocusRuntimeFeedback("Chức năng đang chuẩn bị")`. Sidebar links `/observe` and `/config` returned 404.

This phase wires Focus actions from `TasksPage` through `WorkInboxGroupsPanel` into `WorkInboxFocusRuntime`, `FocusActionBar`, and legacy `WorkInboxFocusModeV3`. All mutations go through existing Worker routes secured in `PHASE_SECURITY_RUNTIME_FIX`. No GAS, schema, or permission-matrix changes.

---

## Files Changed

| File | Change |
|------|--------|
| `apps/workboard/src/modules/task/useFocusTaskActions.ts` | **New** — focus complete / pause / forward / primary (accept + open) |
| `apps/workboard/src/modules/task/TasksPage.tsx` | Hook + pass handlers to `WorkInboxGroupsPanel` |
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | Propagate focus handlers to runtime + V3 |
| `apps/workboard/src/modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx` | Pass complete + pending |
| `apps/workboard/src/modules/task/inbox/focusRuntime/FocusTaskWorkspace.tsx` | Pass complete + pending to action bar |
| `apps/workboard/src/modules/task/inbox/focusRuntime/FocusActionBar.tsx` | Real handlers, pending UI, dynamic primary label |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxFocusModeV3.tsx` | Enable actions when handlers present |
| `apps/workboard/src/components/layout/OperatorMainSidebar.tsx` | `/observation`, `/plugins` routes |
| `apps/workboard/src/modules/task/inbox/focusModeV3Checks.ts` | Update static check for wired actions |

---

## Focus Action Wiring Matrix

| CTA | Component | Handler | API path |
|-----|-----------|---------|----------|
| **Hoàn thành** | FocusActionBar, WorkInboxFocusModeV3 | `onFocusComplete` | `POST /api/tasks/:id/complete` |
| **Tạm dừng** | FocusActionBar, WorkInboxFocusModeV3 | `onFocusPause` | `POST /api/tasks/:id/status` → `WAITING` + focus pause note |
| **Chuyển giao / Chuyển tiếp** | FocusActionBar, WorkInboxFocusModeV3 | `onFocusForward` | `runHandoff` → `POST /api/tasks/:id/status` → `WAITING` + “Chờ chuyển xử lý” (no assignee UI) |
| **Bắt đầu xử lý** | FocusActionBar | `onFocusPrimary` | If `NEW`/`OPEN`/`TODO`: `POST …/status` → `IN_PROGRESS`, then open detail; else label **Mở chi tiết** + open only |
| **Mở xử lý** (V3 primary) | WorkInboxFocusModeV3 | `onFocusPrimary` | Same as above |

Pending state: per-task `focusPending` + disabled buttons + toast via `showFocusRuntimeFeedback`.

403 mapping: API error containing `Không có quyền` → **“Bạn không có quyền thao tác việc này”**.

After success: `loadWorkspace(true)` refreshes snapshot.

---

## Before / After Trace

### Before

```text
Focus Button → onComplete undefined → disabled OR showFocusRuntimeFeedback()
→ ✗ api.completeTask never called
```

### After — Hoàn thành

```text
Focus Button: Hoàn thành
 → WorkInboxFocusModeV3 / FocusActionBar
 → onFocusComplete (TasksPage / useFocusTaskActions)
 → api.completeTask
 → POST /api/tasks/:id/complete
 → Worker permission check (PHASE_SECURITY_RUNTIME_FIX)
 → GAS taskDbCompleteTask_
 → TASK_MAIN + TASK_UPDATE_LOG
 → toast success + snapshot refresh
```

### After — Tạm dừng

```text
Focus: Tạm dừng → api.updateTaskStatus(WAITING) → POST /api/tasks/:id/status → GAS → refresh
```

### After — Chuyển xử lý

```text
Focus: Chuyển giao → runHandoff(FOCUS_FORWARD_TARGET)
 → POST /api/tasks/:id/status (WAITING, note Chờ chuyển xử lý)
 → toast warns: chưa đổi người phụ trách
 → NOT POST /assign (no assignee picker in Focus UI)
```

---

## Sidebar Route Fix

| Before | After |
|--------|-------|
| `/observe` | `/observation` |
| `/config` | `/plugins` |

---

## Handoff / Assign Behavior Decision

**Decision:** Focus UI has no assignee picker. **Chuyển giao** uses status-only handoff (`WAITING` + explicit note) via existing `runHandoff` / `updateTaskStatus` — same as list inline handoff. Success toast states owner was **not** changed. Real `POST /api/tasks/:id/assign` remains available in detail panel / `TaskUpdateForm` when assignee is known.

Documented in ADR: `ADR_FOCUS_RUNTIME_ACTIONS.md`.

---

## Security Boundary Confirmation

| Rule | Status |
|------|--------|
| No direct GAS from FE | ✅ `api/client.ts` only |
| No TASKS legacy write | ✅ unchanged Worker guards |
| No mock success | ✅ API errors surfaced |
| No new FE permission matrix | ✅ Worker enforces |
| `taskPermissions.ts` untouched | ✅ |

---

## Tests Run

| Command | Result |
|---------|--------|
| `apps/workboard`: `npm run build` | **PASS** |
| `workers/api`: `npm run typecheck` | **PASS** |
| `workers/api`: `npm run test:permissions` | **PASS** |

### Manual verification checklist (operator / local)

- [ ] Sidebar **Quan sát** → `/observation` (no 404)
- [ ] Sidebar **Cấu hình** → `/plugins` (no 404)
- [ ] Focus **Hoàn thành** → network `POST …/complete`, not stub toast
- [ ] Focus **Tạm dừng** → `POST …/status` with `WAITING`
- [ ] Focus **Chuyển giao** → status WAITING + warning toast (no false assign claim)
- [ ] **Bắt đầu xử lý** on NEW task → `IN_PROGRESS` then detail opens
- [ ] **Mở chi tiết** label when already in progress
- [ ] 403 shows permission message
- [ ] Snapshot refreshes after success

---

## Remaining Risks

1. **Assign from Focus:** Requires future UI for assignee selection before `POST /assign`.
2. **Right context / preview cards:** Some secondary controls still use `showFocusRuntimeFeedback` (out of scope).
3. **`/api/today` mock:** Not addressed (next HOME_ALERT phase).
4. **Static TCS checks** (`focusRuntimePolishImage2Checks`) may still reference stub strings in files not on critical path — build does not run them.

---

## Next Recommended Phase

**PHASE_HOME_ALERT_RUNTIME_BINDING** — wire `/api/today` and alert claim/resolve to `HOME_ALERT` GAS.

Alternative if UX density is priority: **PHASE_OPERATOR_UI_DENSITY_POLISH**.

---

*Append-only report. Prior: `PHASE_SECURITY_RUNTIME_FIX_REPORT.md`.*
