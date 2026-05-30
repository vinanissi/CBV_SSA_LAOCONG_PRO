# PHASE_RF_08 — Local FE Workboard Baseline — Prompt (Archive)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

> Append-only memory-first prompt archive. Phase: **PHASE_RF_08_LOCAL_FE_WORKBOARD_BASELINE**

## Decision

- **No** Google Apps Script WebApp as primary FE.
- GAS/WebApp: legacy runtime, automation/helper, legacy adapter only.
- **Primary FE from RF_08:** React local app → Cloudflare Pages (future) → Cloudflare Worker API bridge (future).

## Scope

- `apps/workboard/` — Vite + React + TypeScript + Tailwind
- PC operator layout (TopBar / Left Nav / Main / Right Context / Bottom Quick Bar)
- Routes: `/`, `/tasks`, `/finance`, `/hoso`, `/coordination`, `/observation`, `/plugins`, `/search`
- API contract + mockApi (no direct Google Sheet from FE)
- Read-only / navigate quick actions only (EXECUTION_LOCKED → user-friendly copy)
- Cloudflare-ready README; no deploy in RF_08

## Out of scope

AI phase, automation, backend rewrite, DB migration, AppSheet replacement, WebApp rewrite.

## Acceptance

PASS when build passes, all routes render, mock search works, no secrets, no GAS breakage, report/handoff/evidence committed.

## Next phase

**PHASE_RF_09_CLOUDFLARE_WORKER_API_BRIDGE**
