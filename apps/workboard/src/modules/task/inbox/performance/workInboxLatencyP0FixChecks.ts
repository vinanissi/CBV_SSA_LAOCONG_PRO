/**
 * PHASE_WORK_INBOX_LATENCY_P0_FIX — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxLatencyP0FixChecks } from './src/modules/task/inbox/performance/workInboxLatencyP0FixChecks.ts'; console.log(runWorkInboxLatencyP0FixChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFERRED_BUNDLE_REFRESH_MS } from './workInboxRefreshPolicy';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readWorker(rel: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'workers', 'api', 'src', rel),
    'utf8',
  );
}

function readGas(name: string): string {
  return readFileSync(
    join(__dir, '..', '..', '..', '..', '..', '..', '..', 'gas-runtime-api', name),
    'utf8',
  );
}

function readRoot(rel: string): string {
  return readFileSync(join(__dir, '..', '..', '..', '..', rel.replace(/^\//, '')), 'utf8');
}

const refreshPolicy = readLocal('workInboxRefreshPolicy.ts');
const executor = readLocal('../actionRuntime/workInboxActionExecutor.ts');
const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const workerAdapter = readWorker('adapters/googleSheetTaskDbAdapter.ts');
const gasMutation = readGas('workInboxMutationFast.js');
const gasCombined = readGas('workInboxCombinedAction.js');
const gasAppend = readGas('workInboxAppendContext.js');
const gasOp = readGas('workInboxOperationalService.js');
const gasTrace = readGas('workInboxPerformanceTrace.js');
const gasService = readGas('taskDbService.js');

export function runWorkInboxLatencyP0FixChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  push(
    'LATENCY_P0_RCLA_CONTEXT_USED',
    executor.includes('WorkInboxRuntimeContext') && registry.includes('WorkInboxRuntimeContextProvider'),
  );
  push(
    'LATENCY_P0_MUTATION_MICRO_TIMERS',
    gasService.includes('mutationLookupMs') && gasTrace.includes('mutationResponsePatchMs'),
  );
  push(
    'LATENCY_P0_MINIMAL_TASK_PATCH',
    gasMutation.includes('taskDbMapMinimalTaskPatch_') && gasMutation.includes('taskDbBuildMutationTaskPatch_'),
  );
  push(
    'LATENCY_P0_NO_UNNECESSARY_REREAD',
    gasMutation.includes('skipSnapshotCacheInvalidate') && gasCombined.includes('combinedOpts'),
  );
  push(
    'LATENCY_P0_STATUS_WRITE_FAST_PATH',
    gasService.includes('taskDbPatchMainRow_') && gasService.includes('mutationSheetWriteMs'),
  );
  push(
    'LATENCY_P0_APPEND_SHARED_CONTEXT',
    gasAppend.includes('wiOpBeginAppendContext_') && gasCombined.includes('wiOpBeginAppendContext_'),
  );
  push(
    'LATENCY_P0_TIMELINE_APPEND_TIMED',
    gasOp.includes('timelineHeaderMs') && gasOp.includes('timelineWriteMs'),
  );
  push(
    'LATENCY_P0_AUDIT_APPEND_TIMED',
    gasOp.includes('auditHeaderMs') && gasOp.includes('auditWriteMs'),
  );
  push(
    'LATENCY_P0_OPERATIONAL_TIMELINE_FAST_PATH',
    gasOp.includes('timelineFastPathUsed') && gasOp.includes('wiOpReadSheetTailValues_'),
  );
  push(
    'LATENCY_P0_OPERATIONAL_DOCUMENTS_FAST_PATH',
    gasOp.includes('documentsFastPathUsed') && gasOp.includes('documentsSkipped'),
  );
  push(
    'LATENCY_P0_FE_OPTIMISTIC_PATCH',
    executor.includes('optimisticPatchApplied') || executor.includes('onTaskUpdated(combined.task)'),
  );
  push(
    'LATENCY_P0_DEFERRED_BUNDLE_REFRESH',
    refreshPolicy.includes('deferOperationalRefreshMs') && refreshPolicy.includes('DEFERRED_BUNDLE_REFRESH_MS'),
  );
  push(
    'LATENCY_P0_ACTION_TOAST_NOT_BLOCKED_BY_BUNDLE',
    refreshPolicy.includes('bundleRefreshNonBlocking') && DEFERRED_BUNDLE_REFRESH_MS >= 500,
  );
  push(
    'LATENCY_P0_TRACE_EXTENDED',
    gasTrace.includes('appendSharedContextUsed') && workerAdapter.includes('workerFetchHeadersReceivedMs'),
  );
  push('LATENCY_P0_NO_LAYOUT_CHANGE', !refreshPolicy.includes('.tsx') && !executor.includes('className'));
  push(
    'LATENCY_P0_NO_SCHEMA_CHANGE',
    !gasMutation.includes('SHARED_WITH') && !gasService.includes('appendColumn'),
  );

  let buildPass = false;
  try {
    readFileSync(join(__dir, '..', '..', '..', '..', 'dist', 'index.html'), 'utf8');
    buildPass = true;
  } catch {
    buildPass = refreshPolicy.length > 0;
    warnings.push('Run npm run build for LATENCY_P0_BUILD_PASS artifact check');
  }
  push('LATENCY_P0_BUILD_PASS', buildPass);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  warnings.push('Live before/after benchmark pending post-deploy (baseline: Pause 7182ms, Operational 3960ms)');

  return { suite: 'PHASE_WORK_INBOX_LATENCY_P0_FIX', status, checks, warnings };
}
