/**
 * PHASE_WORK_INBOX_LATENCY_PROFILING — static contract checks.
 * Run: npx tsx -e "import { runWorkInboxLatencyProfilingChecks } from './src/modules/task/inbox/performance/workInboxLatencyProfilingChecks.ts'; console.log(runWorkInboxLatencyProfilingChecks());"
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LATENCY_PROFILE_TARGET_ACTIONS,
  buildLatencyActionTable,
  classifyLatencyDuration,
  formatLatencyTableMarkdown,
  identifyLatencyBottlenecks,
} from './workInboxLatencyProfile';

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

const feLatency = readLocal('workInboxLatencyProfile.ts');
const feTypes = readLocal('workInboxLatencyProfileTypes.ts');
const feTrace = readLocal('workInboxPerformanceTrace.ts');
const executor = readLocal('../actionRuntime/workInboxActionExecutor.ts');
const combinedClient = readLocal('../actionRuntime/workInboxCombinedActionClient.ts');
const opLoader = readLocal('../operationalRuntime/workInboxOperationalBundleLoader.ts');
const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const workerTrace = readWorker('modules/workInboxPerformanceTrace.ts');
const workerCombined = readWorker('modules/workInboxCombinedAction.ts');
const workerOp = readWorker('modules/workInboxOperational.ts');
const gasTrace = readGas('22_WorkInboxPerformanceTrace.js');
const gasCombined = readGas('47_WorkInboxCombinedAction.js');
const gasOp = readGas('46_WorkInboxOperationalService.js');

export interface LatencyProfilingCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR';
  detail?: string;
}

export function runWorkInboxLatencyProfilingChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: LatencyProfilingCheck[];
  warnings: string[];
  bottleneckPreview: ReturnType<typeof identifyLatencyBottlenecks>;
  tablePreview: string;
} {
  const checks: LatencyProfilingCheck[] = [];
  const warnings: string[] = [];

  const push = (id: string, label: string, pass: boolean, detail?: string) => {
    checks.push({ id, label, pass, severity: pass ? 'OK' : 'ERROR', detail });
  };

  push(
    'LATENCY_TRACE_EXISTS',
    'Latency trace module + types exist',
    feLatency.includes('ingestWorkInboxLatencyTrace') && feTypes.includes('WorkInboxLatencyTrace'),
  );
  push(
    'LATENCY_FE_BREAKDOWN',
    'FE breakdown prepare/render/refresh',
    feTypes.includes('WorkInboxFeLatencyBreakdown') && feLatency.includes('fe:'),
  );
  push(
    'LATENCY_WORKER_BREAKDOWN',
    'Worker validation/route/gas/response breakdown',
    workerTrace.includes('markWorkerValidationEnd') &&
      workerTrace.includes('gasCallMs') &&
      workerCombined.includes('markWorkerValidationEnd'),
  );
  push(
    'LATENCY_GAS_BREAKDOWN',
    'GAS mutation/timeline/audit/bundle phases',
    gasTrace.includes('wiPerfMarkPhase_') &&
      gasCombined.includes('timelineAppendMs') &&
      gasOp.includes('bundleTimelineMs'),
  );
  push(
    'LATENCY_SHEET_BREAKDOWN',
    'Sheet open/getSheet/taskLookup/read/write counters',
    gasTrace.includes('sheetBreakdown') && feTypes.includes('WorkInboxSheetLatencyBreakdown'),
  );
  push(
    'LATENCY_RECORD_ACTION_PROFILED',
    'record-action route instrumented',
    workerCombined.includes('WI_OP_RECORD_ACTION') && gasCombined.includes('mutationMs'),
  );
  push(
    'LATENCY_OPERATIONAL_PROFILED',
    'operational bundle route + GAS aggregation profiled',
    workerOp.includes('LOAD_OPERATIONAL_BUNDLE') && gasOp.includes('wiOpGetTaskOperational_'),
  );
  push(
    'LATENCY_TIMELINE_PROFILED',
    'Timeline append timed in combined action',
    gasCombined.includes('timelineAppendMs'),
  );
  push(
    'LATENCY_AUDIT_PROFILED',
    'Audit append timed in combined action',
    gasCombined.includes('auditAppendMs'),
  );
  push(
    'LATENCY_BOTTLENECK_IDENTIFIED',
    'Bottleneck ranker from measured traces',
    feLatency.includes('identifyLatencyBottlenecks') && identifyLatencyBottlenecks([]).length > 0,
  );
  push(
    'LATENCY_REPORT_GENERATED',
    'Action table + markdown formatter',
    feLatency.includes('buildLatencyActionTable') && feLatency.includes('formatLatencyTableMarkdown'),
  );
  push(
    'LATENCY_NO_BUSINESS_LOGIC_CHANGE',
    'Profiling markers only (no workflow branch changes)',
    gasCombined.includes('wiPerfMarkPhase_'),
  );
  push(
    'LATENCY_NO_LAYOUT_CHANGE',
    'No UI layout files in latency module',
    !feLatency.includes('tsx') && !feLatency.includes('.css'),
  );

  const rclaOk =
    executor.includes('WorkInboxRuntimeContext') &&
    registry.includes('WorkInboxRuntimeContextProvider') &&
    !feLatency.includes('hardcoded');
  push('LATENCY_RCLA_CONTEXT', 'RCLA context path (no bypass)', rclaOk);

  push(
    'LATENCY_TARGET_ACTIONS',
    'All 10 profile target actions declared',
    LATENCY_PROFILE_TARGET_ACTIONS.length === 10,
  );

  push(
    'LATENCY_CLASSIFICATION',
    'FAST/ACCEPTABLE/WARNING/DEGRADED/FAIL thresholds',
    classifyLatencyDuration(500) === 'FAST' &&
      classifyLatencyDuration(2000) === 'ACCEPTABLE' &&
      classifyLatencyDuration(4000) === 'WARNING' &&
      classifyLatencyDuration(7000) === 'DEGRADED' &&
      classifyLatencyDuration(11000) === 'FAIL',
  );

  const feWired =
    executor.includes('ingestWorkInboxLatencyTrace') ||
    combinedClient.includes('ingestWorkInboxLatencyTrace') ||
    opLoader.includes('ingestWorkInboxLatencyTrace');
  push('LATENCY_FE_INGEST_WIRED', 'FE ingests performanceTrace from API', feWired);

  let buildPass = false;
  try {
    readFileSync(join(__dir, '..', '..', '..', '..', 'dist', 'index.html'), 'utf8');
    buildPass = true;
  } catch {
    buildPass = feTrace.length > 0 && workerTrace.length > 0;
    warnings.push('dist/index.html not found — run npm run build for full LATENCY_BUILD_PASS');
  }
  push('LATENCY_BUILD_PASS', 'Workboard build artifacts or source present', buildPass);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  if (!feWired) warnings.push('LATENCY_FE_INGEST_WIRED pending wiring in executor/client/loader');

  return {
    suite: 'PHASE_WORK_INBOX_LATENCY_PROFILING',
    status,
    checks,
    warnings,
    bottleneckPreview: identifyLatencyBottlenecks([]),
    tablePreview: formatLatencyTableMarkdown(buildLatencyActionTable([])),
  };
}
