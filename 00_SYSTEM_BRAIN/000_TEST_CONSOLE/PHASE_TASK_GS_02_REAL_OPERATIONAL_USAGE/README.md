# PHASE_TASK_GS_02 — Real Operational Usage

Suite: `PHASE_TASK_GS_02_REAL_OPERATIONAL_USAGE`

## Checks

| # | Check |
|---|-------|
| 1 | Real snapshot fetch from TASK_MAIN |
| 2 | Runtime mode active (`CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`) |
| 3 | Mock path disabled when Worker + runtime mode |
| 4 | Task selection persistence after soft refresh |
| 5 | Operational Context Panel render |
| 6 | Timeline render from TASK_UPDATE_LOG |
| 7 | Urgency enrichment on task cards |
| 8 | Quick actions (accept/complete) |
| 9 | Optimistic local patch after update |
| 10 | Cache behavior (GAS 20s) |
| 11 | No excessive Worker calls (snapshot-only list) |
| 12 | No snapshot fan-out |
| 13 | Runtime warning render on disconnect |
| 14 | TASK_UPDATE_LOG append-only |
| 15 | TASK_OPERATOR_OBSERVATION append (if sheet exists) |
| 16 | FE build PASS |
| 17 | Worker typecheck PASS |

## Verify

```bash
cd workers/api && npm run typecheck
cd apps/workboard && npm run build
```

Worker `.dev.vars`:
```
CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
GAS_TASK_API_URL=<GAS Web App URL>
```

Workboard `.env`:
```
VITE_CBV_API_BASE_URL=http://localhost:8787
VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
```

GAS (optional observation dev sheet):
```
Script Property CBV_OBSERVATION_DEV=1
```

Run `CBV_TCS_TASK_GS_02_runAll()` in Apps Script after deploy.
