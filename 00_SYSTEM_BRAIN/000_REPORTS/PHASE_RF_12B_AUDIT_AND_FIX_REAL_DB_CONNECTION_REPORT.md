# PHASE_RF_12B — Audit and Fix Real DB Connection — Report

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase** | PHASE_RF_12B_AUDIT_AND_FIX_REAL_DB_CONNECTION |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Date** | 2026-05-25 |

---

## Summary

Audited FE → Worker → GAS → Sheet chain. Fixed: removed hardcoded Spreadsheet ID from committed GAS config, hardened spreadsheet resolution, stopped mock fallback when `CBV_TASK_WRITE_MODE=gas`, enriched Worker health (`gasConfigured`, `gasReachable`, `writeAdapterStatus`), increased GAS timeout, added SETUP.md.

**Blocker remaining:** GAS Web App deployment serves pre-RF12B code until operator redeploys + sets `CBV_SPREADSHEET_ID` Script Property.

---

## Audit results

| Area | Status | Notes |
|------|--------|-------|
| FE `.env.example` | PASS | Points to Worker only, no GAS/Sheet |
| FE `client.ts` | PASS | No GAS URL; create/update no mock fallback |
| Worker `.dev.vars.example` | PASS | Placeholders only |
| Worker `gasAdapter` | PASS | Envelope contract, 15s timeout |
| Worker GAS runtime mode | FIXED | No mock fallback on read/write fail |
| GAS package | PASS | doGet/doPost, bootstrap, audit/timeline |
| Spreadsheet config | FIXED | Script Property only in git |
| Permission tests | PASS | VIEW_ONLY 403, STAFF 403 |

---

## Worker health (local, GAS mode)

```json
{
  "version": "RF-12B-V1",
  "mode": "GAS_SHEET_BRIDGE",
  "gasConfigured": true,
  "gasReachable": false,
  "writeAdapterStatus": "GAS"
}
```

Correctly reports GAS unreachable (deployment not updated).

---

## Create / update (GAS mode, GAS down)

- POST create → **400 FAIL** — GAS error propagated, **no fake success**
- GET tasks → **400 FAIL** — `GAS runtime mode — không fallback mock`
- VIEW_ONLY create → **403**
- STAFF patch non-own → **403**

---

## Files fixed

| File | Change |
|------|--------|
| `gas-runtime-api/Config.js` | Remove hardcoded sheet ID |
| `gas-runtime-api/Utils.js` | Safer openById + guards |
| `gas-runtime-api/Finance.js`, `HoSo.js` | Null-safe sheet access |
| `gas-runtime-api/SETUP.md` | Operator setup guide |
| `workers/api/src/env.ts` | `isGasRuntimeMode()` |
| `workers/api/src/modules/tasks.ts` | No mock fallback in GAS mode |
| `workers/api/src/modules/workboard.ts` | RF-12B health fields |
| `workers/api/src/contracts.ts` | HealthData extended |
| `workers/api/src/adapters/gasAdapter.ts` | 15s timeout |
| `05_GAS_RUNTIME/999Y_RF12_*` | Synced |

---

## Remaining warnings

1. **GAS Web App redeploy required** — live URL still returns old `getSheetByName` null error
2. **Script Property** — run `Rf12_setupSpreadsheetId('...')` after redeploy
3. Finance/HoSo read stubs unchanged
4. Auth remains Worker header stub

---

## Build

| Target | Result |
|--------|--------|
| Worker typecheck | PASS |
| FE build | PASS |

---

## Verdict

**GO_WITH_WARNINGS** — Worker/FE/GAS code path correct; end-to-end Sheet writes pending GAS redeploy + Script Property.

**DB connection mode:** GAS_SHEET_BRIDGE (configured, not yet reachable on live deploy)
