# PHASE Focus Runtime Fix — AI Handoff

**To:** Next agent (`PHASE_HOME_ALERT_RUNTIME_BINDING` or `PHASE_OPERATOR_UI_DENSITY_POLISH`)  
**From:** `PHASE_FOCUS_RUNTIME_FIX`  
**Date:** 2026-05-30  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_FOCUS_RUNTIME_FIX_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_FOCUS_RUNTIME_ACTIONS.md`

---

## What was delivered

1. **Focus actions wired** — complete, pause, forward, primary (accept + open).
2. **`useFocusTaskActions`** hook — centralizes API calls + pending + toasts.
3. **Sidebar 404 fixed** — `/observation`, `/plugins`.
4. **Handoff decision** — Focus forward = status WAITING only; no false assign claim.
5. **Build + Worker security tests PASS.**

---

## Read first

1. `000_REPORTS/PHASE_FOCUS_RUNTIME_FIX_REPORT.md`
2. `000_REPORTS/PHASE_SECURITY_RUNTIME_FIX_REPORT.md`
3. `apps/workboard/src/modules/task/useFocusTaskActions.ts`
4. `apps/workboard/src/modules/task/TasksPage.tsx` (search `useFocusTaskActions`)

---

## WIRED path (copy for debugging)

```text
FocusActionBar / WorkInboxFocusModeV3
  → onFocusComplete | onFocusPause | onFocusForward | onFocusPrimary
  → useFocusTaskActions (TasksPage)
  → api.completeTask | api.updateTaskStatus | runHandoff
  → Worker (secured) → GAS TASK_MAIN + TASK_UPDATE_LOG
  → loadWorkspace(true)
```

---

## Do NOT redo

- Worker `taskPermissions` / snapshot filter
- Focus → API wiring (unless regression)

---

## Known gaps

| Gap | Next phase |
|-----|------------|
| Focus assignee picker → `POST /assign` | Future focus UX or detail panel |
| `/api/today` mock | HOME_ALERT binding |
| RightContextTabs stub actions | Optional polish |

---

## Next phase options

**PHASE_HOME_ALERT_RUNTIME_BINDING**

- Worker routes for `HOME_ALERT` claim/resolve
- Replace `/api/today` mock

**PHASE_OPERATOR_UI_DENSITY_POLISH**

- Visual density only; runtime already wired

---

## Test commands

```bash
cd apps/workboard && npm run build
cd workers/api && npm run typecheck && npm run test:permissions
```

---

*Append-only handoff.*
