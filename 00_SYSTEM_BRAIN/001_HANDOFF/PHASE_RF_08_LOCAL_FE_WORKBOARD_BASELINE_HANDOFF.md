# Handoff — PHASE_RF_08 Local FE Workboard Baseline

## Summary

Local React workboard lives at **`apps/workboard/`**. Runs with demo data by default. GAS runtime lock v1 untouched.

## Run locally

```bash
cd apps/workboard
npm install
npm run dev
```

Open http://localhost:5173

## Env

Copy `.env.example` → `.env`. Set `VITE_CBV_API_BASE_URL` only when Worker exists (RF_09). Empty = mockApi.

## What works

- PC AppShell: top bar, left nav, main queue, right detail (xl+), bottom quick bar
- All routes: `/`, `/tasks`, `/finance`, `/hoso`, `/coordination`, `/observation`, `/plugins`, `/search`
- Global search via top bar → `/search?q=...`
- PermissionGate + read-only finance/ho_so copy
- Quick actions: navigate/view only; upload/assign/confirm disabled

## What does NOT work yet

- Real API / auth / Sheet projection (RF_09)
- Write paths (by design — locked semantics preserved in UI copy)
- Cloudflare Pages deploy (documented in README, not executed)

## Do NOT

- Call Google Sheet from FE
- Embed secrets in `apps/workboard`
- Change GAS runtime lock contracts without migration decision
- Re-enable WebApp as primary FE

## Verify

```bash
cd apps/workboard
npm run typecheck
npm run build
npm run preview
```

## Next phase

**PHASE_RF_09_CLOUDFLARE_WORKER_API_BRIDGE**

- Worker routes matching `src/api/contracts.ts`
- Envelope `ApiEnvelope<T>` parity
- Point FE at Worker; keep writes EXECUTION_LOCKED
