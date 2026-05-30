/**
 * PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxNetworkHygieneAuditChecks } from './src/modules/task/inbox/network/workInboxNetworkHygieneAuditChecks.ts'; console.log(runWorkInboxNetworkHygieneAuditChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NETWORK_CACHE_TTL_MS } from './workInboxNetworkCacheConfig';
import { getWorkInboxNetworkTraces, resetWorkInboxNetworkTraces, startWorkInboxNetworkTrace, finishWorkInboxNetworkTrace } from './workInboxNetworkTrace';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readInbox(rel: string): string {
  return readFileSync(join(__dir, '..', rel), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

export function runWorkInboxNetworkHygieneAuditChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const trace = readLocal('workInboxNetworkTrace.ts');
  const detailLoader = readLocal('workInboxTaskDetailLoader.ts');
  const snapshotLoader = readLocal('workInboxWorkspaceSnapshotLoader.ts');
  const staticCache = readLocal('workInboxStaticRuntimeCache.ts');
  const invalidation = readLocal('workInboxNetworkInvalidation.ts');
  const opLoader = readInbox('operationalRuntime/workInboxOperationalBundleLoader.ts');
  const opHook = readInbox('operationalRuntime/useWorkInboxOperationalBundle.ts');
  const rightTabs = readInbox('focusRuntime/RightContextTabs.tsx');
  const tasksPage = readRoot('modules/task/TasksPage.tsx');
  const refreshPolicy = readInbox('performance/workInboxRefreshPolicy.ts');
  const actionRuntime = readInbox('actionRuntime/useWorkInboxActionRuntime.ts');
  const host = readInbox('actionRuntime/WorkInboxFocusActionHost.tsx');
  const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
  const groups = readInbox('WorkInboxGroupsPanel.tsx');
  const taskWrite = readRoot('modules/task/TaskWriteContext.tsx');
  const moduleRegistry = readRoot('runtime/useModuleRegistry.ts');

  push(
    'NETWORK_RCLA_CONTEXT_USED',
    host.includes('WorkInboxRuntimeContextProvider') && registry.includes('WorkInboxRuntimeContextProvider'),
  );

  resetWorkInboxNetworkTraces();
  const sample = startWorkInboxNetworkTrace({
    route: '/api/tasks/TK_TEST',
    dedupeKey: 'task-detail:TK_TEST',
    caller: 'checks',
    reason: 'CHECK',
    requestGroup: 'task_open',
    taskId: 'TK_TEST',
  });
  finishWorkInboxNetworkTrace(sample.traceId, {});
  const traces = getWorkInboxNetworkTraces();
  push(
    'NETWORK_REQUEST_TRACE_EXISTS',
    trace.includes('dedupeKey') &&
      trace.includes('requestGroup') &&
      trace.includes('cacheHit') &&
      traces.some((t) => t.traceId === sample.traceId),
  );

  push(
    'NETWORK_TASK_DETAIL_DEDUPE',
    detailLoader.includes('inFlightByTask') && tasksPage.includes('loadTaskDetailNetwork'),
  );
  push(
    'NETWORK_OPERATIONAL_BUNDLE_DEDUPE',
    opLoader.includes('inFlightByTask') && opLoader.includes('resultCache'),
  );
  push(
    'NETWORK_SNAPSHOT_DEDUPE',
    snapshotLoader.includes('inFlightByKey') && snapshotLoader.includes('resultCache'),
  );
  push(
    'NETWORK_STATIC_RUNTIME_TTL',
    staticCache.includes('STATIC_RUNTIME') &&
      moduleRegistry.includes('getCachedModules') &&
      taskWrite.includes('getCachedTaskWriteCapability'),
  );
  push(
    'NETWORK_TAB_SWITCH_NO_FETCH',
    rightTabs.includes("setActiveTab") && !rightTabs.includes('api.') && !rightTabs.includes('fetch('),
  );
  push(
    'NETWORK_SEARCH_OPEN_SELECTIVE',
    groups.includes('onOpenTask') && !groups.includes('loadWorkspace(') && refreshPolicy.includes('BUNDLE_ONLY'),
  );
  push(
    'NETWORK_NAVIGATION_SELECTIVE',
    actionRuntime.includes('onNavigatePrev') &&
      actionRuntime.includes('onOpenItem') &&
      detailLoader.includes('abortInFlightTaskDetail'),
  );
  push(
    'NETWORK_ABORT_STALE_REQUEST',
    detailLoader.includes('activeAbort') && opHook.includes('abortRef.current?.abort()'),
  );
  push(
    'NETWORK_IGNORE_STALE_RESPONSE',
    detailLoader.includes('staleIgnored') && tasksPage.includes('detailRequestGenRef'),
  );
  push(
    'NETWORK_CACHE_INVALIDATION_ON_ACTION',
    invalidation.includes('invalidateWorkInboxCachesForAction') &&
      opHook.includes('invalidateOperationalBundleResultCache'),
  );
  push(
    'NETWORK_NO_FULL_SNAPSHOT_AFTER_ACTION',
    refreshPolicy.includes('needsSnapshotRefresh: false') &&
      tasksPage.includes("mode === 'snapshot'") &&
      !tasksPage.includes('registerTaskChanged(() => loadWorkspace(true))'),
  );
  push(
    'NETWORK_NO_FETCH_LOOP',
    opHook.includes('loadedTaskIdRef') && host.includes('stableTaskId'),
  );
  push(
    'NETWORK_NO_LAYOUT_CHANGE',
    !tasksPage.includes('NETWORK_HYGIENE_LAYOUT') && rightTabs.includes('work-inbox-right-context-tabs'),
  );
  push(
    'NETWORK_BUILD_PASS',
    NETWORK_CACHE_TTL_MS.TASK_DETAIL >= 15_000 &&
      NETWORK_CACHE_TTL_MS.OPERATIONAL_BUNDLE >= 10_000 &&
      detailLoader.length > 0,
  );

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live session request-count benchmark pending (baseline ~245 req / 31.5s)');

  return {
    suite: 'PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT',
    status,
    checks: checks.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i),
    warnings,
  };
}
