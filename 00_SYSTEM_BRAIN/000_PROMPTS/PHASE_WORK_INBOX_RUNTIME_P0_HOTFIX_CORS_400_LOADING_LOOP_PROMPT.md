# PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP

**Objective:** Fix runtime regressions after Performance P0 without rollback.

## Fixes

1. **CORS** — Allow `X-CBV-Trace-Id` / `x-cbv-trace-id` on preflight; OPTIONS on Work Inbox routes.
2. **400 APIs** — Robust `taskId` encode/decode; structured validation logs; JSON errors.
3. **Right panel** — `finally` loading; error + retry; empty operational state; 10s degraded guard.
4. **React loop** — `TaskWriteContext` ref + memo; no `setState` in `registerTaskChanged`.

## Constraints

- No UI redesign, no schema change, no new features, no P0 rollback, keep traceId, CBV-RCLA v1.1.

## Tests

`runWorkInboxP0HotfixCors400LoadingLoopChecks()` — 16 checks.

## Build

- `npm run build` (apps/workboard)
- `npm run typecheck` (workers/api)
