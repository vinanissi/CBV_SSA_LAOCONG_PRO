# PHASE_AUTH_01 — USER_DIRECTORY Login — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO_WITH_WARNINGS

---

## Summary

Implemented runtime login bound to existing **USER_DIRECTORY** sheet: FE → Worker → GAS. No new user DB. Session stored in **localStorage** (DEV/internal). Default password **1234** when PASSWORD column empty.

## Architecture

```
LoginPage → POST /api/auth/login → GAS authLogin → USER_DIRECTORY
         ← token (cbv1.*) + user + mustChangePassword

Subsequent requests → Authorization: Bearer cbv1.* → resolveUserContext → GAS actor
```

## GAS Actions

| Action | Purpose |
|--------|---------|
| `authLogin` | Validate identifier + password, audit, LAST_LOGIN_AT |
| `authMe` | Refresh user profile by userId |
| `authLogout` | Append logout audit |
| `getUserDirectory` | Active login-eligible users list |

## Login Rules

- Identifier: `USER_CODE`, `EMAIL`, or `DISPLAY_NAME` (case-insensitive)
- Allowed: `STATUS=ACTIVE`, `ALLOW_LOGIN=TRUE`, `IS_DELETED!=TRUE`
- Password: column `PASSWORD` if set, else default `1234`
- `mustChangePassword=true` when login with default password

## Role Mapping

| USER_DIRECTORY | Runtime Role |
|----------------|--------------|
| ADMIN / IS_ADMIN | ADMIN |
| SUPERVISOR / MANAGER / IS_SUPERVISOR | MANAGER |
| OPERATOR | STAFF |
| ACCOUNTANT | FINANCE |
| VIEWER | VIEW_ONLY |

Boolean columns `CAN_ASSIGN`, `CAN_APPROVE`, etc. augment permissions.

## Worker Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users` (ADMIN/MANAGER)
- `GET /api/me` — session-aware (legacy compat)

## FE Changes

- `LoginPage` when Worker connected and no session
- `localStorage` key `cbv_auth_session`
- TopBar: **DISPLAY_NAME**, role badge, logout
- Role-aware permissions via existing `userContext` + `taskPermissions`

## Audit

- `USER_LOGIN_LOG` if sheet exists
- Else `CBV_AUDIT_LOG` via `taskDbAppendAudit_`

## Files Changed

| Area | Files |
|------|-------|
| GAS | `authDbConfig.js`, `authDbService.js`, `authDbApi.js`, `Code.js` |
| Worker | `googleSheetAuthAdapter.ts`, `authHandlers.ts`, `session.ts`, `userContext.ts`, `router.ts`, `cors.ts`, `contracts.ts` |
| FE | `LoginPage.tsx`, `sessionStorage.ts`, `App.tsx`, `client.ts`, `TopBar.tsx`, `contracts.ts` |

## Tests

| Check | Result |
|-------|--------|
| Worker typecheck | PASS (local) |
| FE build | PASS (local) |
| Live GAS login E2E | PENDING — requires clasp push + Web App deploy |

## Limitations

- Session token is base64 JSON (no HMAC/JWT) — DEV/internal only
- PASSWORD column optional; production should set per-user passwords
- GAS Web App manual deploy required after clasp push

## Next Recommendations

1. Deploy GAS Web App new version
2. Set PASSWORD column on USER_DIRECTORY for production users
3. Phase AUTH_02: signed session or Cloudflare KV session store
