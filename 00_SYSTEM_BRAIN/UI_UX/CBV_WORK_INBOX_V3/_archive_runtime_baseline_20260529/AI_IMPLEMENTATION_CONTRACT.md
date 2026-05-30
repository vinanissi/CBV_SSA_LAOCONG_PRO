# CBV_WORK_INBOX_V3 — AI Implementation Contract

**Version:** V3.0 · **Date:** 2026-05-29  
**Audience:** Cursor agents, FE developers, automated implementers

---

## 1. Contract authority

This file plus the numbered specs (`001`–`013`) form the **binding design contract** for CBV_WORK_INBOX_V3.

When code and contract conflict:
1. **Runtime safety** wins (do not break production paths)
2. **This contract** wins over agent improvisation
3. **Existing implemented behavior** wins if contract is aspirational — file a report note

---

## 2. Mandatory read order

Before any Work Inbox change, read:

1. `001_UI_PRINCIPLES.md`
2. `008_ROUTING_CONTRACT.md`
3. `005_COMPONENT_LIBRARY.md`
4. `006_DESIGN_TOKENS.md`
5. Task-specific spec (010–012)

---

## 3. Hard rules (NEVER)

| # | Rule |
|---|------|
| N1 | Do NOT rewrite AppShell layout structure |
| N2 | Do NOT remove RuntimeStatusBar or DetailPanel |
| N3 | Do NOT add filter keys without GAS/runtime alignment |
| N4 | Do NOT show USER_CODE as primary card label |
| N5 | Do NOT auto-assign, auto-resolve, or auto-escalate |
| N6 | Do NOT mutate TASK_MAIN schema |
| N7 | Do NOT overwrite files in `00_SYSTEM_BRAIN/UI_UX/` — append versioned copies |
| N8 | Do NOT overwrite historical reports/handoffs |
| N9 | Do NOT use AppSheet Bot, Virtual Columns, or production triggers |
| N10 | Do NOT blank queue on degraded API if snapshot exists |
| N11 | Do NOT commit unless user explicitly requests |
| N12 | Do NOT implement Kanban/timeline/mobile-first in V3 scope |

---

## 4. Required patterns (ALWAYS)

| # | Pattern |
|---|---------|
| A1 | Use API envelope `{ ok, data, warnings, errors, traceId }` |
| A2 | Sync filter/group to URL search params |
| A3 | Resolve display names via `usersById` / `runtimeIdentity` |
| A4 | Gate actions with `canPerformInlineAction` / capabilities |
| A5 | Use existing CSS component classes from `index.css` |
| A6 | Use Tailwind tokens from `tailwind.config.ts` |
| A7 | Preserve `data-filter` on filter tabs for tests |
| A8 | Show pending state during inline writes |
| A9 | Append-only feedback — no destructive UI history edits |
| A10 | Match Vietnamese operator copy via `FEEDBACK_COPY` / constants |

---

## 5. File touch map

| Change type | Likely files |
|-------------|--------------|
| Inbox page logic | `modules/task/TasksPage.tsx` |
| Card UI | `components/ui/TaskCard.tsx` |
| Controls | `components/ui/TaskControlSurface.tsx` |
| Detail | `components/layout/DetailPanel.tsx`, `OperationalContextPanel.tsx` |
| Filter runtime | `shared/utils/taskFilterRuntime.ts` |
| Identity | `runtime/runtimeIdentity.ts`, `runtime/userDisplay.ts` |
| Routes | `app/routes.tsx` |
| Styles | `styles/index.css`, `tailwind.config.ts` |
| API | `api/client.ts`, `api/contracts.ts` |

**Minimize diff** — touch only files required for the task.

---

## 6. Implementation workflow

```
1. PRECHECK — git status, read relevant spec section
2. PLAN — identify minimal diff; no scope creep
3. IMPLEMENT — follow existing conventions in surrounding code
4. VERIFY — npm run build; manual /tasks smoke
5. DOCUMENT — append report to 00_SYSTEM_BRAIN/000_REPORTS/ if phase-sized
6. HANDOFF — append handoff if operator continuation needed
```

---

## 7. URL state contract (code pattern)

```typescript
// Filter change MUST update URL
setSearchParams((prev) => {
  const next = new URLSearchParams(prev);
  next.set('filter', filterKey);
  return next;
});

// Task selection MUST use path param
navigate(`/tasks/${taskId}?${searchParams.toString()}`);
```

---

## 8. Display name contract (code pattern)

```typescript
// CORRECT — display name from directory
const ownerName = task.owner?.displayName ?? '—';

// WRONG — never primary-label USER_CODE
const ownerName = task.owner?.userCode;
```

---

## 9. Degraded runtime contract

```typescript
// CORRECT — keep snapshot, show warning
if (warnings.length || status === 'GO_WITH_WARNINGS') {
  showOperationalAlert(runtimeStaleMessage(warnings, degraded));
}
// Do NOT: setSnapshot(null) on soft failure
```

---

## 10. Test expectations

After implementation:

| Check | Command |
|-------|---------|
| TypeScript build | `cd apps/workboard && npm run build` |
| Lint (if configured) | `npm run lint` |
| Visibility probes | Review `taskOperationalVisibilityChecks.ts` |

GAS tests require bound Sheet — mark **PENDING** if not run.

---

## 11. Documentation obligations

| Scope | Action |
|-------|--------|
| Bug fix | Optional short note in commit message only |
| Phase-sized feature | Append report to `000_REPORTS/` |
| Contract change | New versioned file in `UI_UX/CBV_WORK_INBOX_V3/` with date suffix |
| Breaking route change | Update `008_ROUTING_CONTRACT.md` (new version file) |

---

## 12. Ambiguity resolution

| Question | Default |
|----------|---------|
| Desktop vs mobile priority | Desktop (1366+) |
| Light vs dark | Light operational |
| URL vs session for state | URL for filter/group; session for focus queue |
| Read vs write in WebApp | Read-first; inline write only where API allows |
| AppSheet vs WebApp | WebApp inbox; AppSheet official forms |

If still ambiguous — **do not redesign**; preserve current runtime behavior.

---

## 13. Reference implementations

| Feature | Reference file |
|---------|----------------|
| Full inbox page | `apps/workboard/src/modules/task/TasksPage.tsx` |
| Filter keys | `apps/workboard/src/shared/constants/taskFilterKeys.ts` |
| Focus queue | `apps/workboard/src/shared/utils/focusQueueMode.ts` |
| Inline exec | `apps/workboard/src/modules/task/useInlineExecution.ts` |
| Shell | `apps/workboard/src/components/layout/AppShell.tsx` |

---

## 14. Contract version

| Field | Value |
|-------|-------|
| Contract ID | `CBV_WORK_INBOX_V3` |
| Version | 3.0 |
| Created | 2026-05-29 |
| Baseline code | `apps/workboard` (PHASE_TASK_GS_10 + RF_02) |
| Supersedes | Informal GS phase UX reports (not deleted) |

---

## 15. Sign-off

Implementation is contract-compliant when `013_ACCEPTANCE_CRITERIA.md` gates F1–F4 and R1–R6 pass.

Agent must state in handoff/report:
- Files touched
- Gates passed / pending
- Known warnings
- Next recommended step
