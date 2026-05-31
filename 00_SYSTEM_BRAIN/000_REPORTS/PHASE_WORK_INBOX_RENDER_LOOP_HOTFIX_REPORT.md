# PHASE_WORK_INBOX_RENDER_LOOP_HOTFIX — Report

**Verdict:** GO  
**Date:** 2026-05-31

---

## 1. Symptom

| Signal | Observation |
|--------|-------------|
| Console | `Maximum update depth exceeded` — stack at `DetailPanel.tsx:52` (`setTitle` inside `setDetail`) |
| Data | TASK_MAIN ~98 tasks in runtime |
| UI | Inbox list showed ~4 tasks; filter mine + cognition unstable; runtime degraded |

---

## 2. Root cause

| Layer | Cause |
|-------|--------|
| **DetailPanel (TaskDetailStore)** | `setDetail` / `clearDetail` were recreated inside `useMemo` whenever `contentRevision` changed. Each `bumpDetailContent()` produced a new `setDetail` reference. |
| **TasksPage ↔ DetailPanel loop** | `showPanel` depended on `setDetail` + called `bumpDetailContent()` when `!loading`. Effect `[detail?.taskId, showPanel]` re-ran → `showPanel` → `bumpDetailContent` → new `setDetail` → infinite loop on legacy/detail path. |
| **WorkInboxLayoutContext** | `publishMetrics` always `setMetrics(next)` with a fresh KPI object each render → context churn → parent/child re-render amplification. |
| **WorkInboxGroupsPanel** | `setViewMode('focus')` without equality guard on selected-task sync effect. |

**Not involved:** `WorkInboxFocusPanel.tsx` (FocusPanel) and `WorkInboxShell.tsx` (WorkInbox shell) have **no** `useEffect`. **TaskSelectionStore** maps to `TasksPage` `selectedTaskIdRef` + selection effects — no separate store module.

---

## 3. Files changed

| File | Change |
|------|--------|
| `DetailPanel.tsx` | Stable `useCallback` for `setDetail` / `clearDetail` with `prev === next` guards |
| `WorkInboxLayoutContext.tsx` | `metricsEqual` + guarded `publishMetrics`; `setViewModeGuarded` |
| `WorkInboxGroupsPanel.tsx` | Guarded `setViewMode` when syncing focus from `selectedTaskId` |
| `TasksPage.tsx` | Remove `bumpDetailContent` from `showPanel`; narrow detail bump effect deps |
| `workInboxRenderLoopHotfixChecks.ts` | **NEW** — 13 static checks |

No runtime redesign. No schema / GAS / filter logic changes.

---

## 4. Before / after

| Scenario | Before | After |
|----------|--------|-------|
| Open task + detail panel | `setDetail` → `bumpDetailContent` → new `setDetail` → effect loop | Stable callbacks; bump only from dedicated effect |
| Inbox KPI publish | New metrics object every parent render | Skip `setState` when values unchanged |
| Console | `Maximum update depth exceeded` | **Expected: none** |
| Task list count | Truncated / unstable under loop | Matches `inboxRuntimeTasks` / group buckets from snapshot |

---

## 5. Test results

`runWorkInboxRenderLoopHotfixChecks()` — **13/13 GO**  
`npm run build` (workboard) — **PASS**

---

## 6. Manual verification

1. Restart `npm run dev`, hard refresh `/inbox`.
2. Console: confirm **no** `Maximum update depth exceeded`.
3. KPI strip total ≈ snapshot task count (e.g. 98 when runtime has 98).
4. Switch filter **mine** + group **cognition** — list stable, no flicker loop.
5. Open a task → focus runtime loads; no runaway re-renders in React DevTools Profiler.

---

## 7. Remaining risks

- `TasksPage` detail bump effect still runs on `inlineExec` / `feedbackMap` changes (by design for panel refresh); not a loop with stable `setDetail`.
- Large snapshots + soft refresh still rebuild task arrays; guards reduce churn but do not remove intentional refresh.
