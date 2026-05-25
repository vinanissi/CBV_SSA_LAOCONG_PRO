# Handoff — PHASE_RF_12 GAS Runtime Bridge Real Google Sheet Connection

## What shipped

- **`gas-runtime-api/`** — standalone GAS Web App (JSON API for Worker)
- **Worker GAS adapter** — read tasks/detail, create/update via GAS POST contract
- **Append-only** timeline + API audit log on every GAS write
- **Rollback-safe** — GAS timeout/unavailable → Worker returns FAIL envelope, falls back to mock reads

## Deploy GAS (operator steps)

1. Bind `gas-runtime-api` to target Spreadsheet (or create new)
2. `cd gas-runtime-api`
3. Set `scriptId` in `.clasp.json` → `clasp push`
4. Deploy → Web App → Execute as **Me**, Access **Anyone with link**
5. Copy URL to `workers/api/.dev.vars`:

```ini
CBV_GAS_API_BASE_URL=https://script.google.com/macros/s/.../exec
CBV_TASK_WRITE_MODE=gas
```

6. Restart Worker: `cd workers/api && npm run dev`

## Verify

```powershell
Invoke-RestMethod http://localhost:8787/api/health
Invoke-RestMethod http://localhost:8787/api/tasks -Headers @{ "x-cbv-role" = "MANAGER" }
```

Create task → check `TASKS`, `TASK_TIMELINE`, `API_AUDIT_LOG` sheets.

## Env matrix

| CBV_TASK_WRITE_MODE | CBV_GAS_API_BASE_URL | Behavior |
|---------------------|----------------------|----------|
| `local` | empty | RF_11 local write + mock reads |
| `gas` | set | GAS Sheet read/write |
| `locked` | any | Writes blocked (423) |

## Known gaps

- Finance/HoSo GAS writes **not** enabled
- Worker auth is header stub — production auth deferred
- GAS deploy URL not committed (by design)

## Files to review

- `gas-runtime-api/Code.js` — API entry
- `workers/api/src/adapters/gasAdapter.ts` — Worker client
- `workers/api/.dev.vars.example` — env template

## Next

RF_13 operator workflow acceleration (no architecture rewrite).
