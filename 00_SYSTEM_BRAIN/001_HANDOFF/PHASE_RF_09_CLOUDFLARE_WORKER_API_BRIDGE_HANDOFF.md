# Handoff — PHASE_RF_09 Cloudflare Worker API Bridge

## Summary

Worker API bridge at **`workers/api/`**. FE connects via **`VITE_CBV_API_BASE_URL=http://localhost:8787`**.

## Run both locally

**Terminal 1 — Worker:**
```bash
cd workers/api
npm install
npm run dev
```

**Terminal 2 — FE:**
```bash
cd apps/workboard
cp .env.example .env
npm run dev
```

- Worker: http://localhost:8787/api/health  
- FE: http://localhost:5173

## Test roles

Set in `apps/workboard/.env`:
```
VITE_CBV_ROLE=STAFF
```

Or curl:
```bash
curl -H "x-cbv-role: FINANCE" http://localhost:8787/api/finance
```

## Env (Worker)

Copy `workers/api/.dev.vars.example` → `.dev.vars` (gitignored).

| Variable | Purpose |
|----------|---------|
| `CBV_GAS_API_BASE_URL` | Future GAS adapter (empty = mock) |
| `CBV_APPSHEET_API_BASE_URL` | Future AppSheet adapter |
| `CBV_APPSHEET_API_KEY` | AppSheet key — secret, never commit |
| `CBV_ALLOWED_ORIGINS` | CORS (default localhost:5173) |

## Locked semantics preserved

- All GET read-first
- POST/PUT/PATCH/DELETE → 405
- Write capabilities EXECUTION_LOCKED in plugin projection
- Worker filters by role (e.g. STAFF cannot `/api/finance`)

## Do NOT

- Commit `.dev.vars` or real API keys
- Enable write endpoints without migration decision
- Call Google Sheet from FE
- Change GAS runtime lock without RF process

## Verify

```bash
cd workers/api && npm run typecheck
cd apps/workboard && npm run build
```

## Next phase

**PHASE_RF_10_LOCAL_RUNTIME_INTEGRATION_UAT**
