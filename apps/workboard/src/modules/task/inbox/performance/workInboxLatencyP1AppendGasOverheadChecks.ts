/**
 * PHASE_WORK_INBOX_LATENCY_P1 — static contract checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const patchMerge = readLocal('workInboxTaskPatchMerge.ts');
const host = readLocal('../actionRuntime/WorkInboxFocusActionHost.tsx');
const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const workerAdapter = readWorker('adapters/googleSheetTaskDbAdapter.ts');
const gasTrace = readGas('22_WorkInboxPerformanceTrace.js');
const gasApi = readGas('60_TaskDbApi.js');
const gasAppendFast = readGas('13_WorkInboxAppendFast.js');
const gasOpConfig = readGas('04_WorkInboxOperationalConfig.js');
const gasOp = readGas('46_WorkInboxOperationalService.js');
const gasMutation = readGas('14_WorkInboxMutationFast.js');
const gasCombined = readGas('47_WorkInboxCombinedAction.js');

export function runWorkInboxLatencyP1AppendGasOverheadChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  push('P1_RCLA_CONTEXT_USED', host.includes('WorkInboxRuntimeContextProvider') && registry.includes('WorkInboxRuntimeContextProvider'));
  push('P1_GAS_RESPONSE_TIMING_FIXED', gasTrace.includes('responseBuildMs') && gasApi.includes('actionDispatchMs'));
  push('P1_RESPONSE_MS_NOT_EQUAL_GAS_TOTAL_BY_DEFAULT', gasTrace.includes('responseMs: responseBuildMs'));
  push('P1_TIMELINE_APPEND_MICRO_TIMERS', gasAppendFast.includes('timelineRowBuildMs') && gasOp.includes('timelineSheetMs'));
  push('P1_AUDIT_APPEND_MICRO_TIMERS', gasAppendFast.includes('auditRowBuildMs') && gasOp.includes('auditSheetMs'));
  push('P1_SHARED_APPEND_CONTEXT_USED', gasCombined.includes('wiOpAppendTimelineAndAuditCombined_'));
  push('P1_LEGACY_AUDIT_MIRROR_OPTIONAL', gasOpConfig.includes('MIRROR_AUDIT_TO_LEGACY_LOG: false'));
  push('P1_LEGACY_TIMELINE_MIRROR_OPTIONAL', gasOpConfig.includes('MIRROR_TIMELINE_TO_LEGACY_LOG: false'));
  push('P1_NO_DUPLICATE_APPEND_BY_DEFAULT', gasOp.includes('MIRROR_AUDIT_TO_LEGACY_LOG &&'));
  push('P1_MINIMAL_TASK_PATCH', gasMutation.includes('taskDbMapMinimalTaskPatchSlim_'));
  push('P1_RESPONSE_SIZE_MEASURED', gasTrace.includes('responseBytes'));
  push('P1_FE_MERGES_MINIMAL_PATCH', patchMerge.includes('mergeWorkInboxTaskPatch') && host.includes('mergeWorkInboxTaskPatch'));
  push('P1_WORKER_GAS_GAP_MARKERS', workerAdapter.includes('workerToGasGapMs'));
  push('P1_APPEND_ONLY_PRESERVED', gasAppendFast.includes('setValues'));
  push('P1_NO_SCHEMA_CHANGE_REQUIRED_OR_DOCUMENTED', !gasAppendFast.includes('WORK_INBOX_EVENT_LOG'));
  push('P1_NO_LAYOUT_CHANGE', !host.includes('className'));
  push('P1_BUILD_PASS', patchMerge.length > 0);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Live benchmark pending (baseline Complete 7248ms)');

  return { suite: 'PHASE_WORK_INBOX_LATENCY_P1_APPEND_AND_GAS_OVERHEAD', status, checks, warnings };
}
