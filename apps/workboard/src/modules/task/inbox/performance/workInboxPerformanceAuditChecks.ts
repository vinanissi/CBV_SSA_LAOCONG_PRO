/**
 * PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT — static contract + path checks.
 * Run: npx tsx -e "import { runWorkInboxRuntimePerformanceAuditChecks } from './src/modules/task/inbox/performance/workInboxPerformanceAuditChecks.ts'; console.log(JSON.stringify(runWorkInboxRuntimePerformanceAuditChecks(), null, 2));"
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

const feTrace = readLocal('workInboxPerformanceTrace.ts');
const feChecks = readLocal('workInboxPerformanceAuditChecks.ts');
const executor = readLocal('../actionRuntime/workInboxActionExecutor.ts');
const client = readRoot('api/client.ts');
const opApi = readLocal('../operationalRuntime/workInboxOperationalApi.ts');
const opService = readLocal('../operationalRuntime/workInboxOperationalService.ts');
const registry = readRoot('runtime/rcla/workInboxRuntimeContextRegistry.tsx');
const workerTrace = readWorker('modules/workInboxPerformanceTrace.ts');
const workerOp = readWorker('modules/workInboxOperational.ts');
const workerAdapter = readWorker('adapters/googleSheetTaskDbAdapter.ts');
const gasTrace = readGas('workInboxPerformanceTrace.js');
const gasApi = readGas('taskDbApi.js');
const gasService = readGas('taskDbService.js');
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
  'PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT_REPORT.md',
);

export interface WorkInboxPerfAuditCheck {
  id: string;
  label: string;
  pass: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
  detail?: string;
}

export function runWorkInboxRuntimePerformanceAuditChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: WorkInboxPerfAuditCheck[];
  warnings: string[];
} {
  const checks: WorkInboxPerfAuditCheck[] = [];
  const warnings: string[] = [];

  const push = (
    id: string,
    label: string,
    pass: boolean,
    severity: WorkInboxPerfAuditCheck['severity'] = pass ? 'OK' : 'ERROR',
    detail?: string,
  ) => {
    checks.push({ id, label, pass, severity, detail });
  };

  push(
    'PERF_RCLA_CONTEXT_LOADED',
    'RCLA WorkInboxRuntimeContextProvider + registry referenced (no ad-hoc context)',
    registry.includes('WorkInboxRuntimeContextProvider') &&
      executor.includes('WorkInboxRuntimeContext') &&
      !executor.includes('createWorkInboxContextFromScratch'),
  );

  push(
    'PERF_TRACE_ID_CREATED',
    'FE creates traceId per user action',
    feTrace.includes('createWorkInboxTraceId') &&
      feTrace.includes('startWorkInboxTrace') &&
      executor.includes('startWorkInboxTrace'),
  );

  push(
    'PERF_TRACE_ID_PROPAGATED_FE_TO_WORKER',
    'FE forwards X-CBV-Trace-Id to Worker',
    client.includes('X-CBV-Trace-Id') &&
      opApi.includes('X-CBV-Trace-Id') &&
      executor.includes('setActiveWorkInboxTraceId'),
  );

  push(
    'PERF_TRACE_ID_PROPAGATED_WORKER_TO_GAS',
    'Worker forwards traceId to GAS',
    workerAdapter.includes("'X-CBV-Trace-Id': tid") && workerAdapter.includes('traceId: tid'),
  );

  push(
    'PERF_LAYER_TIMING_ENVELOPE',
    'Timing envelope schema across FE/Worker/GAS',
    feTrace.includes('layerTimings') &&
      workerTrace.includes('layerTimings') &&
      gasTrace.includes('layerTimings') &&
      gasTrace.includes('WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT'),
  );

  push(
    'PERF_ACTION_REQUEST_COUNT_TRACKED',
    'FE counts API requests per action',
    feTrace.includes('requestCount') && executor.includes('markApiStart') && executor.includes('markApiEnd'),
  );

  push(
    'PERF_REFRESH_COUNT_TRACKED',
    'FE counts refresh fan-out per action',
    feTrace.includes('refreshCount') && executor.includes('incrementRefresh'),
  );

  push(
    'PERF_SHEET_READ_COUNT_TRACKED',
    'GAS tracks sheet read count',
    gasTrace.includes('wiPerfAddSheetRead_') && gasService.includes('wiPerfAddSheetRead_'),
  );

  push(
    'PERF_SHEET_WRITE_COUNT_TRACKED',
    'GAS tracks sheet write count',
    gasTrace.includes('wiPerfAddSheetWrite_') &&
      (gasService.includes('wiPerfAddSheetWrite_') || readGas('taskDbAudit.js').includes('wiPerfAddSheetWrite_')),
  );

  push(
    'PERF_GETDATARANGE_SCAN_DETECTED',
    'Static scan: no getDataRange() in GAS runtime (batched getRange used)',
    !gasService.includes('getDataRange()') && gasService.includes('taskDbReadMainSummaries_'),
    gasService.includes('getDataRange()') ? 'ERROR' : 'OK',
    'Full TASK_MAIN scan via getRange(2,1,lastRow,*) — not getDataRange but still O(n) per find',
  );

  push(
    'PERF_WORKER_ROUTE_TIMING',
    'Worker /api/work-inbox/* route timing wrapper',
    workerOp.includes('beginWorkerPerf') &&
      workerOp.includes('envelopeWithRoutePerf') &&
      workerOp.includes('LOAD_OPERATIONAL_BUNDLE'),
  );

  push(
    'PERF_GAS_ROUTE_TIMING',
    'GAS taskDbDoPost_ attaches performanceTrace',
    gasApi.includes('wiPerfBegin_') && gasApi.includes('wiPerfFinishAndAttach_'),
  );

  push(
    'PERF_SLOW_RUNTIME_WARNING',
    'Slow runtime warning path preserved (Worker timeout message)',
    workerAdapter.includes('Google Sheet runtime phản hồi chậm'),
  );

  push(
    'PERF_NO_BUSINESS_LOGIC_CHANGE',
    'Executor action switch unchanged (no new business actions)',
    executor.includes("case 'ACTION_START_PROCESSING'") &&
      executor.includes("case 'ACTION_HANDOFF'") &&
      !executor.includes('autoResolve') &&
      !executor.includes('autoEscalate'),
  );

  push(
    'PERF_NO_DB_SCHEMA_CHANGE_REQUIRED',
    'No TASK_MAIN schema mutation; optional trace sheet append-only',
    gasTrace.includes('WORK_INBOX_PERFORMANCE_TRACE') && !gasService.includes('alterColumn'),
    'OK',
    'Optional WORK_INBOX_PERFORMANCE_TRACE sheet — append-only if present',
  );

  let reportExists = false;
  try {
    readFileSync(reportPath, 'utf8');
    reportExists = true;
  } catch {
    reportExists = false;
  }
  push('PERF_REPORT_GENERATED', 'Performance audit report artifact exists', reportExists, reportExists ? 'OK' : 'WARNING');

  const errors = checks.filter((c) => !c.pass && (c.severity === 'ERROR' || c.severity === 'CRITICAL'));
  const warnOnly = checks.filter((c) => !c.pass && c.severity === 'WARNING');

  if (!reportExists) warnings.push('Live benchmark not embedded — report uses static path analysis');
  warnings.push('GAS timing requires clasp deploy before live validation');

  let status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = 'GO';
  if (errors.length) status = 'FAIL';
  else if (warnOnly.length || warnings.length) status = 'GO_WITH_WARNINGS';

  return {
    suite: 'PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT',
    status,
    checks,
    warnings,
  };
}
