# HANDOFF — PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX

## Done

- Single operational fetch per task selection (`loadOperationalBundle` + loaded guard).
- AbortController + generation — stale responses ignored.
- In-flight dedupe per `taskId`.
- Tab switches do not refetch.
- Stable `refreshOperational` for RCLA context / action runtime.
- Trace logging in dev (`[CBV OpBundle]`).

## Verify

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxOperationalFetchLoopHotfixChecks } from './src/modules/task/inbox/operationalRuntime/workInboxOperationalFetchLoopHotfixChecks.ts'; console.log(runWorkInboxOperationalFetchLoopHotfixChecks());"
npm run build
```

Network: one task open → ≤2 `operational` requests total.

## Report

`00_SYSTEM_BRAIN/000_REPORTS/PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX_REPORT.md`
