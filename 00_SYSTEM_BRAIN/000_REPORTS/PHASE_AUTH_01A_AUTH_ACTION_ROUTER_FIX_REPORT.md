# PHASE_AUTH_01A — Auth Action Router Fix — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO_WITH_WARNINGS

---

## Problem

`POST action=authLogin` returned:

```
Action không được phép: authLogin
```

FE/Worker reached GAS, but request hit **RF_12 legacy default branch** instead of auth router.

## Root Cause

Same class as GS_02A: auth actions not reliably registered/routed at `Code.js` doPost entry before RF_12 switch. Deployed Web App may lack auth module or use non-canonical guard names.

## Fix Applied

1. **Canonical router guards**
   - `cbvIsAuthAction_(action)` — whitelist + fallback `CBV_AUTH_DB_ACTIONS`
   - `cbvRouteAuthPost_(e, body, traceId)` — delegates to `authDbDoPost_`

2. **Public handlers** (spec names)
   - `CBV_Auth_login(payload, actor, traceId)`
   - `CBV_Auth_me(payload, actor, traceId)`
   - `CBV_Auth_logout(payload, actor, traceId)`
   - `CBV_Auth_getUserDirectory(payload, actor, traceId)`
   - `CBV_Auth_isRegisteredAction` / `CBV_Auth_getAllowedActions`

3. **Code.js doPost order**
   ```
   auth (cbvIsAuthAction_) → task-db → RF_12 legacy
   ```

4. **UNKNOWN_ACTION** returns merged `allowedActions`:
   - RF_12: `create_task`, `update_task`, `append_timeline`
   - Auth: `authLogin`, `authMe`, `authLogout`, `getUserDirectory`
   - Task DB: `getTaskWorkspaceSnapshot`, …

5. **Test console:** `CBV_TCS_AUTH_01A_authActionRegistered()`

## Worker Verification

Worker adapter sends action exactly as **`authLogin`** — no rename needed.

## Files Changed

| File | Change |
|------|--------|
| `gas-runtime-api/authDbApi.js` | Router guards, merged allowedActions, CBV_Auth_* dispatch |
| `gas-runtime-api/authDbService.js` | CBV_Auth_* public wrappers |
| `gas-runtime-api/Code.js` | Auth route first, merged unknown response |
| `gas-runtime-api/authDbTestConsoleGs01a.js` | Test suite |

## Deploy

```bash
cd gas-runtime-api
clasp push --force
clasp deploy --description "AUTH_01A auth action router fix"
```

## Tests

| Check | Result |
|-------|--------|
| Worker typecheck | PASS |
| FE build | PASS |
| `clasp push` | PASS |
| Live `authLogin` E2E | PENDING — requires Web App deploy new version |

## Limitations

- `clasp deploy` may require manual deploy if domain-restricted (same as GS_02A)
- Until Web App redeployed, live URL may still serve old bundle

## Next

Run in GAS editor after deploy: `CBV_TCS_AUTH_01A_runAll()`

Login test: DISPLAY_NAME + 1234 via FE or `POST /api/auth/login`
