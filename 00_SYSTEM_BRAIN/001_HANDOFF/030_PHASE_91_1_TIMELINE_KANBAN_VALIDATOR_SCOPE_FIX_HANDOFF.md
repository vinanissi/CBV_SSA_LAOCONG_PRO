# PHASE 91.1 — Timeline / Kanban Validator Scope Fix — Handoff

| Field | Value |
|-------|-------|
| Phase | PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX |
| Parent | Phase 91 (commit `944f5c8`) |
| Branch | `phase/from-v2.4.1-TASK-FIN` |
| Status | Pilot read-first; **NOT** production-ready |
| Envelope contract | CBV_TCS_V1 |

## Scope

Hotfix the Phase 91 mutation-name scanner so the `NO_WRITE_MUTATION` check stops flagging:

1. The Phase 91 UI state mapper itself (renamed `__resolveState_` → `__mapState_`).
2. Legacy Task / HoSo / router functions (`setTaskStatus`, `completeTask`, `taskStartAction`, `changeHosoStatus`, `deleteAttachment`) that live outside the Phase 91 namespace.

This is a **scope** fix, not a safety relaxation. The scanner remains strict against any real mutation introduced inside the `CbvWebAppTimelineKanban_*` namespace.

## What changed

| File | Change |
|------|--------|
| `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js` | Renamed `CbvWebAppTimelineKanban__resolveState_` → `CbvWebAppTimelineKanban__mapState_` (1 definition + 2 callers). Documented as pure UI state mapper. |
| `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js` | `CbvWebAppTimelineKanban_validate()` now uses **verb-at-start** matcher (`^(set|update|resolve|complete|delete|save|mutate|assign|escalate|claim|drag)[A-Z]`) on the action portion of the name, plus explicit allowlist (`mutationAllowlist` array + `/State_?$/` + `/^CbvWebAppTimelineKanban_TestConsole_/`). Returned detail now includes `mutationAllowlist` for audit. |
| `05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js` | `NO_WRITE_MUTATION` check no longer hard-codes legacy globals; it now delegates to `CbvWebAppTimelineKanban_validate().data.noMutationExposed` / `.mutationProbe`. The probe detail explicitly states `scope: 'CbvWebAppTimelineKanban_*'`. |

## What did NOT change

- No legacy runtime function was removed or renamed (`setTaskStatus`, `completeTask`, `taskStartAction`, `changeHosoStatus`, `deleteAttachment` all live where they have always lived).
- Phase 90 placeholder fallback wiring in `98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` is unchanged.
- Route registry, dispatcher, and `.clasp.json` order are unchanged.
- Safety phrases unchanged: `No auto assign · No auto resolve · No auto escalate · No production claim · No drag-drop save`.

## Validator scope (final)

The Phase 91 mutation scanner:

1. **In scope** — only function names matching the `CbvWebAppTimelineKanban_` prefix.
2. **Allowlist** — explicit list of every known Phase 91 public/internal helper, plus regex `/State_?$/` (any UI state mapper / renderer state helper) and `/^CbvWebAppTimelineKanban_TestConsole_/` (test runtime).
3. **Match rule** — name's action portion (after stripping namespace + leading `_`) must START with an operational verb followed by an upper-case letter to count as an operational action. Substring matches are NO LONGER used.

This means a Phase 91 author CAN safely add helpers like `__mapState_`, `__renderStateClass_`, `_summariseState`, etc. without tripping the scanner. They CANNOT add `_setStatus`, `_resolveAlert`, `_saveCard`, etc. without explicitly opting in to write-runtime work (which would require a separate phase decision).

## Known limitations

- The scanner inspects the JavaScript scope at run-time of `CbvWebAppTimelineKanban_validate()`. In Apps Script that scope is the global object. Names introduced as `let`/`const` in module-level closures are not visible — but the Phase 91 codebase uses only `var`/`function`-declarations, so this is fine for our use case.
- Apps Script GAS cannot read `.clasp.json`. The "999 dispatcher last" guarantee remains a repo-side / lint-side check (see `CLASP_PUSH_ORDER.md`).

## Pilot readiness

GO_WITH_WARNINGS after redeploy. UAT path unchanged: `docs/webapp/WEBAPP_TIMELINE_KANBAN_UAT_CHECKLIST.md`.

## Production readiness

NOT YET.

## Recommended next phase

**Phase 92 — WebApp Runtime Health / Report Viewer Pages** (read-first, append-only):

- `/runtime/health`: read-first runtime health dashboard.
- `/reports`: append-only viewer for `CBV_TEST_REPORTS` + Drive archive.
- Reuse the Phase 91 mutation-scanner pattern (verb-at-start + namespace scope + allowlist) for the new namespace.
