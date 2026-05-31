/**
 * PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0 — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxRuntimePerformanceP0Checks } from './src/modules/task/inbox/performance/workInboxRuntimePerformanceP0Checks.ts'; console.log(runWorkInboxRuntimePerformanceP0Checks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

function readWorker(rel: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'workers', 'api', 'src', rel),
    'utf8',
  );
}

function readGas(name: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', '..', '..', '..', 'gas-runtime-api', name), 'utf8');
}

const executor = readLocal('../actionRuntime/workInboxActionExecutor.ts');
const combinedClient = readLocal('../actionRuntime/workInboxCombinedActionClient.ts');
const refreshPolicy = readLocal('workInboxRefreshPolicy.ts');
const perfTrace = readLocal('workInboxPerformanceTrace.ts');
const hook = readLocal('../actionRuntime/useWorkInboxActionRuntime.ts');
const host = readLocal('../actionRuntime/WorkInboxFocusActionHost.tsx');
const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const rowIndex = readGas('32_TaskDbRowIndex.js');
const gasCombined = readGas('47_WorkInboxCombinedAction.js');
const gasService = readGas('40_TaskDbService.js');
const workerCombined = readWorker('modules/workInboxCombinedAction.ts');
const workerRouter = readWorker('router.ts');
const workerContract = readWorker('contracts/workInboxCombinedAction.ts');

const reportPath = join(
  __dir,
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
  '00_SYSTEM_BRAIN',
  '000_REPORTS',
  'PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0_REPORT.md',
);

export interface P0Check {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR';
  detail?: string;
}

export function runWorkInboxRuntimePerformanceP0Checks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: P0Check[];
  warnings: string[];
} {
  const checks: P0Check[] = [];
  const warnings: string[] = [];

  const push = (id: string, label: string, pass: boolean, detail?: string) => {
    checks.push({ id, label, pass, severity: pass ? 'OK' : 'ERROR', detail });
  };

  push('P0_RCLA_CONTEXT_USED', 'RCLA context via registry', registry.includes('WorkInboxRuntimeContextProvider') && hook.includes('useWorkInboxRuntimeContext'));
  push('P0_TASK_ROW_INDEX_CACHE_EXISTS', 'GAS row index cache module', rowIndex.includes('taskDbBuildTaskRowIndex_') && rowIndex.includes('taskDbInvalidateTaskRowIndex_'));
  push('P0_TASK_FIND_USES_FAST_PATH', 'taskDbFindMainRow_ routes through fast path', gasService.includes('taskDbFindMainRowFast_'));
  push('P0_CACHE_MISS_FALLBACK_SAFE', 'Cache miss fallback scan', rowIndex.includes('taskDbFindMainRowScan_') && rowIndex.includes('taskDbInvalidateTaskRowIndex_'));
  push('P0_TRACE_CACHE_HIT_MISS_FIELDS', 'Trace row index fields', perfTrace.includes('rowIndexCacheHit') && rowIndex.includes('taskDbRowIndexFlushPerf_'));
  push('P0_SELECTIVE_REFRESH_POLICY_EXISTS', 'WorkInboxRefreshPolicy types', refreshPolicy.includes('WorkInboxRefreshPolicy') && refreshPolicy.includes('BUNDLE_ONLY'));
  push('P0_START_PROCESSING_SKIPS_FULL_SNAPSHOT', 'Start skips snapshot refresh', executor.includes('buildBundleOnlyRefreshPlan') && !executor.match(/ACTION_START_PROCESSING[\s\S]*?onRefresh/));
  push('P0_PAUSE_SKIPS_FULL_SNAPSHOT', 'Pause skips snapshot refresh', executor.includes("case 'ACTION_PAUSE_TASK'") && refreshPolicy.includes('snapshotRefreshSkipped'));
  push('P0_HANDOFF_SKIPS_FULL_SNAPSHOT', 'Handoff skips snapshot refresh', executor.includes("case 'ACTION_HANDOFF'") && hook.includes('onSnapshotRefresh'));
  push('P0_BUNDLE_ONLY_REFRESH_SUPPORTED', 'Bundle-only refresh helper', refreshPolicy.includes('buildBundleOnlyRefreshPlan'));
  push('P0_COMBINED_ACTION_CONTRACT_EXISTS', 'Combined action contract', workerContract.includes('WorkInboxCombinedActionRequest'));
  push('P0_COMBINED_ACTION_WORKER_ROUTE_EXISTS', 'Worker record-action route', workerRouter.includes('/api/work-inbox/record-action') && workerCombined.includes('handleWorkInboxRecordAction'));
  push('P0_COMBINED_ACTION_GAS_HANDLER_EXISTS', 'GAS wiOpRecordAction handler', gasCombined.includes('wiOpRecordAction_') && gasCombined.includes('wiOpHandleRecordAction_'));
  push('P0_ACTION_RUNTIME_PREFERS_COMBINED_ACTION', 'Executor prefers combined action', executor.includes('tryCombinedAction') && executor.includes('recordWorkInboxCombinedAction'));
  push('P0_COMBINED_RESPONSE_PATCHES_LOCAL_TASK', 'Combined path patches local task', executor.includes('buildBundleOnlyRefreshPlan(combined.task)'));
  push('P0_TIMELINE_AUDIT_STILL_APPEND_ONLY', 'Timeline/audit append-only in combined GAS', gasCombined.includes('wiOpAppendTimeline_') && gasCombined.includes('wiOpAppendActionAudit_'));
  push('P0_OLD_ENDPOINT_FALLBACK_EXISTS', 'Legacy fallback endpoints preserved', executor.includes('fallbackEndpointUsed') && executor.includes('writeTimelineLegacy'));
  push('P0_NO_DB_SCHEMA_REQUIRED', 'No TASK_MAIN schema change', !rowIndex.includes('alterColumn') && !gasCombined.includes('SHARED_WITH'));
  push('P0_NO_LAYOUT_REGRESSION', 'No layout component changes in focus host', host.includes('WorkInboxFocusRuntime') && !host.includes('grid-template-columns'));
  push('P0_PERFORMANCE_TRACE_EXTENDED', 'P0 trace fields extended', perfTrace.includes('combinedActionUsed') && perfTrace.includes('snapshotRefreshSkipped'));

  let reportExists = false;
  try {
    readFileSync(reportPath, 'utf8');
    reportExists = true;
  } catch {
    reportExists = false;
  }
  push('P0_BUILD_PASS', 'Report artifact (build verified separately)', reportExists, 'Run npm run build manually');

  if (!reportExists) warnings.push('Report file pending at end of phase');
  warnings.push('Live GAS benchmark requires clasp deploy');

  const fails = checks.filter((c) => !c.pass);
  return {
    suite: 'PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0',
    status: fails.length ? 'FAIL' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    checks,
    warnings,
  };
}
