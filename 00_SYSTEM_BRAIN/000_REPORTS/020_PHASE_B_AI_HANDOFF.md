---
doc: 020_PHASE_B_AI_HANDOFF
phase: PHASE_B_TEST_RUNTIME
purpose: Handoff after test-runtime baseline documentation (no runtime code changes)
---

# Phase B — AI handoff

## Runtime status

- **Branch:** `phase/t0-task-binding-brain-bootstrap`
- **HEAD:** `ddde81b92ddfffc7bad298826671386e108b8c30` — `chore(task): prepare T0 binding and TASK_OBS baseline`
- **TASK_OBS code:** present under `apps-script/task/src/` (vendored CBV_OBS_CORE B1 + TASK adapter/menu).
- **Runtime code:** **not modified** in Phase B (documentation and governance artefacts only).

## Blockers

- **None** for continuing **documentation** / staging planning.
- **Operational:** Staging spreadsheet must have `CBV_TASK_DB_ID` set and user authorized to open that file before OBS self-test is “green”.

## Drift risk

1. `apps-script/task` TASK_OBS vs `apps-script/core-runtime-lib` source versions — bump vendoring deliberately.
2. `05_GAS_RUNTIME` lacks same TASK_OBS files — monolith push policy still open.
3. `07_TEST` / GAS runners vs `90_BOOTSTRAP_SCHEMA` `TASK_MAIN` columns (`REPORTER_ID`, `SHARED_WITH`, `IS_PRIVATE`) — align in a dedicated test-harness phase.

## Next phase

- **`phase/t0-task-obs-green-baseline`:** smoke / self-test on staging, OBS sheets present, health rows acceptable, append-only reports.
- **Do not:** redesign TASK business workflow, merge monolith for “convenience”, or deploy production Apps Script in the same step.

## Files added this phase (under `000_REPORTS/` / `000_PROMPTS/`)

- `020_PHASE_B_TEST_RUNTIME_PROMPT.md`
- `020_TASK_OBS_RUNTIME_AUDIT.md`
- `020_TEST_RUNTIME_CONTRACT.md`
- `020_TEST_RUNTIME_REPORT_TEMPLATE.json`
- `020_TEST_RUNTIME_APPEND_ONLY_POLICY.md`
- `020_STAGING_RUNTIME_RISK_REPORT.md`
- `020_TEST_CONSOLE_BASELINE.md`
- `020_PHASE_B_AI_HANDOFF.md` (this file)
- `020_PHASE_B_GIT_COMMANDS.md`
- `020_PHASE_B_TEST_RUNTIME_REPORT.md`

## Absolute don’ts

- No production deploy.
- No force push.
- No TASK business runtime edits without explicit phase charter.
