# CBV API Bridge — Cloudflare Worker

Read-first API bridge between React Workboard and future GAS/AppSheet adapters.

## Prerequisites

- Node.js 20+
- npm 10+

## Local development

```bash
cd workers/api
npm install
cp .dev.vars.example .dev.vars   # optional — edit if needed
npm run dev
```

Worker: http://localhost:8787  
Health: http://localhost:8787/api/health

## Connect FE

```bash
cd apps/workboard
cp .env.example .env
# VITE_CBV_API_BASE_URL=http://localhost:8787
npm run dev
```

Open http://localhost:5173

## Environment

| Variable | Description |
|----------|-------------|
| `CBV_ALLOWED_ORIGINS` | CORS origins (comma-separated). Default: `http://localhost:5173` |
| `CBV_GAS_API_BASE_URL` | Optional GAS adapter base (empty = mock projection) |
| `CBV_APPSHEET_API_BASE_URL` | Optional AppSheet base |
| `CBV_APPSHEET_API_KEY` | Optional AppSheet key — **never commit** |

Copy `.dev.vars.example` → `.dev.vars` for local wrangler.

## Auth stub

Default role: **MANAGER** (`LOCAL_STUB`).

Test roles via header:

```http
x-cbv-role: STAFF
```

Allowed: `ADMIN`, `MANAGER`, `STAFF`, `FINANCE`, `HO_SO`, `VIEW_ONLY`

## Endpoints

All responses use `ApiEnvelope`.

| Method | Path |
|--------|------|
| GET | `/api/health` |
| GET | `/api/me` |
| GET | `/api/today` |
| GET | `/api/tasks`, `/api/tasks/:taskId` |
| GET | `/api/finance`, `/api/finance/alerts` |
| GET | `/api/hoso`, `/api/hoso/alerts` |
| GET | `/api/coordination`, `/api/coordination/queue`, `/api/coordination/workload`, `/api/coordination/overdue` |
| GET | `/api/observation`, `/api/observation/health`, `/api/observation/alerts` |
| GET | `/api/plugins`, `/api/plugins/:pluginId` |
| GET | `/api/search?q=` |

POST/PUT/PATCH/DELETE → **405** (writes locked).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Wrangler local dev (:8787) |
| `npm run typecheck` | TypeScript check |
| `npm run deploy:dryrun` | Validate deploy config (no publish) |

## Deploy (future)

Not executed in RF_09. When ready:

```bash
npm run deploy:dryrun
wrangler deploy
```

Set secrets via `wrangler secret put` — never in repo.

## Architecture

```
Sheet/AppSheet → GAS (locked) → [gasAdapter] → Worker → React FE
```

RF_09: mock projection primary; GAS/AppSheet adapters skeleton only.
