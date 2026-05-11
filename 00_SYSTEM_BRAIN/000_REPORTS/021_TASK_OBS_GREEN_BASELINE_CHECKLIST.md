---
doc: 021_TASK_OBS_GREEN_BASELINE_CHECKLIST
phase: PHASE_B_TEST_RUNTIME_GREEN_BASELINE
purpose: Operator checklist before declaring TASK_OBS “green” on staging
---

# TASK_OBS green baseline checklist

Mark each **PASS** on staging before promoting narrative to “green”.

| # | Check | Class | Notes |
|---|--------|-------|-------|
| 1 | `CBV_TASK_DB_ID` configured on TASK script project | **REQUIRED** / **BLOCKER** if missing | Script Editor → Project Settings → Script properties. |
| 2 | Staging spreadsheet opens in browser; operator has edit access | **REQUIRED** / **BLOCKER** if denied | Same id as `CBV_TASK_DB_ID`. |
| 3 | OBS sheets bootstrap OK (`TaskObs_menuBootstrap` or API) | **REQUIRED** | All `TASK_OBS_*` tabs from map exist. |
| 4 | Health check returns `GO` or `GO_WITH_WARNINGS` (no `FAIL` / unresolved `BLOCKER` in operator judgment) | **REQUIRED** | Use `TaskObs_healthCheck` / menu. |
| 5 | Self-test append rows OK (`TASK_OBS_TEST_RUN`, `TASK_OBS_TEST_RESULT` gain rows) | **REQUIRED** | Compare row counts before/after. |
| 6 | No `TASK_MAIN` mutation (no new/edited business task rows from OBS flows) | **REQUIRED** / **BLOCKER** if violated | Spot-check `TASK_MAIN` row count / sample ids unchanged. |
| 7 | No destructive clear/delete on OBS or TASK sheets during run | **REQUIRED** / **BLOCKER** if violated | Schema is append-oriented. |
| 8 | Envelope contract valid (see `020_TEST_RUNTIME_CONTRACT.md` + map from `TaskObs_stdResponse_`) | **OPTIONAL** for first green | Recommended before automation consumes JSON. |
| 9 | Append-only policy respected (no rewrite of finished RUN rows) | **REQUIRED** | New RUN_ID for new run. |
| 10 | AI export path safe (no token in logs; markdown/json size reasonable) | **OPTIONAL** | Run `TaskObs_generateAiDiagnosticExport` only if in scope. |

## Class legend

- **REQUIRED** — must pass for green baseline declaration.
- **OPTIONAL** — nice-to-have for first wave.
- **BLOCKER** — any failure in rows marked BLOCKER fails the baseline gate.

## Sign-off block

- **Staging spreadsheet id:** _(vault only — do not write here)_
- **RUN_ID (last self-test):** _______________________
- **Operator / date:** _______________________
