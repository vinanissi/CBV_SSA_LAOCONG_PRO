# RF_12 GAS Runtime API

Standalone Apps Script Web App bridge for Worker ↔ Google Sheet.

## Deploy

1. Create or bind a Google Spreadsheet for workboard runtime sheets (`TASKS`, `TASK_TIMELINE`, `API_AUDIT_LOG`).
2. `cd gas-runtime-api`
3. `clasp login` (if needed)
4. Set `scriptId` in `.clasp.json` or `clasp create --type sheets --title "CBV RF12 Runtime API"`
5. `clasp push`
6. Apps Script → Deploy → New deployment → Web App
   - Execute as: **Me**
   - Access: **Anyone with link**
7. Copy Web App URL to `workers/api/.dev.vars`:

```
CBV_GAS_API_BASE_URL=https://script.google.com/macros/s/.../exec
CBV_TASK_WRITE_MODE=gas
```

## Contract

- **GET** `?action=health|tasks|task_detail&taskId=...`
- **POST** JSON `{ action, payload, traceId, _actor }`
  - Allowed: `create_task`, `update_task`, `append_timeline`

All responses: `{ ok, status, data, warnings, errors, traceId }`

## Safety

- Append-only timeline and audit log
- No delete, no bulk update, no destructive schema changes
- Worker validates permissions before calling GAS
