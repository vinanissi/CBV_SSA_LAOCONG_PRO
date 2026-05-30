# PHASE UI Runtime Trace Audit — AI Handoff

**To:** Next agent (PHASE_UI_DB_DESIGN_IMPLEMENTATION_01)  
**From:** `PHASE_UI_RUNTIME_TRACE_AUDIT`  
**Date:** 2026-05-30  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_RUNTIME_TRACE_AUDIT_REPORT.md`  
**ADR (draft):** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`

---

## What was delivered

1. **42 CTA traces** UI → Sheet (or documented breakpoint).
2. **Focus Mode breakpoint** documented — handlers not passed; V3 buttons disabled; Runtime shows toast stub.
3. **Route 404:** `/observe`, `/config` in `OperatorMainSidebar.tsx`.
4. **Source of truth:** TASK_MAIN + TASK_UPDATE_LOG (GS_01); TASKS/TASK_TIMELINE legacy RF12; HOME_ALERT projection without FE write path.
5. **AppSheet:** Env + module links in repo; **not** workboard inbox data path.
6. **Permission gaps:** `canUpdateTask` not on status/complete/comment Worker handlers.
7. **Fix order** 11 steps for implementation phases.

---

## Read first

1. `000_REPORTS/PHASE_UI_RUNTIME_TRACE_AUDIT_REPORT.md`
2. `000_REPORTS/PHASE_UI_DB_DESIGN_AUDIT_REPORT.md`
3. `002_DECISIONS/ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md` (DRAFT)
4. `apps/workboard/src/modules/task/TasksPage.tsx`
5. `apps/workboard/src/modules/task/useInlineExecution.ts`

---

## Critical breakpoints (fix first)

| # | Breakpoint | File |
|---|------------|------|
| 1 | Focus actions never reach API | `WorkInboxFocusModeV3.tsx`, `FocusActionBar.tsx`, `WorkInboxGroupsPanel.tsx` |
| 2 | Sidebar 404 | `OperatorMainSidebar.tsx` |
| 3 | Task write no row authZ | `workers/api/src/modules/taskGsDb.ts` |
| 4 | Handoff = status only, not assign | `useInlineExecution.ts` runHandoff |
| 5 | /api/today = mock, not HOME_ALERT | `workers/api/src/modules/workboard.ts` |

---

## WIRED path reference (task writes — copy this pattern)

```text
TaskCard / handleComplete
  → api.completeTask
  → POST /api/tasks/:id/complete
  → gsCompleteTask (googleSheetTaskDbAdapter)
  → GAS taskDbCompleteTask_
  → TASK_MAIN + TASK_UPDATE_LOG (+ CBV_AUDIT_LOG if present)
  → taskFeedback UI toast
```

**Requires:** `VITE_CBV_API_BASE_URL` + `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db` + GAS deployed.

---

## Code path note

User prompt referenced `apps/workboard/src/features/tasks/` — **does not exist**. Use:

- `apps/workboard/src/modules/task/`
- `apps/workboard/src/modules/task/inbox/`

---

## Next phase

**PHASE_UI_DB_DESIGN_IMPLEMENTATION_01_IA_AND_FOCUS_ACTIONS**

- Fix sidebar routes
- Wire Focus to `useInlineExecution`
- Do **not** change permission matrix or HOME_ALERT in phase 01

Prompt in report §15.

---

## Do NOT

- Modify this report (append-only)
- Enable RF12 TASKS writes from new UI code
- Add Test Console to operator sidebar
- Hard-code new permission matrix in FE

---

## Git

No commit performed (not requested).

---

*Append-only handoff — PHASE_UI_RUNTIME_TRACE_AUDIT — 2026-05-30*
