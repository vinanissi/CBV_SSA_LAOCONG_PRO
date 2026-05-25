# PHASE_RF_04 — Observation Runtime Core — Test Evidence

## Test suite

| Field | Value |
|-------|-------|
| **Entry point** | `CBV_RF04_Test_runObservationRuntimeHealth()` |
| **Menu path** | 🧪 CBV Test Console → Run RF_04 Observation Runtime Health Test |
| **Contract** | CBV_TCS_V1 |
| **Phase ID** | `PHASE_RF_04_OBSERVATION_RUNTIME` |

## Local verification (2026-05-25)

| Check | Method | Result |
|-------|--------|--------|
| JS syntax | `node --check` on 999O/P/Q | PASS (local) |
| Route registry | Static review `92_WEBAPP_WORKSPACE_ROUTES.js` | 12 RF04 routes registered |
| Renderer dispatch | Static review `94_WEBAPP_WORKSPACE_RENDERER.js` | RF04 branch present |
| Permission actions | Static review `46_CBV_PERMISSION_RUNTIME.js` | OBSERVATION_* present |
| Clasp order | `.clasp.json` | 999O→999P→999Q before 96_* |

## GAS runtime (pending)

Run after `clasp push`:

1. Spreadsheet → 🧪 CBV Test Console → **Run RF_04 Observation Runtime Health Test**
2. Copy report via **Copy RF_04 Latest Test Report**
3. Expected checks: RF02/RF03 available, routes, envelopes, sync stub, audit safe, alert no-auto, envelope CBV_TCS_V1

## Expected verdict

**GO_WITH_WARNINGS** — sync stub + audit empty-state acceptable per phase scope.
