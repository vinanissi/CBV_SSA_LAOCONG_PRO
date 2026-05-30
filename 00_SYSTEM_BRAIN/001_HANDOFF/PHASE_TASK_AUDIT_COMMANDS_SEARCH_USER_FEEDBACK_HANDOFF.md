# PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK — Handoff

**Date:** 2026-05-28  
**From:** Audit phase (inventory + report complete)  
**To:** Controlled fix phases — **do not batch all fixes in one PR**  
**Inventory:** [`003_AUDIT/TASK_COMMAND_SEARCH_FEEDBACK_INVENTORY.md`](../003_AUDIT/TASK_COMMAND_SEARCH_FEEDBACK_INVENTORY.md)  
**Report:** [`000_REPORTS/PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK_REPORT.md`](../000_REPORTS/PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK_REPORT.md)

---

## Audit outcome (frozen facts)

- **78** command/search touchpoints inventoried  
- **1 BROKEN:** alert header false all-clear on API failure  
- **6 NO_OP:** FileList, panel call/follow local-only, workspace q-search, HoSo search, drawer TODO sections  
- **10 NEEDS_FEEDBACK:** task row accept/complete/inline execution chain  
- **Build:** PASS (`npm run build` apps/workboard)  
- **No code changes** in audit phase  

---

## Fix phase plan

Each phase is independently shippable. Follow CBV Operational Standard V1: runtime-first, no layout redesign, manual-first.

---

### Phase A — `SEARCH_FEEDBACK_FIX`

**Goal:** Operator always knows what search did.

| Task | File(s) | Acceptance |
|------|---------|------------|
| Add error UI when `api.search` fails | `SearchPage.tsx` | ErrorState or inline banner with retry |
| Add `.catch()` network handler | `SearchPage.tsx` | Same |
| Sync TopBar input from `useSearchParams` on `/search` | `TopBar.tsx` | Query visible after navigate |
| Empty submit feedback | `TopBar.tsx` | Hint or shake — no silent no-op |
| Optional: clear button | `TopBar.tsx` | Clears input + navigates `/search` without q |
| Footer "Tìm kiếm" focus header or preserve last q | `RuntimeStatusBar.tsx` | Document chosen behavior |

**Out of scope for A:** Debounced live search, HoSo page search, wiring TasksPage `q` param (→ Phase B if needed).

**Validation:** Manual — submit query, empty submit, simulate API fail (offline worker), verify states.

---

### Phase B — `COMMAND_HANDLER_FIX`

**Goal:** No clickable element lies about being actionable.

| Task | File(s) | Acceptance |
|------|---------|------------|
| Alert header API failure → degraded strip | `OperationalAlertHeader.tsx`, `OperationalAlertStrip.tsx` | Never show all-clear on fetch fail |
| FileList: disable or wire preview | `FileList.tsx` | No clickable no-op buttons |
| Panel Gọi/Follow-up: API comment or explicit "local start" label | `OperationalContextPanel.tsx` | Operator understands effect |
| SLA footer label vs route | `constants/index.ts` or `RuntimeStatusBar.tsx` | Label matches destination OR route changes |
| Remove or archive dead `QuickActionBar` | `QuickActionBar.tsx`, docs | No duplicate unmaintained surface |

**Optional (separate sub-PR):** Wire `getTaskWorkspaceSnapshot({ q })` for in-page task search.

**Validation:** `runTaskOperationalAlertHeaderChecks` extended; manual FileList click.

---

### Phase C — `DISABLED_STATE_FIX`

**Goal:** Disabled and "Sắp mở" states are honest everywhere.

| Task | File(s) | Acceptance |
|------|---------|------------|
| Fix shortcut hint R = resume not refresh | `RuntimeStatusBar.tsx` | Copy matches `TasksPage` keydown |
| Drawer TODO sections: visually disabled or collapsed by default | `RuntimeFooterDrawer.tsx` | Not mistaken for live data |
| Logout button disabled while pending | `TopBar.tsx` | Prevents double-click |
| Quick focus `aria-pressed` | `QuickFocusFilters.tsx` | a11y pass |

**Validation:** Visual + keyboard R on /tasks.

---

### Phase D — `RUNTIME_TOAST_INLINE_FEEDBACK_FIX`

**Goal:** Every mutation shows pending + outcome without redesign.

| Task | File(s) | Acceptance |
|------|---------|------------|
| Shared `useTaskActionFeedback` or inline pattern | new util + consumers | DRY pending/error/success |
| Row ▶/✓ pending disable | `TaskCard.tsx`, `TasksPage.tsx` | Button disabled + spinner during API |
| API error on accept/complete | `TasksPage.tsx` | Inline strip or toast at task zone |
| `useInlineExecution` error callback | `useInlineExecution.ts`, strips | Error surfaced on fail |
| NextStepCompletionPrompt error | `OperationalContextPanel.tsx` | Failed comment shows message |

**Design constraint:** Prefer **inline** feedback in task-runtime-zone (consistent with forms). Global toast only if inline proves insufficient.

**Validation:** Mock API fail injection; verify no silent fail.

---

### Phase E — `ACCESSIBILITY_FIX`

**Goal:** Screen reader and keyboard parity.

| Task | File(s) | Acceptance |
|------|---------|------------|
| `aria-label` on header search | `TopBar.tsx` | Matches placeholder intent |
| SearchPage light-theme text colors | `SearchPage.tsx` | Readable on operational light shell |
| Task card keyboard: article vs button nesting | `TaskCard.tsx` | Enter opens task reliably |
| Filter tabs roving tabindex (optional) | `TaskControlSurface.tsx` | Arrow key nav between tabs |

**Validation:** axe or manual VoiceOver/NVDA spot check.

---

## Suggested execution order

```
A (SEARCH_FEEDBACK_FIX)
  → B (COMMAND_HANDLER_FIX)
  → D (RUNTIME_TOAST_INLINE_FEEDBACK_FIX)  ← highest operator impact
  → C (DISABLED_STATE_FIX)
  → E (ACCESSIBILITY_FIX)
```

Phase D may start in parallel with B if different owners — no file overlap on alert vs execution feedback.

---

## New validation suite (recommended)

Add `apps/workboard/src/modules/task/taskCommandSearchFeedbackChecks.ts`:

- SearchPage handles `!res.ok` in source  
- TopBar syncs search params  
- FileList buttons have handler or `disabled`  
- OperationalAlertHeader handles fetch failure  
- TasksPage accept/complete sets pending state  

Invoke manually in browser console like existing GS check suites.

---

## Explicit non-goals (all fix phases)

- UI layout redesign  
- Backend/GAS automation beyond existing APIs  
- Deleting footer buttons  
- Fake success when API fails  
- Hiding broken buttons without disabled/TODO label  
- Implementing upload flow (remain EXECUTION_LOCKED)  
- Wiring drawer SLA/Memory until runtime feeds exist  

---

## Handoff checklist for implementer

- [ ] Read full inventory before first fix PR  
- [ ] One phase = one PR preferred  
- [ ] Append to audit report section 10 with build result after each phase  
- [ ] Run `npm run build` before merge  
- [ ] Manual smoke: search, create task, accept, complete, console drawer  
- [ ] Do not remove TASK_MAIN PRO baseline behaviors  

---

**Audit phase: COMPLETE. Ready for Phase A (`SEARCH_FEEDBACK_FIX`).**
