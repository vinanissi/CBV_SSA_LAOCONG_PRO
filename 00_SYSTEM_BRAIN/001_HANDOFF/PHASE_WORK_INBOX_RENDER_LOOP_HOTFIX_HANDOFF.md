# PHASE_WORK_INBOX_RENDER_LOOP_HOTFIX — Handoff

**Status:** GO

## Shipped

- Stable `DetailPanel` callbacks with equality guards (`setDetail`, `clearDetail`)
- Broke `showPanel` ↔ `bumpDetailContent` ↔ `setDetail` identity loop in `TasksPage`
- Guarded `publishMetrics` / `setViewMode` in `WorkInboxLayoutContext`
- Guarded focus view-mode sync in `WorkInboxGroupsPanel`
- Static suite `workInboxRenderLoopHotfixChecks.ts` (13 checks)

## Verify

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxRenderLoopHotfixChecks } from './src/modules/task/inbox/performance/workInboxRenderLoopHotfixChecks.ts'; console.log(runWorkInboxRenderLoopHotfixChecks());"
npm run build
```

Manual: `/inbox` — no console depth error; task count matches runtime.

## Do not regress

- Stable `STABLE_DETAIL_PANEL_INVOKER` pattern for legacy detail panel
- Operational fetch loop hotfix (`stableTaskId`, single bundle fetch)
- Network hygiene / snapshot refresh policy
- TASK_MAIN visibility baseline (SHARED_WITH / IS_PRIVATE)

## Mapping (prompt file names)

| Prompt name | Actual path |
|-------------|-------------|
| DetailPanel.tsx | `apps/workboard/src/components/layout/DetailPanel.tsx` |
| FocusPanel.tsx | `WorkInboxFocusPanel.tsx` (no effects) |
| WorkInbox.tsx | `WorkInboxShell.tsx` + `WorkInboxGroupsPanel.tsx` |
| TaskSelectionStore | `TasksPage` `selectedTaskIdRef` + selection effects |
| TaskDetailStore | `TasksPage` detail state + `DetailPanel` provider |
