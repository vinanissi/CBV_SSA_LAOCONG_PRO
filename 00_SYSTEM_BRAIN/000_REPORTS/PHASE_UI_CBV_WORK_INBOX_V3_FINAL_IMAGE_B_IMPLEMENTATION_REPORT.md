# PHASE UI — CBV Work Inbox V3 Final Image B — Report

**Date:** 2026-05-29  
**Phase:** `PHASE_UI_CBV_WORK_INBOX_V3_FINAL_IMAGE_B_IMPLEMENTATION`  
**Status:** GO  
**Reference:** `cbv-work-inbox-v3-B.png`

---

## 1. Summary

Hoàn thiện UI theo **ảnh B**: `WorkInboxV3ImageBLayout`, workspace trung tâm (header FOCUS MODE, badges, metadata, cards có checkbox, action bar xanh ▶), right tabs (TRẠNG THÁI / GHI CHÚ textarea / TÀI LIỆU / THAO TÁC NHANH), topbar placeholder `mã việc`, không panel trái/phải lặp.

---

## 2. Files changed

| Path | Change |
|------|--------|
| `inbox/imageB/WorkInboxV3ImageBLayout.tsx` | **Created** |
| `focusRuntime/FocusContentCards.tsx` | **Created** — AI / checklist / related |
| `focusRuntime/TaskMetadataRow.tsx` | **Created** |
| `focusRuntime/FocusActionBar.tsx` | **Created** — ▶ ⏸ … |
| `focusRuntime/FocusTaskWorkspace.tsx` | Refactored |
| `focusRuntime/RightContextTabs.tsx` | Image B detail tab |
| `focusRuntime/WorkInboxFocusRuntime.tsx` | Image B wrapper + timestamps |
| `focusRuntime/NextTaskCard.tsx` | Counter 2/97 |
| `focusRuntime/FocusHeader.tsx` | Sau › |
| `focusRuntime/TaskActionBar.tsx` | **Removed** (merged into FocusActionBar) |
| `components/layout/TopBar.tsx` | Search placeholder, ADMIN ▾ |
| `shared/utils/operatorFeedbackCopy.ts` | `mã việc` placeholder |
| `inbox/focusRuntimeImageBChecks.ts` | **Created** |
| `styles/index.css` | Image B visual tokens |

---

## 3. Before / after UX

| Before (image-2 polish) | After (image B) |
|-------------------------|-----------------|
| Generic cards | White cards, blue primary CTA |
| Bullet checklist | **Checkbox** checklist (local UI only) |
| Related info placeholder | **Structured rows** (mã, nguồn, ưu tiên, …) |
| Right tab plain text | **TRẠNG THÁI** + SLA pill, **textarea** ghi chú |
| `Tới ›` pager | **Sau ›** |
| TaskActionBar | **FocusActionBar** with icons |

---

## 4. No duplicated left panel

**Confirmed:** `CompactSidebar` removed; only `OperatorMainSidebar` via `Sidebar.tsx`.

---

## 5. No duplicated right panel

**Confirmed:** `DetailPanel` hidden on `/inbox` V3; only `RightContextTabs`. Task detail feeds tabs via `taskDetail` prop (no duplicate title/actions in center).

---

## 6. Routes

| Route | Behavior |
|-------|----------|
| `/inbox` | Image B Focus Runtime default |
| `/inbox/:id` | Focus + right tab detail |

---

## 7. Component layout

```text
WorkInboxV3ImageBLayout
└─ WorkInboxFocusRuntime
   ├─ FocusTaskWorkspace (FocusHeader, QuickContextBadges, TaskMetadataRow, FocusContentCards, FocusActionBar, NextTaskCard)
   └─ RightContextTabs
```

---

## 8. Handler binding

| Control | Status |
|---------|--------|
| ▶ Bắt đầu xử lý | Bound → `handleOpenFocusItem` |
| ⏸ / Chuyển giao / … | Toast fallback |
| Quick actions (right) | Toast fallback |
| Checklist checkbox | Toast on change (no persist) |
| Ghi chú textarea | Toast on blur if edited |
| ADMIN ▾ | Toast fallback |

---

## 9. Test result table

| Check ID | Result |
|----------|--------|
| UI_IMAGE_B_LAYOUT_RENDER | PASS |
| UI_SINGLE_LEFT_SIDEBAR_ONLY | PASS |
| UI_NO_NESTED_LEFT_PANEL | PASS |
| UI_SINGLE_RIGHT_CONTEXT_PANEL_ONLY | PASS |
| UI_NO_LEGACY_RIGHT_DETAIL_PANEL | PASS |
| UI_FOCUS_MODE_HEADER_RENDER | PASS |
| UI_QUICK_BADGES_RENDER | PASS |
| UI_ACTION_BAR_RENDER | PASS |
| UI_PRIMARY_ACTION_BOUND | PASS |
| UI_SECONDARY_ACTION_SAFE_FALLBACK | PASS |
| UI_RIGHT_TABS_SWITCH | PASS |
| UI_PREV_NEXT_NAVIGATION | PASS |
| UI_BACK_TO_INBOX | PASS |
| UI_BOTTOM_STATUS_BAR_RENDER | PASS |
| UI_1366x768_VIEWPORT_SAFE | PASS |
| UI_NO_HORIZONTAL_SCROLL | PASS |

`npm run typecheck` PASS · `npm run build` PASS

---

## 10. Known warnings

- Ghi chú / checklist: UI-only, không ghi TASK_MAIN
- Timeline/Handoff tabs: placeholder
- `createdAt` DTO: hiển thị từ `updatedAt` khi thiếu cột tạo

---

## 11. Manual verification checklist

- [ ] Layout khớp ảnh B (nền sáng, card trắng, primary xanh)
- [ ] Sidebar: Việc của tôi active + badge
- [ ] FOCUS MODE + 1/97 + ‹ Trước / Sau ›
- [ ] 5 quick badges
- [ ] AI TÓM TẮT / CHECKLIST checkbox / THÔNG TIN LIÊN QUAN rows
- [ ] ▶ Bắt đầu xử lý + secondary + toast
- [ ] VIỆC TIẾP THEO + counter + Xem tiếp →
- [ ] Right tab Chi tiết: SLA OK, textarea, quick actions
- [ ] Không cột DetailPanel cũ
- [ ] Footer không che CTA (1366×768)
- [ ] Topbar: mã việc placeholder, ✓ Việc vận hành, ADMIN ▾

---

## 12. Next recommended phase

1. Persist ghi chú qua TASK_UPDATE_LOG (when approved)
2. Timeline tab ← log adapter
3. Attach real files in Tài liệu tab

---

## 13. Git

Branch: `phase/from-v2.4.1-TASK-FIN-runtime-freeze` · Commit: not requested

---

## Envelope

```json
{
  "contractVersion": "CBV_TCS_V1",
  "phase": "PHASE_UI_CBV_WORK_INBOX_V3_FINAL_IMAGE_B_IMPLEMENTATION",
  "status": "GO",
  "domain": "WEBAPP_FE"
}
```
