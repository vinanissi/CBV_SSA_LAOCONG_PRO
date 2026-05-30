# PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — Handoff

**Status:** GO_WITH_WARNINGS  
**Next owner:** Pilot operator / performance verification

## What shipped

- Unified FE network trace: `apps/workboard/src/modules/task/inbox/network/workInboxNetworkTrace.ts`
- Deduped loaders: task detail, workspace snapshot, operational bundle (extended)
- Static runtime TTL cache: modules, status, write-capability
- TasksPage: no full snapshot after inline/focus actions; snapshot only on task create
- RightContextTabs: unchanged — no fetch on tab switch (bundle props only)

## Verify in pilot

```powershell
cd apps/workboard
npx tsx -e "import { runWorkInboxNetworkHygieneAuditChecks } from './src/modules/task/inbox/network/workInboxNetworkHygieneAuditChecks.ts'; console.log(runWorkInboxNetworkHygieneAuditChecks());"
npm run build
```

DevTools: open one task, switch tabs, run Pause — expect no snapshot XHR after action.

## Do not regress

- P0/P1 latency fixes (combined action, deferred bundle, append fast path)
- Operational fetch loop hotfix (stable taskId, abort)
- Search runtime (local index, no loadWorkspace on search open)
- RCLA context provider path

## Follow-up (optional)

- Live session benchmark vs ~245 req baseline
- Wire `requestGroup: 'next_previous'` explicitly in navigation open path
- Server-side cache headers for static runtime if Worker supports it
