# CBV Workboard — Local Operational FE

React workboard for PC operators. Runs locally with demo data; connects to Cloudflare Worker API bridge in RF_09+.

## Prerequisites

- Node.js 20+
- npm 10+

## Local development

```bash
cd apps/workboard
npm install
npm run dev
```

Open http://localhost:5173

Without `VITE_CBV_API_BASE_URL`, the app uses **local demo data** (no Google Sheet calls from the browser).

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_CBV_API_BASE_URL` | Worker API base URL. Empty = demo data. Example: `http://localhost:8787` |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |

## Build

```bash
npm run build
npm run preview
```

## Cloudflare Pages (future — RF_09+)

1. Connect repo; set root directory to `apps/workboard`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment: `VITE_CBV_API_BASE_URL=https://your-worker.example.com`

No secrets in the frontend. Auth and Sheet access stay on the Worker.

## Architecture

```
Google Sheet / AppSheet → GAS (legacy) → Cloudflare Worker (RF_09) → React Workboard
```

RF_08: FE + mock API only. GAS runtime lock v1 unchanged.

## Routes

| Route | Page |
|-------|------|
| `/` | Hôm nay |
| `/tasks` | Việc |
| `/finance` | Tài chính (chỉ xem) |
| `/hoso` | Hồ sơ (chỉ xem) |
| `/coordination` | Phối hợp |
| `/observation` | Thông báo |
| `/plugins` | Mô-đun |
| `/search` | Tìm kiếm |

Write actions are disabled in this version (`Chỉ xem trong phiên bản này`).
