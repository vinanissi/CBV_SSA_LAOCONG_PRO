# PHASE_RF_09 — Cloudflare Worker API Bridge — Prompt (Archive)

> Append-only memory-first prompt archive. Phase: **PHASE_RF_09_CLOUDFLARE_WORKER_API_BRIDGE**

## Scope

- `workers/api/` — Cloudflare Worker TypeScript API bridge
- ApiEnvelope on all endpoints
- Auth stub (`x-cbv-role`, default MANAGER, LOCAL_STUB)
- Permission filtering on Worker
- mockData projection + gasAdapter/appSheetAdapter skeleton
- CORS for `http://localhost:5173`
- FE switch via `VITE_CBV_API_BASE_URL=http://localhost:8787`
- No write actions, no secrets, no GAS rewrite

## Next phase

**PHASE_RF_10_LOCAL_RUNTIME_INTEGRATION_UAT**
