# RF_12 GAS Runtime API — Setup

## 1. Spreadsheet ID (required for standalone Web App)

In Apps Script editor, run **once**:

```javascript
Rf12_setupSpreadsheetId('YOUR_SPREADSHEET_ID');
```

Or: **Project Settings → Script Properties** → `CBV_SPREADSHEET_ID` = your workbook ID.

Do **not** commit spreadsheet IDs to git.

## 2. Deploy

```bash
cd gas-runtime-api
clasp push
```

Apps Script → **Deploy → Manage deployments → Edit → New version → Deploy**

## 3. Worker local config

Copy `workers/api/.dev.vars.example` → `.dev.vars` (never commit):

```ini
CBV_GAS_API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
CBV_TASK_WRITE_MODE=gas
CBV_ALLOWED_ORIGINS=http://localhost:5173
```

## 4. Verify

```bash
curl "YOUR_GAS_URL?action=health"
curl http://localhost:8787/api/health
```

Expected GAS health: `{ ok: true, data: { mode: "SHEET_BRIDGE", configured: true } }`

Expected Worker health: `gasConfigured: true`, `gasReachable: true`, `writeAdapterStatus: "GAS"`
