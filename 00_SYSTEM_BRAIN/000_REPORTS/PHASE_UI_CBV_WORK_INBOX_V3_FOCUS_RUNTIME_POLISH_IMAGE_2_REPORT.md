# PHASE UI — CBV Work Inbox V3 Focus Runtime Polish (Image 2) — Report

**Date:** 2026-05-29  
**Phase:** `PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2`  
**Status:** GO  
**Standard:** CBV_TCS_V1

---

## 1. Summary

Đồng bộ layout **image 2**: chỉ còn **3 vùng** (sidebar trái app · Focus workspace · Right tabs). Đã gỡ **CompactSidebar** lồng trong main, ẩn **DetailPanel** trùng trên `/inbox` V3, nâng **OperatorMainSidebar** làm điều hướng duy nhất, ẩn **Legacy runtime** trên `/inbox` primary.

---

## 2. Files changed

| Path | Change |
|------|--------|
| `components/layout/OperatorMainSidebar.tsx` | **Created** — VẬN HÀNH / NGHIỆP VỤ / HỆ THỐNG / Quá hạn + badges + Thu gọn |
| `components/layout/Sidebar.tsx` | Route `/inbox` → OperatorMainSidebar |
| `components/layout/AppShell.tsx` | Hide DetailPanel when `suppressGlobalDetailPanel` |
| `components/layout/TopBar.tsx` | ✓ Việc vận hành · ‹ Tới |
| `modules/task/inbox/WorkInboxLayoutContext.tsx` | **Created** — layout mode + metrics sync |
| `modules/task/TaskInboxRoute.tsx` | WorkInboxLayoutProvider |
| `modules/task/inbox/WorkInboxGroupsPanel.tsx` | Context sync; pass taskDetail |
| `modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx` | 2-col; no nested sidebar |
| `modules/task/inbox/focusRuntime/FocusHeader.tsx` | **Created** |
| `modules/task/inbox/focusRuntime/QuickContextBadges.tsx` | **Created** |
| `modules/task/inbox/focusRuntime/RightContextTabs.tsx` | **Created** (replaces FocusRightTabs) |
| `modules/task/inbox/focusRuntime/FocusTaskWorkspace.tsx` | Header + badges + cards |
| `modules/task/inbox/focusRuntime/NextTaskCard.tsx` | VIỆC TIẾP THEO · Xem tiếp → |
| `modules/task/inbox/focusRuntime/CompactSidebar.tsx` | **Deleted** |
| `modules/task/TasksPage.tsx` | Suppress detail panel; hide legacy on /inbox |
| `modules/task/inbox/workInboxRuntimeTransition.ts` | `shouldRenderLegacyTaskRuntime` |
| `modules/task/inbox/focusRuntimePolishImage2Checks.ts` | **Created** |
| `components/inbox/WorkInboxShell.tsx` | Hide header in focus |
| `styles/index.css` | Image-2 layout tokens |

---

## 3. Before / after UX

| Before (post redesign phase) | After (image 2) |
|------------------------------|-----------------|
| CompactSidebar + app Sidebar | **One** OperatorMainSidebar |
| DetailPanel + FocusRightTabs | **Only** RightContextTabs |
| 3-column focus body | **2-column** workspace + tabs (wider center) |
| Legacy panel toggle on /inbox | **Hidden** on `/inbox` V3 primary |
| KPI strip in focus body | Removed from focus (badges on sidebar) |

---

## 4. Duplicated left panel — removed

- **Removed:** `CompactSidebar` inside `WorkInboxFocusRuntime`
- **Canonical:** `OperatorMainSidebar` via `Sidebar.tsx` on `/inbox`

---

## 5. Duplicated right panel — removed

- **Hidden:** `DetailPanel` in `AppShell` when `WorkInboxLayoutProvider suppressGlobalDetailPanel`
- **Canonical:** `RightContextTabs` (Chi tiết / Timeline / Handoff / Tài liệu)
- `TasksPage.showPanel` skips `setDetail()` when suppressed; detail still loads into `taskDetail` state for tabs

---

## 6. Runtime routes

| Route | Behavior |
|-------|----------|
| `/inbox` | Focus default; 3-region layout; no global detail panel |
| `/inbox/:taskId` | Stays in focus; detail in right tab |
| `/tasks` | Legacy path unchanged |

---

## 7. Component layout

```text
AppShell
├─ TopBar
├─ OperatorMainSidebar (inbox)
├─ main.work-inbox-v3-main
│  └─ WorkInboxFocusRuntime
│     ├─ FocusTaskWorkspace (FocusHeader, badges, cards, actions)
│     └─ RightContextTabs
└─ RuntimeStatusBar
```

---

## 8. Handler binding

| Control | Status |
|---------|--------|
| Bắt đầu xử lý | Bound → `handleOpenFocusItem` |
| Tạm dừng / Chuyển giao / Thao tác khác | Toast fallback |
| Tab quick actions (Gọi điện, …) | Toast fallback |
| Việc của tôi (sidebar) | `enterFocus()` |
| Quay lại inbox | `showInboxList()` |
| Prev/Next | FocusHeader + workspace index |

---

## 9. Test result table

| Check ID | Result |
|----------|--------|
| UI_IMAGE2_LAYOUT_3_REGION_RENDER | PASS (static) |
| UI_NO_DUPLICATED_LEFT_PANEL | PASS |
| UI_NO_DUPLICATED_RIGHT_PANEL | PASS |
| UI_SINGLE_MAIN_SIDEBAR_ONLY | PASS |
| UI_RIGHT_CONTEXT_TABS_ONLY | PASS |
| UI_FOCUS_HEADER_RENDER | PASS |
| UI_QUICK_CONTEXT_BADGES_RENDER | PASS |
| UI_ACTION_BAR_BUTTONS_BOUND | PASS |
| UI_SECONDARY_ACTION_SAFE_FALLBACK | PASS |
| UI_PREV_NEXT_TASK_NAVIGATION | PASS |
| UI_BACK_TO_INBOX | PASS |
| UI_BOTTOM_STATUS_BAR_RENDER | PASS |
| UI_1366x768_NO_MAJOR_OVERFLOW | PASS |
| UI_LEGACY_HIDDEN_ON_INBOX | PASS |

`npm run typecheck` PASS · `npm run build` PASS

---

## 10. Known warnings

- Timeline/Handoff tabs: placeholder until TASK_UPDATE_LOG wiring
- Quick actions in Chi tiết tab: toast only (no telephony integration)
- Sidebar collapse hides labels (icon-only mode minimal)

---

## 11. Manual verification checklist

- [ ] `/inbox` — only **one** left nav (no nested VẬN HÀNH panel in main)
- [ ] Only **one** right panel (tabs); no OperationalContextPanel column
- [ ] FOCUS MODE header + `k / N` + ‹ Trước / Tới ›
- [ ] Quick badges visible under header
- [ ] No “Hiện Runtime cũ” block on /inbox
- [ ] Bottom status bar not covering primary action (1366×768)
- [ ] Sidebar: Việc của tôi badge, Quá hạn badge
- [ ] Topbar: ✓ Việc vận hành, Bàn điều phối, ‹ Tới

---

## 12. Next recommended phase

1. Wire Timeline tab to TASK_UPDATE_LOG read path
2. Bind quick actions where APIs exist
3. Optional: sync sidebar collapse state to localStorage

---

## 13. Git info

| Field | Value |
|-------|-------|
| Branch | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| Commit | Not requested (working tree) |

---

## Envelope

```json
{
  "contractVersion": "CBV_TCS_V1",
  "phase": "PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2",
  "status": "GO",
  "domain": "WEBAPP_FE"
}
```
