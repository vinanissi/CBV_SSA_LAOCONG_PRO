# PHASE_TASK_GS_10D_2 — Filter Active State Visual Fix — Report

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_GS_10D_2_FILTER_ACTIVE_STATE_VISUAL_FIX`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS**

---

## 1. Executive summary

GS_10D fixed filter **logic**; operators still reported tabs “bấm mà nút không đổi” because active styling was too subtle (no border, no inactive background, weak contrast on `surface-raised` strip).

This phase strengthens **visual + ARIA active state** for all operational controls without changing filter semantics.

---

## 2. Root cause

| Issue | Detail |
|-------|--------|
| `.task-control-tab.active` | Only `bg-blue-100` — no border; blended into strip |
| Inactive tabs | Transparent background — indistinguishable from strip |
| Class naming | `task-control-tab` vs expected `task-filter-tab` |
| Quick focus / Focus | Had `.active` class but low contrast borders |
| Group select | Looked like generic border input |

Logic and `aria-selected` were already wired in GS_10D; **CSS/visual layer** was the gap.

---

## 3. Changes

### TaskControlSurface
- Tabs use `task-filter-tab` + conditional `active` class
- `aria-selected={isActive}` tied to `filter === f.key`
- `data-filter` attribute for debugging

### QuickFocusFilters
- `aria-pressed={isActive}` + `active` class when chip selected
- `aria-label` per chip

### GroupModeSelect
- Blue-bordered wrapper `group-mode-select-wrap`
- Semibold select + mode badge (sm+)

### CSS (`styles/index.css`)
- `.task-filter-tab` — inactive: `bg-slate-50`, active: `border-blue-400 bg-blue-100 text-blue-950 font-semibold`
- Attribute selectors: `[aria-selected='true']`, `[aria-pressed='true']`
- Focus toggle: `border-blue-500 bg-blue-50 text-blue-900` when pressed
- Quick chips: matching blue active treatment

---

## 4. Validation

`runTaskFilterActiveStateVisualChecks()` — **7/7 PASS**

---

## 5. Manual acceptance

1. Open `/tasks` — “Việc của tôi” tab shows blue border + blue-100 background  
2. Click “Quá hạn” — previous tab loses active style; new tab highlights immediately  
3. Toggle quick focus chip — chip gets blue border/bg  
4. Toggle ◎ Focus — button shows blue active state  
5. Change group select — wrapper remains visually distinct  

---

## 6. Files touched

- `components/ui/TaskControlSurface.tsx`
- `components/ui/QuickFocusFilters.tsx`
- `components/ui/GroupModeSelect.tsx`
- `styles/index.css`
- `modules/task/taskFilterActiveStateVisualChecks.ts` (new)

---

## 7. Known limits

- Theme-dark overrides not re-tested separately — styles use explicit slate/blue tokens for operational light console  
- Group badge hidden on xs (`sm:inline`) — select value still visible  

---

## 8. Build

`npm run build` — PASS
