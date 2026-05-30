# PHASE UI — CBV Work Inbox V3 Final Focus Runtime Redesign — Report

**Date:** 2026-05-29  
**Phase:** `PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN`  
**Status:** GO  
**Standard:** CBV_TCS_V1 · CBV Operational Ecosystem Standard V1

---

## 1. Summary

Triển khai **Focus Runtime** làm surface mặc định trên `/inbox`: một task tại một thời điểm, sidebar inbox gọn, panel phải dùng tab, KPI một dòng, card inbox click-to-open (không lặp nút Mở xử lý). Secondary actions dùng toast an toàn khi chưa bind handler.

---

## 2. Files changed

| Path | Change |
|------|--------|
| `apps/workboard/src/modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/FocusTaskWorkspace.tsx` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/FocusRightTabs.tsx` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/CompactSidebar.tsx` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/TaskActionBar.tsx` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/NextTaskCard.tsx` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/focusRuntimeFeedback.ts` | Created |
| `apps/workboard/src/modules/task/inbox/focusRuntime/BottomRuntimeStatusBar.tsx` | Created (marker) |
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | Refactored — focus default, inbox list mode |
| `apps/workboard/src/modules/task/inbox/workInboxGroupsFeature.ts` | Flags: `FOCUS_RUNTIME`, `FOCUS_RUNTIME_DEFAULT` |
| `apps/workboard/src/modules/task/inbox/focusRuntimeRedesignChecks.ts` | Created — CBV_TCS_V1 suite |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxKpiStrip.tsx` | `compact-line` variant |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxTaskCardV3.tsx` | `hideOpenButton` |
| `apps/workboard/src/modules/task/inbox/components/WorkInboxGroupSection.tsx` | Pass `hideOpenButton` |
| `apps/workboard/src/components/inbox/WorkInboxShell.tsx` | Footer clearance padding |
| `apps/workboard/src/styles/index.css` | Focus runtime layout + toast |
| `00_SYSTEM_BRAIN/000_TEST_CONSOLE/PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN/README.md` | Created |

**Not removed:** `WorkInboxFocusModeV3.tsx` (legacy path when `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME=false`).

---

## 3. Before / after UX

| Before | After |
|--------|-------|
| Inbox list + preview panel + nút Mở xử lý mỗi dòng | `/inbox` mở **Focus Runtime** (1 task) |
| KPI 4 ô grid | KPI **một dòng** (Việc · Quá hạn · Đang mở · Cảnh báo) |
| Focus = panel nhỏ cạnh list | Focus = workspace chính + **tabs phải** |
| Nhiều nút trong focus card cũ | Primary **Bắt đầu xử lý** + secondary có toast fallback |
| Danh sách dài trong focus | Không render list trong focus — **Quay lại inbox** để xem nhóm |

---

## 4. Runtime routes affected

| Route | Behavior |
|-------|----------|
| `/inbox` | Default **Focus Runtime** (`isWorkInboxFocusRuntimeDefault`) |
| `/tasks` | Unchanged — legacy alias + optional V3 panel per existing transition rules |
| `/inbox/:taskId` | Unchanged — deep link via existing `openWorkInboxTask` |

---

## 5. Component / layout map

```text
WorkInboxGroupsPanel
└─ viewMode focus → WorkInboxFocusRuntime
   ├─ WorkInboxKpiStrip (compact-line)
   ├─ CompactSidebar
   ├─ FocusTaskWorkspace
   │  ├─ TaskActionBar
   │  └─ NextTaskCard
   └─ FocusRightTabs
└─ viewMode inbox → group sections (hideOpenButton cards)
```

App shell: `TopBar` + module `Sidebar` + `RuntimeStatusBar` unchanged.

---

## 6. Handler binding status

| Action | Status |
|--------|--------|
| Bắt đầu xử lý (primary) | **Bound** → `handleOpenFocusItem` → `onOpenTask` / `openWorkInboxTask` |
| Quay lại inbox | **Bound** → `setViewMode('inbox')` |
| Prev / Next | **Bound** → local index + `clampFocusIndex` |
| Tabs Chi tiết/Timeline/Handoff/Tài liệu | **UI only** — tab switch local state |
| Tạm dừng / Chuyển giao / Thao tác khác | **Fallback** → toast `Chức năng đang chuẩn bị` |
| Focus N việc (from inbox header) | **Bound** → `enterFocus()` |

---

## 7. Test result table

**Runner:** `runFocusRuntimeRedesignChecks()`  
**Overall:** GO

| Check ID | Result |
|----------|--------|
| UI_FOCUS_RUNTIME_DEFAULT_RENDER | PASS |
| UI_COMPACT_SIDEBAR_RENDER | PASS |
| UI_RIGHT_PANEL_TABS_SWITCH | PASS |
| UI_PREV_NEXT_TASK_NAVIGATION | PASS |
| UI_BACK_TO_INBOX | PASS |
| UI_PRIMARY_ACTION_HANDLER_BOUND | PASS |
| UI_SECONDARY_ACTION_SAFE_FALLBACK | PASS |
| UI_NO_REPEATED_OPEN_BUTTONS_IN_FOCUS | PASS |
| UI_BOTTOM_STATUS_BAR_RENDER | PASS |
| UI_RESPONSIVE_1366_SAFE | PASS |

**Build:** `npm run typecheck` PASS · `npm run build` PASS

---

## 8. Known warnings

- Timeline / Handoff / Tài liệu tabs: placeholder copy until wired to `OperationalContextPanel` / TASK_UPDATE_LOG (no API change in this phase).
- `createdAt` not on `TaskItem` DTO — UI shows updated timestamp for both Tạo/Cập nhật when only `updatedAt` exists.
- App-level `DetailPanel` may still open when primary action navigates — existing contract.

---

## 9. Next recommended phase

1. Bind secondary actions (pause/forward) to existing GAS write handlers when approved.
2. Feed Timeline tab from `TASK_UPDATE_LOG` envelope (read-only).
3. Hide or collapse global `DetailPanel` on `/inbox` focus-only view to avoid dual right rails.
4. Wire AI summary from real enrichment service (optional).

---

## 10. Screenshot / manual verification checklist

- [ ] Open `/inbox` — Focus Runtime visible, no long task list
- [ ] KPI one line at top
- [ ] Compact sidebar sections render
- [ ] Counter `k / N` and Prev/Sau work
- [ ] Quay lại inbox shows grouped list; cards open on click (no row button)
- [ ] Focus N việc returns to focus mode
- [ ] Primary opens task detail route
- [ ] Secondary shows toast (not silent)
- [ ] Right tabs switch with visible active state
- [ ] Bottom status bar visible, content not hidden behind footer (1366×768)
- [ ] No console errors on navigation loop inbox ↔ focus

---

## 11. Git info

| Field | Value |
|-------|-------|
| Branch | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| HEAD (at phase start) | `a3e088b42f5c1141b3a220132377b308b8c5b01c` |
| Commit | Not requested — working tree only |

---

## Envelope (CBV_TCS_V1)

```json
{
  "contractVersion": "CBV_TCS_V1",
  "phase": "PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN",
  "status": "GO",
  "domain": "WEBAPP_FE",
  "nextStep": "Manual UAT on /inbox; then bind Timeline tab to TASK_UPDATE_LOG read path."
}
```
