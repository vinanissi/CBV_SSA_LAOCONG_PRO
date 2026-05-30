# HANDOFF — PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH

## What shipped

Work Inbox V3 Focus is denser: preview cards in the **main workspace right column**, tighter vertical rhythm, **70vh** focus region, right panel **360–400px**.

## Architecture (unchanged)

```
Sidebar (220px) | focus-workspace (flex, ~70vh) | right-context-tabs (392px, portal)
```

## New components

- `apps/workboard/src/modules/task/inbox/focusRuntime/FocusPreviewCards.tsx`
  - `TimelinePreviewCard` — uses existing `TaskDetail.timeline`
  - `HandoffPreviewCard` — assignee + pendingAction/nextStep
  - `DocumentsPreviewCard` — conditional on `files.length > 0`

## Data flow

```
TasksPage (loads TaskDetail)
  → WorkInboxFocusRuntime (taskDetail, detailLoading)
    → FocusTaskWorkspace (activeDetail = match current taskId)
      → FocusContentCards → preview cards
```

No new API calls.

## Verify

```bash
cd apps/workboard && npm run typecheck && npm run build
```

Open `/inbox` at **1366×768** — confirm AI summary, checklist, related info, timeline preview, action bar visible with light scroll.

**Checks:** `focusRuntimeOperatorDensityPolishChecks.ts`

## Regression risks

- Re-adding `flex-1` on `main-canvas` will restore bottom whitespace
- Moving preview cards into `RightContextTabs` would duplicate context (avoid)

## Docs

- Report: `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH_REPORT.md`
- Evidence: `005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH_TEST_EVIDENCE.md`
- Test console: `000_TEST_CONSOLE/PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH/README.md`
