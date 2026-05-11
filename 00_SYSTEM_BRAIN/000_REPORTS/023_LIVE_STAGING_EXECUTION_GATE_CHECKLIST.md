---
doc: 023_LIVE_STAGING_EXECUTION_GATE_CHECKLIST
phase: PHASE_B_LIVE_STAGING_GREEN_EXECUTION_PREP
purpose: Gate checklist before/after live staging TASK_OBS run
---

# Live staging execution gate checklist

Mark **Y** / **N** / **N/A**. Any **N** on REQUIRED row blocks “green declared”.

| # | Gate | Required? |
|---|------|-------------|
| 1 | Remote clean (`git remote -v` no PAT in URL) | REQUIRED |
| 2 | Staging spreadsheet identity confirmed (non-prod) | REQUIRED |
| 3 | Script property `CBV_TASK_DB_ID` set (value not in Git) | REQUIRED |
| 4 | `.clasp.json` real file local-only / gitignored | REQUIRED |
| 5 | Apps Script authorization complete for executor | REQUIRED |
| 6 | Dry-run `TaskObs_bootstrapDryRun` OK or acceptable warnings | REQUIRED |
| 7 | Bootstrap `TaskObs_bootstrap` OK | REQUIRED |
| 8 | Health `TaskObs_healthCheck` → GO or accepted GO_WITH_WARNINGS | REQUIRED |
| 9 | Self-test `TaskObs_runSelfTest` completes | REQUIRED |
| 10 | OBS rows appended (counts increased) | REQUIRED |
| 11 | No `TASK_MAIN` mutation detected | REQUIRED |
| 12 | No destructive clear/delete on TASK/OBS sheets | REQUIRED |
| 13 | `RUN_ID` captured in operator report | REQUIRED |
| 14 | Filled run report saved (copy of template) per retention policy | REQUIRED |
| 15 | Next phase selected (e.g. `LIVE_STAGING_OPERATOR_RUN` follow-up or prod freeze) | OPTIONAL |

## Sign-off

- **Operator:** _______________________
- **Date:** _______________________
