# Handoff — PHASE_RF_12B Audit and Fix Real DB Connection

## Operator unblock (required for GO)

1. **GAS project** (`gas-runtime-api` scriptId in `.clasp.json`)
2. Run in Apps Script editor:
   ```javascript
   Rf12_setupSpreadsheetId('YOUR_SPREADSHEET_ID');
   ```
3. **Deploy → Manage deployments → Edit → New version → Deploy**
4. Verify: `YOUR_GAS_URL?action=health` → `configured: true`, `mode: SHEET_BRIDGE`
5. Worker `.dev.vars` (local, gitignored):
   ```ini
   CBV_GAS_API_BASE_URL=<GAS Web App URL>
   CBV_TASK_WRITE_MODE=gas
   ```
6. Restart Worker → `/api/health` should show `gasReachable: true`

## What RF_12B fixed

- No mock fallback when `CBV_TASK_WRITE_MODE=gas` (fail loud, no fake success)
- Health exposes `gasConfigured`, `gasReachable`, `writeAdapterStatus`
- Spreadsheet ID removed from git — use Script Property only
- See `gas-runtime-api/SETUP.md`

## Smoke after unblock

```powershell
Invoke-RestMethod http://localhost:8787/api/health
Invoke-RestMethod http://localhost:8787/api/tasks -Headers @{ "x-cbv-role" = "MANAGER" }
# POST create → check TASKS / TASK_TIMELINE / API_AUDIT_LOG sheets
```

## Current state

Worker correctly returns FAIL when GAS deployment is stale — this is expected until redeploy.
