# PHASE_TASK_GS_10D — Operational Filter Runtime Fix — Report

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_GS_10D_OPERATIONAL_FILTER_RUNTIME_FIX`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~9.4s)  
**Audit:** [`003_AUDIT/TASK_OPERATIONAL_FILTER_RUNTIME_AUDIT.md`](../003_AUDIT/TASK_OPERATIONAL_FILTER_RUNTIME_AUDIT.md)

---

## 1. Executive summary

Fixed operational filter **interaction trust** in CBV_TASK Workboard. Filter tabs, group mode, quick focus, and focus toggle now drive a **single queue derivation pipeline** with visible feedback, honest empty states, and correct row counts.

Root causes: fragmented filter logic, weak `isMine` matching, approval/pending overlap, focus mode cosmetic-only, no feedback on filter change, selected task left open when filtered out.

---

## 2. Root cause

1. **No single source of truth** — filter/group/quick/focus spread across multiple `useMemo` blocks in `TasksPage.tsx`
2. **`mine` filter fragile** — relied on server `isMine` without client owner/reporter ID normalization
3. **Semantic overlap** — `WAITING` in both pending and approval tabs
4. **Focus toggle** — only changed card CSS, not visible queue composition
5. **No operator feedback** — tab active state changed without count/message confirmation
6. **Selection leak** — detail panel stayed open when task dropped from filtered view

---

## 3. Filter semantics mapping

| Tab | Rule |
|-----|------|
| Việc của tôi | `isTaskMineForOperator` (ownerId/reporterId/userCode/displayName) |
| Chờ xử lý | NEW, ASSIGNED, IN_PROGRESS, WAITING — excludes WAITING_APPROVAL |
| Quá hạn | `isOverdue` / `urgency.isOverdue` / `dueDate < today` |
| Chờ duyệt | WAITING_APPROVAL only |

Operator unknown → mine tab empty + warning (no silent show-all).

---

## 4. Files changed

| File | Change |
|------|--------|
| `shared/utils/taskFilterRuntime.ts` | **New** — derivation contract |
| `shared/utils/taskFilterDebug.ts` | **New** — env-gated debug |
| `modules/task/TasksPage.tsx` | Single `deriveVisibleTaskRuntime`; handlers + selection cleanup |
| `components/ui/TaskControlSurface.tsx` | Filter feedback strip; queue summary |
| `components/ui/QuickFocusFilters.tsx` | `aria-label` on group |
| `styles/index.css` | Feedback + degraded note styles |
| `modules/task/taskOperationalFilterRuntimeChecks.ts` | **New** — 13 checks |
| `.env.example` | `VITE_CBV_FILTER_DEBUG` |

---

## 5. Queue derivation contract

```typescript
deriveVisibleTaskRuntime({
  snapshot, filter, groupMode, quickFocus, focusQueueMode, operator, pinnedTaskId
})
→ { visibleTasks, groups, flatTasks, counts, summaryText, filterNotice, emptyTitle, emptyMessage, warnings }
```

---

## 6. Selected task behavior

When active filter removes the selected task from `flatTasks`:
- Close detail panel
- Navigate to `/tasks?<current query>` (no taskId in path)
- Show: “Việc đang chọn không thuộc bộ lọc hiện tại — đã đóng panel.” (5s)

---

## 7. Visible feedback behavior

- Inline strip under controls: “Đã áp dụng bộ lọc: …” (4s) on tab/group/quick/focus change
- Queue header: `{N} việc · {M} nhóm` (+ quick focus suffix)
- Per-filter empty state titles/messages
- Degraded amber note when mine filter can't resolve operator

---

## 8. Accessibility updates

- Filter tabs: existing `role="tablist"` / `role="tab"` / `aria-selected`
- Group select: `aria-label="Hiển thị theo"`
- Focus toggle: `aria-pressed`
- Quick chips: `aria-pressed` + `role="group" aria-label="Quick focus"`
- Feedback strip: `role="status" aria-live="polite"`

---

## 9. Debug instrumentation

`VITE_CBV_FILTER_DEBUG=true` → `console.debug('[CBV filter]', { event, filter, groupMode, focusMode, visibleCount, … })`

Off by default — no production spam.

---

## 10. Validation result

`runTaskOperationalFilterRuntimeChecks()` — **13/13 PASS**

---

## 11. Build result

```
dist/assets/index-D5dMgVXN.js   411.34 kB │ gzip: 125.09 kB
✓ built in 9.35s
```

---

## 12. Screenshots requested

Manual capture after `npm run dev`:

1. Default “Việc của tôi” with count summary  
2. “Chờ xử lý” with updated rows  
3. “Quá hạn” aligned with runtime overdue count  
4. “Chờ duyệt” empty or populated  
5. Cognition vs Trạng thái grouping  
6. Focus mode active (reduced rows + feedback)  
7. Filter debug log with `VITE_CBV_FILTER_DEBUG=true`

*(Screenshots not captured in automated run — operator manual step.)*

---

## 13. Known limitations

- Quick focus still stacks on tab filter (by design) — feedback shows both  
- Focus mode hides BACKGROUND/AWARENESS tasks, not virtualization  
- Overdue count in runtime footer uses snapshot counts; tab uses same derivation rules but may differ if quick focus active  
- Filter state in URL (`filter`, `group`); quick focus + focus mode in localStorage/working context only  

---

## Next recommended phase

`PHASE_TASK_GS_10E_DETAIL_PROVIDER_ISOLATION` — panel updates should not re-render full queue (from GS_10C audit).
