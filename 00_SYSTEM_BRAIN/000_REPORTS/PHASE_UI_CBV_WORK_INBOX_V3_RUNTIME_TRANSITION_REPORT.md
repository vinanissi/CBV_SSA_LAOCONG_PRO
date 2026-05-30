# PHASE UI — CBV_WORK_INBOX_V3 RUNTIME TRANSITION REPORT

## Status

**GO**

## Summary

Work Inbox V3 is now the **primary operator view on `/inbox`**. Legacy cognition runtime (filters, `TaskGroupedList`, `focusQueueMode`) remains in a **collapsible** `LegacyTaskRuntimePanel` — hidden by default on `/inbox`, open by default on `/tasks` (Option B). No code deletion; no API/schema/GAS/Worker changes.

## Authority Read

- `900_AUTHORITY/000_DESIGN_AUTHORITY.md`
- `900_AUTHORITY/001_AUTHORITY_INDEX.md`
- `100_TARGET_DESIGN/013_ACCEPTANCE_CRITERIA.md`
- `200_IMPLEMENTATION/016_AS_IS_TO_BE_MAPPING.md`
- Phase A–E frontend reports

## Created Files

| File | Purpose |
|------|---------|
| `apps/workboard/src/modules/task/inbox/workInboxRuntimeTransition.ts` | Feature flags + route behavior helpers |
| `apps/workboard/src/modules/task/inbox/LegacyTaskRuntimePanel.tsx` | Collapsible legacy wrapper + toggle |
| `apps/workboard/src/modules/task/inbox/runtimeTransitionChecks.ts` | Dev sanity suite |

## Updated Files

| File | Change |
|------|--------|
| `apps/workboard/src/modules/task/TasksPage.tsx` | V3 first; legacy in collapsible panel |
| `apps/workboard/.env.example` | Document transition flags |
| `apps/workboard/src/vite-env.d.ts` | Env types |

## Runtime Transition

```text
/inbox (default)
  ├── WorkInboxGroupsPanel (V3 groups, cards, Focus Mode) — visible
  └── LegacyTaskRuntimePanel — collapsed; "Hiện Runtime cũ"

/tasks (Option B)
  ├── WorkInboxGroupsPanel — hidden (V3 primary is /inbox only)
  └── LegacyTaskRuntimePanel — expanded (no toggle on /tasks; always shown)
```

Legacy content unchanged inside panel: `OperationalAlertHeader`, `TaskControlSurface`, `TaskGroupedList`, `focusQueueMode`, detail navigation.

## Feature Flags

| Flag | Default | Effect |
|------|---------|--------|
| `VITE_CBV_WORK_INBOX_V3_PRIMARY` | on (unset) | V3 panel on `/inbox` |
| `VITE_CBV_WORK_INBOX_V3_PRIMARY=false` | | Legacy-first: no V3 on `/inbox`; legacy open |
| `VITE_CBV_LEGACY_TASK_RUNTIME` | on (unset) | Legacy panel + toggle on `/inbox` |
| `VITE_CBV_LEGACY_TASK_RUNTIME=false` | | Hide legacy UI; V3 on all work-inbox routes if groups enabled |
| `VITE_CBV_WORK_INBOX_GROUPS_V3` | on | Master switch for V3 panel (Phase C) |

Also uses existing `VITE_CBV_WORK_INBOX_FOCUS_V3` for Focus Mode button.

## Route Behavior

| Route | Behavior |
|-------|----------|
| `/inbox` | V3 groups/cards/focus primary; legacy collapsed behind **Hiện Runtime cũ** |
| `/tasks` | Legacy runtime visible immediately (compatibility); V3 panel not shown when primary on |
| `/inbox/:id` | Same shell; task detail via existing `TasksPage` + detail panel |
| `/tasks/:id` | Legacy route; detail works as before |

## Legacy Runtime Handling

- **Not deleted:** `TaskGroupedList`, cognition grouping, filters, `focusQueueMode`, `FocusStrip` (AppShell).
- **Wrapped only:** legacy block in `TasksPage` moved into `LegacyTaskRuntimePanel` children.
- **Toggle copy:** "Hiện Runtime cũ" / "Ẩn Runtime cũ" + helper text "Runtime cũ — dùng khi cần đối chiếu".

## Rollback Plan

1. Set `VITE_CBV_WORK_INBOX_V3_PRIMARY=false` → legacy-first on all work-inbox routes.
2. Set `VITE_CBV_WORK_INBOX_GROUPS_V3=false` → hide entire V3 panel (Phase C kill-switch).
3. Routes `/tasks` and `/inbox` aliases unchanged (Phase A).

## Tests

`runRuntimeTransitionChecks()` in `runtimeTransitionChecks.ts`

Manual checklist: see phase prompt (V3 visible on `/inbox`, toggle legacy, `/tasks` open, detail routes, flag disables).

## Build Result

```text
cd apps/workboard && npm run build → PASS
```

## Runtime Impact

- No API / GAS / Worker / schema changes.
- Local UI state only (`showLegacyRuntime`); resets on route change.
- Bundle +2 modules (transition helpers + legacy panel).

## Acceptance Check

- [x] `/inbox` shows V3 primary view
- [x] Old runtime hidden by default on `/inbox`
- [x] Old runtime can be opened
- [x] `/tasks` preserved
- [x] `/tasks/:id` preserved
- [x] Focus Mode V3 works
- [x] Task Card V3 works
- [x] Feature flags documented
- [x] No code deletion of legacy runtime
- [x] No API change
- [x] No schema change
- [x] Build passed

## Risks

| Risk | Mitigation |
|------|------------|
| Duplicate “Việc vận hành” title when legacy expanded on `/inbox` | Acceptable for transition; UAT may collapse title in legacy panel later |
| Route change resets legacy expand state | `useEffect` syncs initial state per path |
| `/tasks` without legacy flag shows only unwrapped legacy body fallback | Documented in `shouldShowWorkInboxV3Panel` |

## Next Step

**PHASE_UI_CBV_WORK_INBOX_V3_UAT_AND_POLISH**

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_RUNTIME_TRANSITION. No commit.*
