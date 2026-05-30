# PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0 — Test Evidence

**Date:** 2026-05-30  
**Verdict:** GO_WITH_WARNINGS

## Static suite

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxRuntimePerformanceP0Checks } from './src/modules/task/inbox/performance/workInboxRuntimePerformanceP0Checks.ts'; const r = runWorkInboxRuntimePerformanceP0Checks(); console.log(r.status, r.checks.filter(c=>!c.pass).map(c=>c.id)); console.log(r.checks.filter(c=>c.pass).length + '/' + r.checks.length);"
```

**Expected:** 21/21 PASS, status `GO` or `GO_WITH_WARNINGS`.

## Build

```powershell
cd apps/workboard
npm run build
```

**Result:** PASS (tsc + vite)

## Live benchmark

**Status:** NOT RUN — requires GAS + Worker deploy.

## Post-deploy verification

1. Start Processing → Network tab shows **1** POST to `/api/work-inbox/record-action`.
2. No GET `workspace-snapshot` immediately after action.
3. Response includes `combinedActionUsed: true`, `refreshPolicy: BUNDLE_ONLY`.
4. GAS `performanceTrace.rowIndexCacheHit: true` on second mutation same session.
5. `sessionStorage` perf traces show `snapshotRefreshSkipped: true`.
