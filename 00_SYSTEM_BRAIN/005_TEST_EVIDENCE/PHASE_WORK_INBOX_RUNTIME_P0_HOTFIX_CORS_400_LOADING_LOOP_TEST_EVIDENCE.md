# TEST EVIDENCE — PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP

**Date:** 2026-05-30

## Static checks

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxP0HotfixCors400LoadingLoopChecks } from './src/modules/task/inbox/performance/workInboxP0HotfixCors400LoadingLoopChecks.ts'; const r = runWorkInboxP0HotfixCors400LoadingLoopChecks(); console.log(r.status); console.log(r.checks.filter(c=>!c.pass).map(c=>c.id)); console.log(r.checks.filter(c=>c.pass).length + '/' + r.checks.length);"
```

**Result:** `GO` — **16/16** PASS

Check IDs: `HOTFIX_CORS_ALLOWS_TRACE_ID_HEADER`, `HOTFIX_OPTIONS_RECORD_ACTION_ROUTE`, `HOTFIX_RECORD_ACTION_POST_NOT_PREFLIGHT_BLOCKED`, `HOTFIX_TASK_ID_URL_ENCODED`, `HOTFIX_TASK_ID_WORKER_DECODED`, `HOTFIX_REAL_TASK_ID_ACCEPTED`, `HOTFIX_OPERATIONAL_400_RETURNS_JSON_ERROR`, `HOTFIX_RIGHT_PANEL_LOADING_FINALLY`, `HOTFIX_RIGHT_PANEL_ERROR_STATE`, `HOTFIX_RIGHT_PANEL_RETRY`, `HOTFIX_NO_INFINITE_LOADING_TEXT`, `HOTFIX_TASK_WRITE_CONTEXT_NO_UPDATE_LOOP`, `HOTFIX_CONTEXT_VALUE_MEMOIZED`, `HOTFIX_NO_LAYOUT_CHANGE`, `HOTFIX_RCLA_CONTEXT_NOT_BYPASSED`, `HOTFIX_TRACE_ID_STILL_PROPAGATES`.

## Build

```powershell
cd apps/workboard
npm run build
```

**Result:** PASS (`tsc --noEmit && vite build`)

## Worker typecheck

```powershell
cd workers/api
npm run typecheck
```

**Result:** FAIL — existing P0 module typing errors (documented in report §7). Hotfix files (`cors.ts`, `routeParams.ts`, `router.ts` parseRouteTaskId) compile in isolation; full package typecheck blocked by unrelated envelopes.

## Manual browser

Not run in CI session — use report §8 checklist with `npm run dev` + live Worker/GAS.
