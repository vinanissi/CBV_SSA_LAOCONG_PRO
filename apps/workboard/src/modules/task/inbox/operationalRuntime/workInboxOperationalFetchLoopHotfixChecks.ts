/**
 * PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxOperationalFetchLoopHotfixChecks } from './src/modules/task/inbox/operationalRuntime/workInboxOperationalFetchLoopHotfixChecks.ts'; console.log(runWorkInboxOperationalFetchLoopHotfixChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function read(rel: string): string {
  return readFileSync(join(__dir, rel), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel), 'utf8');
}

export function runWorkInboxOperationalFetchLoopHotfixChecks(): {
  suite: string;
  status: 'GO' | 'FAIL';
  checks: { id: string; pass: boolean }[];
} {
  const hook = read('useWorkInboxOperationalBundle.ts');
  const loader = read('workInboxOperationalBundleLoader.ts');
  const trace = read('workInboxOperationalBundleTrace.ts');
  const api = read('workInboxOperationalApi.ts');
  const host = read('../actionRuntime/WorkInboxFocusActionHost.tsx');
  const actionRt = read('../actionRuntime/useWorkInboxActionRuntime.ts');
  const taskWrite = readRoot('modules/task/TaskWriteContext.tsx');
  const rightTabs = read('../focusRuntime/RightContextTabs.tsx');
  const refreshPolicy = read('../performance/workInboxRefreshPolicy.ts');

  const checks = [
    { id: 'OP_BUNDLE_SINGLE_FETCH', pass: hook.includes('loadedTaskIdRef.current === id && bundleRef.current') },
    { id: 'OP_BUNDLE_NO_FETCH_LOOP', pass: hook.includes('[taskId]') && hook.includes('generationRef') && hook.includes('runLoadRef') },
    {
      id: 'OP_BUNDLE_TAB_SWITCH_NO_RELOAD',
      pass: !rightTabs.includes('getTaskOperational') && !rightTabs.includes('useWorkInboxOperationalBundle'),
    },
    { id: 'OP_BUNDLE_ABORT_STALE_REQUEST', pass: hook.includes('AbortController') && hook.includes('generationRef') },
    { id: 'OP_BUNDLE_LATEST_REQUEST_WINS', pass: hook.includes('generation !== generationRef.current') },
    { id: 'OP_BUNDLE_DEDUPE_IN_FLIGHT', pass: loader.includes('inFlightByTask') },
    { id: 'OP_BUNDLE_TRACE_LOG', pass: trace.includes('requestId') && trace.includes('caller') && trace.includes('reason') },
    { id: 'OP_BUNDLE_LOAD_ENTRY', pass: loader.includes('loadOperationalBundle') && hook.includes('loadOperationalBundle') },
    { id: 'OP_BUNDLE_API_ABORT_SIGNAL', pass: api.includes('signal?: AbortSignal') },
    { id: 'OP_BUNDLE_STABLE_TASK_ID', pass: host.includes('stableTaskId') && host.includes('selectedTaskId') },
    { id: 'OP_BUNDLE_STABLE_REFRESH', pass: host.includes('stableRefreshOperational') && host.includes('refreshForAction') },
    { id: 'OP_BUNDLE_ACTION_REFRESH_SEPARATE', pass: hook.includes('ACTION_REFRESH') },
    { id: 'TASK_WRITE_CONTEXT_NO_INFINITE_LOOP', pass: taskWrite.includes('changedHandlerRef') && !taskWrite.includes('setChangedHandler') },
    { id: 'TASK_WRITE_CONTEXT_CAPABILITY_GUARD', pass: taskWrite.includes('return prev') },
    { id: 'ACTION_RT_STABLE_REFRESH_REF', pass: actionRt.includes('refreshOpRef') && actionRt.includes('triggerOperationalRefresh') },
    { id: 'REFRESH_POLICY_MANUAL_ONLY', pass: refreshPolicy.includes('needsOperationalBundleRefresh') },
  ];

  const failCount = checks.filter((c) => !c.pass).length;
  return {
    suite: 'PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX',
    status: failCount === 0 ? 'GO' : 'FAIL',
    checks,
  };
}
