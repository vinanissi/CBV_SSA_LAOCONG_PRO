# PHASE_AUTH_01A — Handoff

**Fix:** Auth action router — `authLogin` no longer falls through to RF_12

## Deploy (required)

```bash
cd gas-runtime-api
clasp push --force
clasp deploy --description "AUTH_01A auth action router fix"
```

If `clasp deploy` blocked: Apps Script → Deploy → Manage deployments → New version

## Verify

1. GAS editor: `CBV_TCS_AUTH_01A_runAll()` → status GO
2. Unknown action POST → `allowedActions` includes `authLogin` + task-db actions
3. FE login: DISPLAY_NAME + 1234
4. Worker: `POST http://localhost:8787/api/auth/login` with `{ "identifier": "...", "password": "1234" }`

## Router Order (doPost)

1. `cbvIsAuthAction_` → `cbvRouteAuthPost_`
2. `cbvIsTaskDbAction_` → `cbvRouteTaskDbPost_`
3. RF_12 legacy switch

## Do NOT

- Bypass Worker for login
- Add OAuth/JWT in this fix
- Create new user DB
