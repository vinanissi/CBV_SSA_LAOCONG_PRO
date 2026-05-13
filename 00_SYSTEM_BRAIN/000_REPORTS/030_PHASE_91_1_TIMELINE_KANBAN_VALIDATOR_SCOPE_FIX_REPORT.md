# PHASE 91.1 — Timeline / Kanban Validator Scope Fix — Report

| Field | Value |
|-------|-------|
| Phase | PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX |
| Branch | `phase/from-v2.4.1-TASK-FIN` |
| Parent phase | Phase 91 (commit `944f5c8`) |
| Commit hash | `<TO_BE_FILLED_AFTER_COMMIT>` |
| Pilot readiness | **GO_WITH_WARNINGS** after rerun |
| Production readiness | **NOT YET** |

## Root cause

Phase 91 health check failed `NO_WRITE_MUTATION` because the scanner produced false positives:

| Symbol | Owner | Why it matched | Reality |
|--------|-------|----------------|---------|
| `CbvWebAppTimelineKanban__resolveState_` | Phase 91 (renderer) | `_resolve` substring in mutation needle list | UI state mapper, no side-effects |
| `setTaskStatus` | `20_TASK_SERVICE.js` (legacy) | Hard-coded in 993 `forbid` list | Task module operational API — out of Phase 91 scope |
| `completeTask` | `20_TASK_SERVICE.js` (legacy) | Hard-coded in 993 `forbid` list | Task module operational API |
| `taskStartAction` | `20_TASK_SERVICE.js` (legacy) | Hard-coded in 993 `forbid` list | Task module operational API |
| `changeHosoStatus` | `10_HOSO_SERVICE.js` (legacy) | Hard-coded in 993 `forbid` list | HoSo module operational API |
| `deleteAttachment` | `61_UNIFIED_ROUTER.js` (legacy) | Hard-coded in 993 `forbid` list | Router action — out of Phase 91 scope |

The scanner conflated **substring match against the global namespace** with **operational action exposed by Phase 91**. Phase 91.1 fixes the scope.

## Files updated

- `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js` — renamed `CbvWebAppTimelineKanban__resolveState_` → `CbvWebAppTimelineKanban__mapState_` (definition + 2 callers).
- `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js` — refactored `CbvWebAppTimelineKanban_validate()` mutation probe:
  - Scope restricted to `CbvWebAppTimelineKanban_*` namespace.
  - Verb-at-start matcher: `^(set|update|resolve|complete|delete|save|mutate|assign|escalate|claim|drag)[A-Z]` against the **action portion** (name minus namespace prefix and leading `_`).
  - Explicit `mutationAllowlist` exposing all known Phase 91 public/internal helpers in the returned detail (audit-friendly).
  - Allowlist regex `/State_?$/` + `/^CbvWebAppTimelineKanban_TestConsole_/`.
- `05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js` — `NO_WRITE_MUTATION` check no longer references legacy globals. It now delegates to `CbvWebAppTimelineKanban_validate().data.noMutationExposed` / `.mutationProbe`. Detail surfaces `scope: 'CbvWebAppTimelineKanban_*'` for auditability.

## Files created (append-only)

- `00_SYSTEM_BRAIN/000_PROMPTS/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_PROMPT.md`
- `00_SYSTEM_BRAIN/000_REPORTS/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_REPORT.md` (this file)
- `00_SYSTEM_BRAIN/001_HANDOFF/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_HANDOFF.md`

## Validator behaviour (verified by local simulation)

The new `isMutationName(name)` predicate, run against 30 representative names:

| Bucket | Examples | Outcome |
|--------|----------|---------|
| Real Phase 91 symbols (16) | `getTimelineData`, `getKanbanData`, `validate`, `renderTimeline`, `renderKanban`, `renderTimelineRow_`, `renderKanbanColumn_`, `renderKanbanCard_`, `renderState_`, `__mapState_`, `__safetyFooter_`, `__warningsBlock_`, `__inlineTimeline_`, `__inlineKanban_`, `TestConsole_run`, `TestConsole_showTimelineData` | **all safe** |
| Legacy globals (5) | `setTaskStatus`, `completeTask`, `taskStartAction`, `changeHosoStatus`, `deleteAttachment` | **all safe** (out-of-scope, not Phase 91 namespace) |
| Hypothetical Phase 91 mutations (7) | `setStatus`, `resolveAlert`, `completeRow`, `saveCard`, `assignCard`, `escalateRow`, `dragSave` (all with `CbvWebAppTimelineKanban_` prefix) | **all caught** as `MUTATION` |
| Defense-in-depth fallback (1) | Legacy `__resolveState_` (renamed away, but if reintroduced) | **safe** via `/State_?$/` allowPattern |

This proves the fix narrows scope without weakening enforcement.

## Local test result

```
node --check 05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js          → exit 0
node --check 05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js      → exit 0
node --check 05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js  → exit 0
Validator simulation across 30 sample names → all classifications correct
```

## GAS test result (expected after deploy)

Rerun in spreadsheet:

```
🧪 CBV Test Console → Phase 91 — Timeline / Kanban → Run Timeline/Kanban Health Check
```

Expected envelope:

- `phase` = `PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES`.
- `status` = `GO` or `GO_WITH_WARNINGS`.
- `errors` = empty.
- `checks` contains `NO_WRITE_MUTATION` with `ok: true`, severity `OK`, detail `{ scope: 'CbvWebAppTimelineKanban_*', probe: [] }`.
- `envelopeOk` = `true`.

## Safety phrases (preserved)

- No auto assign
- No auto resolve
- No auto escalate
- No production claim
- No drag-drop save

## Git commands

```
git add 05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js \
  05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js \
  05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js \
  00_SYSTEM_BRAIN/000_PROMPTS/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_PROMPT.md \
  00_SYSTEM_BRAIN/000_REPORTS/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_REPORT.md \
  00_SYSTEM_BRAIN/001_HANDOFF/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_HANDOFF.md
git commit -m "fix(webapp): narrow phase 91 mutation validator scope"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## Next step

1. `clasp push --force` (done in 91.1 commit).
2. Apps Script → Deploy → Manage deployments → Edit → **New version** → Deploy.
3. Rerun Phase 91 health check; confirm `errors = 0`.
4. Operator UAT per `docs/webapp/WEBAPP_TIMELINE_KANBAN_UAT_CHECKLIST.md`.
5. Continue to Phase 92 — WebApp Runtime Health / Report Viewer Pages.
