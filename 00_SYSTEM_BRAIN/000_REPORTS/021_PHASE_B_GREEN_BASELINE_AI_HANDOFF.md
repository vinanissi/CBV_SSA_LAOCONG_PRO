---
doc: 021_PHASE_B_GREEN_BASELINE_AI_HANDOFF
phase: PHASE_B_TEST_RUNTIME_GREEN_BASELINE
purpose: Handoff after green-baseline staging flow documentation
---

# Phase B — Green baseline — AI handoff

## Runtime readiness

- **Code:** TASK_OBS stack present on branch `phase/t0-task-binding-brain-bootstrap` at `ddde81b…` (TASK binding commit); no additional code changes in this documentation phase.
- **Staging execution:** **Not yet verified** on a live staging spreadsheet — operator must run checklist `021_TASK_OBS_GREEN_BASELINE_CHECKLIST.md`.

## Blockers

- **Configuration:** Missing `CBV_TASK_DB_ID` blocks every OBS open path — **BLOCKER** until set on staging script.
- **Permissions:** Script runner must open staging spreadsheet by id — **BLOCKER** if OAuth/service account denied.

## Staging risks

- Mis-bound `CBV_TASK_DB_ID` → production data exposure or accidental OBS writes to prod — **critical governance**; use separate staging file id always.
- Self-test and sample paths **append** many rows — staging sheet size / quota.

## Drift risks

- Vendored `250/251/255` vs `apps-script/core-runtime-lib` source.
- `05_GAS_RUNTIME` without TASK_OBS — monolith-only deploys miss OBS unless mirrored.
- Test harness column lists vs `TASK_MAIN` schema (`REPORTER_ID`, `SHARED_WITH`, `IS_PRIVATE`) — separate alignment phase.

## Next operational step

1. Operator: set staging `CBV_TASK_DB_ID`, run dry-run → bootstrap → health → self-test.
2. Record `RUN_ID` and checklist sign-off in append-only RUN doc.
3. Git: commit docs via `021_PHASE_B_GREEN_BASELINE_GIT_COMMANDS.md` when ready; push after credential confirm.

## Warnings

- **No redesign** of TASK business rules or MAIN_CONTROL router in the name of “green baseline.”
- **No production deploy** during baseline phase — staging-first only.
