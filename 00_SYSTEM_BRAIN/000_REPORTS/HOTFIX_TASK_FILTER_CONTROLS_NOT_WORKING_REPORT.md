# HOTFIX — Task Filter Controls Not Working — Report

**Date:** 2026-05-28  
**Phase:** `HOTFIX_TASK_FILTER_CONTROLS_NOT_WORKING`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS**

---

## 1. Root cause

**Primary:** Filter state was **URL-only** (`searchParams.get('filter')`). Click handlers called `setSearchParams`, but React re-render could lag or fail to propagate before queue derivation, while **feedback text** (`showFilterFeedback`) updated from local state immediately — creating “Đã áp dụng bộ lọc…” without visible tab/queue change.

**Secondary:**
- Prop named `filter` instead of explicit `activeFilter` — harder to trace controlled flow
- Early return `if (f === filter) return` blocked re-sync edge cases
- Active CSS class `active` (generic) vs explicit `task-filter-tab-active` — easier to override/miss
- Tab keys scattered in `TASK_FILTERS` constant without canonical `TaskFilterKey` map

---

## 2. Fix applied

### A. Local state as source of truth
```typescript
const [activeFilter, setActiveFilter] = useState(...)
const [activeGroupMode, setActiveGroupMode] = useState(...)
// Click: setActiveFilter(f) FIRST, then sync URL
```

### B. Canonical filter keys
`shared/constants/taskFilterKeys.ts` — `TASK_FILTER_TABS` + `normalizeTaskFilterKey`

### C. TaskControlSurface controlled props
- `activeFilter` → tab `aria-selected` + `task-filter-tab-active`
- `onGroupModeChange` (controlled select)
- `onFocusQueueModeChange(!focusQueueMode)`

### D. Explicit CSS (hex tokens)
`.task-filter-tab-active`, `[aria-selected="true"]` — `#dbeafe` / `#60a5fa` border

### E. Debug
`logFilterClick({ nextFilter, activeFilterBefore, activeFilterAfter, ... })` when `VITE_CBV_FILTER_DEBUG=true`

---

## 3. Files changed

| File | Change |
|------|--------|
| `shared/constants/taskFilterKeys.ts` | **New** — canonical keys |
| `modules/task/TasksPage.tsx` | `activeFilter` / `activeGroupMode` local state + handlers |
| `components/ui/TaskControlSurface.tsx` | `activeFilter`, renamed handlers |
| `components/ui/QuickFocusFilters.tsx` | `quick-focus-chip-active` class |
| `shared/utils/taskFilterDebug.ts` | `logFilterClick` |
| `shared/utils/taskFilterRuntime.ts` | Use TASK_FILTER_TABS |
| `styles/index.css` | Explicit hotfix active CSS |
| `modules/task/taskFilterControlsHotfixChecks.ts` | **New** — 9 checks |

---

## 4. Before / after

| Action | Before | After |
|--------|--------|-------|
| Click tab | Feedback maybe; tab/queue uncertain | `setActiveFilter` instant → tab active + queue recomputes |
| Click same tab | Early return, no op | Re-applies (state + feedback) |
| Group select | URL-only | `setActiveGroupMode` + URL |
| Focus toggle | Local state OK, weak visual | Controlled + `focus-queue-toggle-active` |
| Quick chip | Logic OK, weak visual | `quick-focus-chip-active` + aria-pressed |

---

## 5. Manual test checklist

1. Click each tab — active blue border/bg, count changes  
2. Switch tabs — previous loses active, new gains active  
3. Group Cognition ↔ Trạng thái — grouping changes  
4. Focus toggle — aria-pressed + visual + fewer rows  
5. Quick focus — chip active state visible  
6. `VITE_CBV_FILTER_DEBUG=true` — `[CBV filter click]` logs on each click  

---

## 6. Validation

`runTaskFilterControlsHotfixChecks()` — **9/9 PASS**

---

## 7. Build

```
npm run build — PASS (~9s)
```

---

## 8. Known limits

- Quick focus / focus mode still localStorage (not URL) — unchanged  
- Sidebar nav to `/tasks?filter=overdue` syncs via `searchParams` useEffect  
