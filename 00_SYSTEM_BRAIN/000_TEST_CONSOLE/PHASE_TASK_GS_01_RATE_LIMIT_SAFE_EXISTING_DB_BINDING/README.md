# PHASE_TASK_GS_01 — Test Console

Suite: `PHASE_TASK_GS_01_RATE_LIMIT_SAFE_EXISTING_DB_BINDING`

## GAS (Apps Script Editor)

```javascript
CBV_TCS_TASK_GS_01_runAll()
```

Set Script Property `TCS_WRITE=1` to enable write tests (11–15).

## Checks

| # | Check | Layer |
|---|-------|-------|
| 1 | GAS health | GAS |
| 2 | Spreadsheet openById | GAS |
| 3 | Existing DB validation | GAS |
| 4 | TASK_MAIN exists | GAS |
| 5 | TASK_CHECKLIST exists | GAS |
| 6 | TASK_ATTACHMENT exists | GAS |
| 7 | TASK_UPDATE_LOG exists | GAS |
| 8 | Header mapping readable | GAS |
| 9 | Workspace snapshot single-call | GAS |
| 10 | Cache behavior | GAS |
| 11 | Create task into TASK_MAIN | GAS (write) |
| 12 | Update status in TASK_MAIN | GAS (write) |
| 13 | Assign task in TASK_MAIN | GAS (write) |
| 14 | Add comment/log into TASK_UPDATE_LOG | GAS (write) |
| 15 | Complete task | GAS (write) |
| 16 | TASK_UPDATE_LOG append-only | GAS |
| 17 | Optional CBV_AUDIT_LOG append-only | GAS |
| 18 | Worker routes compile | Worker `npm run typecheck` |
| 19 | FE calls Worker only | Static — `apps/workboard/src/api/client.ts` |
| 20 | Rate-limit friendly error mapping | Worker adapter |

## Worker local verify

```bash
cd workers/api && npm run typecheck
cd apps/workboard && npm run build
```

## Status rules

- **GO** — all checks pass including write tests
- **GO_WITH_WARNINGS** — read path OK, write tests skipped or schema warnings
- **FAIL** — sheet missing or snapshot fails
