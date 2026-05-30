# PHASE_AUTH_01 — Handoff

**From:** USER_DIRECTORY login implementation  
**Status:** GO_WITH_WARNINGS (pending live GAS deploy)

## Setup

Unchanged Worker `.dev.vars` — same GAS URL as task runtime.

```bash
cd workers/api && npm run dev
cd apps/workboard && npm run dev
```

## Deploy GAS

```bash
cd gas-runtime-api
clasp push --force
# Deploy → Manage deployments → New version
```

## Login Test

1. Open http://localhost:5173
2. Login with **DISPLAY_NAME** + **1234**
3. Or **EMAIL** + **1234**
4. Top bar shows DISPLAY_NAME + role from USER_DIRECTORY

## User Sheet Requirements

- `STATUS` = ACTIVE
- `ALLOW_LOGIN` = TRUE
- `IS_DELETED` != TRUE
- Optional `PASSWORD` column (else default 1234)

## API

```http
POST /api/auth/login
{ "identifier": "Tên hiển thị", "password": "1234" }

GET /api/auth/me
Authorization: Bearer cbv1....

POST /api/auth/logout
Authorization: Bearer cbv1....

GET /api/users
Authorization: Bearer cbv1....  (ADMIN/MANAGER)
```

## Do NOT

- Create new user DB sheet
- Use OAuth/JWT in this phase
- Commit `.dev.vars` secrets
