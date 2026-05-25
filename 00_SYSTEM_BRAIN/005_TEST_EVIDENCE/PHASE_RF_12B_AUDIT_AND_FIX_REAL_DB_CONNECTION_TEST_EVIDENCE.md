# PHASE_RF_12B — Audit and Fix Real DB Connection — Test Evidence

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase** | PHASE_RF_12B_AUDIT_AND_FIX_REAL_DB_CONNECTION |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Date** | 2026-05-25 |

---

## Env checked

| Config | Result |
|--------|--------|
| FE `.env.example` | `VITE_CBV_API_BASE_URL=http://localhost:8787` — PASS |
| FE no GAS/Sheet IDs | PASS |
| Worker `.dev.vars.example` | Placeholders only — PASS |
| Worker `.dev.vars` | Local gas mode (gitignored) — not committed |

---

## GAS package status

| Check | Result |
|-------|--------|
| `gas-runtime-api/` structure | PASS |
| doGet/doPost envelope | PASS |
| Script Property spreadsheet resolution | PASS (code) |
| `clasp push` | PASS |
| Live deploy | **PENDING** — old version on Web App URL |

Live GAS health error (pre-redeploy):
`Cannot read properties of null (reading 'getSheetByName')`

---

## Worker health

```
GET /api/health
gasConfigured: true
gasReachable: false
writeAdapterStatus: GAS
mode: GAS_SHEET_BRIDGE
version: RF-12B-V1
```

PASS — accurate status reporting.

---

## FE build

```
npm run build — PASS
```

---

## Create task (GAS mode, GAS unreachable)

```
POST /api/tasks (MANAGER)
HTTP 400
ok: false
errors: ["Cannot read properties of null (reading 'getSheetByName')"]
```

PASS — **no fake success**.

---

## Update task

Not executed — blocked by GAS deploy. Permission-only tests below.

---

## Timeline / audit log

Not verified on Sheet — blocked by GAS deploy. Code review: append-only in `Timeline.js` — PASS.

---

## Permission tests

| Test | Expected | Result |
|------|----------|--------|
| POST VIEW_ONLY | 403 | PASS |
| PATCH STAFF non-own | 403 | PASS |
| GET tasks GAS fail | FAIL not mock | PASS (400) |

---

## Files fixed

See report — Config, Utils, tasks.ts, workboard.ts, env.ts, contracts.ts, gasAdapter.ts, SETUP.md, 05_GAS_RUNTIME sync.

---

## Verdict

**GO_WITH_WARNINGS** — code path audited and repaired; Sheet write verification pending GAS redeploy + `CBV_SPREADSHEET_ID`.

**DB connection mode:** GAS_SHEET_BRIDGE (configured, not reachable on live deploy)
