# PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — Test Evidence

**Date:** 2026-05-30  
**Verdict:** GO_WITH_WARNINGS

## Static checks

```text
Command: npx tsx -e "import { runWorkInboxNetworkHygieneAuditChecks } from './src/modules/task/inbox/network/workInboxNetworkHygieneAuditChecks.ts'; console.log(runWorkInboxNetworkHygieneAuditChecks());"

Result: GO_WITH_WARNINGS — 16/16 checks PASS
Warnings: Live session request-count benchmark pending
```

Check IDs: NETWORK_RCLA_CONTEXT_USED, NETWORK_REQUEST_TRACE_EXISTS, NETWORK_TASK_DETAIL_DEDUPE, NETWORK_OPERATIONAL_BUNDLE_DEDUPE, NETWORK_SNAPSHOT_DEDUPE, NETWORK_STATIC_RUNTIME_TTL, NETWORK_TAB_SWITCH_NO_FETCH, NETWORK_SEARCH_OPEN_SELECTIVE, NETWORK_NAVIGATION_SELECTIVE, NETWORK_ABORT_STALE_REQUEST, NETWORK_IGNORE_STALE_RESPONSE, NETWORK_CACHE_INVALIDATION_ON_ACTION, NETWORK_NO_FULL_SNAPSHOT_AFTER_ACTION, NETWORK_NO_FETCH_LOOP, NETWORK_NO_LAYOUT_CHANGE, NETWORK_BUILD_PASS

## Build

```text
Command: npm run build (apps/workboard)
Result: PASS (tsc --noEmit && vite build)
```

## Live benchmark

Not run in this session. Baseline reference: ~245 requests / 31.5s session.

## Manual smoke (recommended)

1. Open `/inbox/:taskId` — Network: ≤1 GET detail, ≤1 GET operational
2. Switch Chi tiết / Timeline / Handoff / Tài liệu — no new XHR
3. Record-action Pause — no workspace-snapshot XHR; optional deferred operational
4. Ctrl+K search open — no workspace-snapshot XHR
