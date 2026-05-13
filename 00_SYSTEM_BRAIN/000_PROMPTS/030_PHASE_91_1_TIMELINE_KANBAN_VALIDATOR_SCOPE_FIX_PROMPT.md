# PHASE 91.1 — Timeline / Kanban Validator Scope Fix (Prompt)

> Hotfix snapshot. Captures the AI handoff prompt that drove Phase 91.1.

---

Repo: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
Branch: `phase/from-v2.4.1-TASK-FIN`  
Standards: CBV Operational Ecosystem Standard V1 · CBV Test Console Standard `CBV_TCS_V1`.

## Problem

Phase 91 health check failed because the mutation-name scanner was too broad:

- False positive on `CbvWebAppTimelineKanban__resolveState_` — a UI state mapper, not a mutation action; matched because `_resolve` was a substring needle.
- False positive on `setTaskStatus`, `completeTask`, `taskStartAction`, `changeHosoStatus`, `deleteAttachment` — these are legitimate **legacy / business** runtime functions in `20_TASK_SERVICE.js` and `10_HOSO_SERVICE.js`, **out of Phase 91 scope**.

## Reality

- Legacy globals are part of the production Task / HoSo modules. They MUST NOT be removed.
- `CbvWebAppTimelineKanban__resolveState_` is a pure UI state mapper. No write side-effects.

## Mission

Narrow the validator scope without weakening safety.

## Rules

- Keep Phase 91 read-first.
- Keep NO mutation enforcement.
- DO NOT remove global runtime functions.
- DO NOT weaken CBV_TCS_V1.
- DO NOT hide real mutations.

## Required changes

1. Rename `CbvWebAppTimelineKanban__resolveState_` → `CbvWebAppTimelineKanban__mapState_` and update callers.
2. Refactor the `NO_MUTATION_EXPOSED` validator to scan **only** the Phase 91 namespace `CbvWebAppTimelineKanban_*`. Stop scanning legacy global runtime functions.
3. Mutation detection should fail only when Phase 91 itself exposes a function whose **action portion** (after the namespace prefix and any leading underscore) **starts** with an operational verb followed by an upper-case letter:
   `(set|update|resolve|complete|delete|save|mutate|assign|escalate|claim|drag)[A-Z]`.
4. Add an explicit allowlist:
   - `mapState`, `renderState`, any name ending in `State` / `State_`.
   - All currently known Phase 91 public functions (data + renderer + test console).
5. Preserve safety phrases:
   - No auto assign · No auto resolve · No auto escalate · No production claim.
6. Append-only artifacts under `00_SYSTEM_BRAIN/`:
   - `000_PROMPTS/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_PROMPT.md`
   - `000_REPORTS/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_REPORT.md`
   - `001_HANDOFF/030_PHASE_91_1_TIMELINE_KANBAN_VALIDATOR_SCOPE_FIX_HANDOFF.md`

## Local tests

```
node --check 05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js
node --check 05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js
node --check 05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js
```

## Git

```
git add 05_GAS_RUNTIME/991_*.js 05_GAS_RUNTIME/992_*.js 05_GAS_RUNTIME/993_*.js \
  00_SYSTEM_BRAIN/000_PROMPTS/030_*.md 00_SYSTEM_BRAIN/000_REPORTS/030_*.md \
  00_SYSTEM_BRAIN/001_HANDOFF/030_*.md
git commit -m "fix(webapp): narrow phase 91 mutation validator scope"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## Deploy

Apps Script → Deploy → Manage deployments → Edit → New version → Deploy.

## Verify

`🧪 CBV Test Console → Phase 91 — Timeline / Kanban → Run Timeline/Kanban Health Check`.

Expected:

- `status` = `GO` or `GO_WITH_WARNINGS`.
- `errors` = 0 (no `NO_WRITE_MUTATION` false positives).
- `envelopeOk` = `true`.
