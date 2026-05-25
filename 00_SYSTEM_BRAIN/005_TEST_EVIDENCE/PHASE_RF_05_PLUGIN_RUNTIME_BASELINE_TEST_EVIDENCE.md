# PHASE_RF_05 — Plugin Runtime Baseline — Test Evidence

## Test suite

| Field | Value |
|-------|-------|
| **Entry point** | `CBV_RF05_Test_runPluginRuntimeHealth()` |
| **Menu path** | 🧪 CBV Test Console → Run RF_05 Plugin Runtime Health Test |
| **Contract** | CBV_TCS_V1 |
| **Phase ID** | `PHASE_RF_05_PLUGIN_RUNTIME` |

## Local verification (2026-05-25)

| Check | Method | Result |
|-------|--------|--------|
| JS syntax | `node --check` on 999R/S/T | PASS (local) |
| Registry | Static review | 3 plugins TASK/FINANCE/HO_SO |
| Routes | Static review `92_*` | 10 RF05 routes |
| Permissions | Static review `46_*` | PLUGIN_* + module actions |
| Clasp order | `.clasp.json` | 999R→999S→999T before 96_* |

## GAS runtime (pending)

After `clasp push`: run menu test, expect GO_WITH_WARNINGS (FINANCE/HO_SO STUB, hardcoded registry).
