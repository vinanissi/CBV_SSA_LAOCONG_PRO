# HANDOFF — PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP

## Status

Hotfix **complete** for CORS, 400 task routes, right-panel loading lifecycle, and `TaskWriteContext` update loop. P0 performance changes **not** rolled back.

## What was fixed

1. Worker CORS allows trace header preflight.
2. Task id encode/decode + validation on Worker task and work-inbox routes.
3. FE detail/operational loading with error, retry, empty state, 10s degraded.
4. `TaskWriteContext` infinite re-render loop.

## Verify locally

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxP0HotfixCors400LoadingLoopChecks } from './src/modules/task/inbox/performance/workInboxP0HotfixCors400LoadingLoopChecks.ts'; const r = runWorkInboxP0HotfixCors400LoadingLoopChecks(); console.log(r.status, r.checks.filter(c=>!c.pass));"
npm run build
```

Browser: Work Inbox focus mode → open real task → confirm right panel loads or shows error/retry (not stuck spinner).

## Next operator

- If Worker `typecheck` blocks CI, fix P0 trace envelope types in `workers/api/src/modules/workInboxPerformanceTrace.ts` + `router.ts` (separate from this hotfix).
- Commit hotfix files when ready (see report file list).

## References

- Report: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP_REPORT.md`
- P0 baseline: `PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0_REPORT.md`
- ADR: `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md`
