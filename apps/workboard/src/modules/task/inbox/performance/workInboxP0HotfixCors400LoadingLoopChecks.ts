/**
 * PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxP0HotfixCors400LoadingLoopChecks } from './src/modules/task/inbox/performance/workInboxP0HotfixCors400LoadingLoopChecks.ts'; const r = runWorkInboxP0HotfixCors400LoadingLoopChecks(); console.log(r.status, r.checks.filter(c=>!c.pass).map(c=>c.id));"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

function readWorker(rel: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'workers', 'api', 'src', rel),
    'utf8',
  );
}

function readInbox(rel: string): string {
  return readFileSync(join(__dir, '..', rel), 'utf8');
}

export interface HotfixCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR';
  detail?: string;
}

export function runWorkInboxP0HotfixCors400LoadingLoopChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: HotfixCheck[];
  warnings: string[];
} {
  const checks: HotfixCheck[] = [];
  const warnings: string[] = [];

  const push = (id: string, label: string, pass: boolean, detail?: string) => {
    checks.push({ id, label, pass, severity: pass ? 'OK' : 'ERROR', detail });
  };

  const cors = readWorker('cors.ts');
  const router = readWorker('router.ts');
  const routeParams = readWorker('utils/routeParams.ts');
  const client = readRoot('api/client.ts');
  const taskWrite = readRoot('modules/task/TaskWriteContext.tsx');
  const operationalApi = readInbox('operationalRuntime/workInboxOperationalApi.ts');
  const operationalHook = readInbox('operationalRuntime/useWorkInboxOperationalBundle.ts');
  const rightTabs = readInbox('focusRuntime/RightContextTabs.tsx');
  const tasksPage = readRoot('modules/task/TasksPage.tsx');
  const focusHost = readInbox('actionRuntime/WorkInboxFocusActionHost.tsx');
  const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
  const perfTrace = readInbox('performance/workInboxPerformanceTrace.ts');
  const combinedClient = readInbox('actionRuntime/workInboxCombinedActionClient.ts');

  push(
    'HOTFIX_CORS_ALLOWS_TRACE_ID_HEADER',
    'CORS Allow-Headers includes X-CBV-Trace-Id',
    cors.includes('X-CBV-Trace-Id') && cors.includes('x-cbv-trace-id'),
  );
  push(
    'HOTFIX_OPTIONS_RECORD_ACTION_ROUTE',
    'Router handles OPTIONS preflight',
    router.includes("request.method === 'OPTIONS'") && router.includes('record-action'),
  );
  push(
    'HOTFIX_RECORD_ACTION_POST_NOT_PREFLIGHT_BLOCKED',
    'Combined action client sends trace header',
    combinedClient.includes('X-CBV-Trace-Id') && router.includes('/api/work-inbox/record-action'),
  );
  push(
    'HOTFIX_TASK_ID_URL_ENCODED',
    'FE encodeTaskId on task detail paths',
    client.includes('encodeTaskId') && client.includes('encodeURIComponent'),
  );
  push(
    'HOTFIX_TASK_ID_WORKER_DECODED',
    'Worker decodeRouteTaskId + validateTaskId',
    routeParams.includes('decodeRouteTaskId') && routeParams.includes('validateTaskId'),
  );
  push(
    'HOTFIX_REAL_TASK_ID_ACCEPTED',
    'Task id pattern allows TK_ hex ids',
    /\[A-Za-z0-9_\\-\]\+\$/.test(routeParams),
  );
  push(
    'HOTFIX_OPERATIONAL_400_RETURNS_JSON_ERROR',
    'Operational API parses JSON envelope on HTTP error',
    operationalApi.includes('res.json().catch') && operationalApi.includes('typeof body.ok'),
  );
  push(
    'HOTFIX_RIGHT_PANEL_LOADING_FINALLY',
    'Operational hook clears loading in finally',
    operationalHook.includes('finally') && operationalHook.includes('setLoading(false)'),
  );
  push(
    'HOTFIX_RIGHT_PANEL_ERROR_STATE',
    'Right panel shows detail/operational error UI',
    rightTabs.includes('detailError') && rightTabs.includes('operationalError'),
  );
  push(
    'HOTFIX_RIGHT_PANEL_RETRY',
    'Right panel retry buttons',
    rightTabs.includes('onRetryDetail') && rightTabs.includes('onRetryOperational'),
  );
  push(
    'HOTFIX_NO_INFINITE_LOADING_TEXT',
    'Detail loading gated by detailFetching not !detail',
    tasksPage.includes('detailFetching') && !tasksPage.includes('detailLoading={Boolean(taskId && !detail)}'),
  );
  push(
    'HOTFIX_TASK_WRITE_CONTEXT_NO_UPDATE_LOOP',
    'TaskWriteContext uses ref for changed handler',
    taskWrite.includes('changedHandlerRef') && !taskWrite.includes('setChangedHandler'),
  );
  push(
    'HOTFIX_CONTEXT_VALUE_MEMOIZED',
    'TaskWriteContext value useMemo',
    taskWrite.includes('useMemo<TaskWriteContextValue>'),
  );
  push(
    'HOTFIX_NO_LAYOUT_CHANGE',
    'No new layout shell — existing focus runtime panels',
    rightTabs.includes('work-inbox-right-context-tabs') && !rightTabs.includes('work-inbox-v4'),
  );
  push(
    'HOTFIX_RCLA_CONTEXT_NOT_BYPASSED',
    'RCLA registry still used in focus host',
    registry.includes('WorkInboxRuntimeContextProvider') && focusHost.includes('WorkInboxRuntimeContextProvider'),
  );
  push(
    'HOTFIX_TRACE_ID_STILL_PROPAGATES',
    'Trace header in combined client + operational API',
    combinedClient.includes('X-CBV-Trace-Id') && operationalApi.includes('X-CBV-Trace-Id'),
  );

  const failCount = checks.filter((c) => !c.pass).length;
  const status = failCount === 0 ? 'GO' : 'FAIL';

  return {
    suite: 'PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP',
    status,
    checks,
    warnings,
  };
}
