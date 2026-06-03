/**
 * Case Workspace operator UAT — readiness checks (04 / 04B).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportCaseWorkspaceUatMetricsJson } from './caseWorkspaceUatTelemetry';
import { runCaseWorkspaceChecks } from './caseWorkspaceChecks';
import { runCaseReadModelChecks } from './caseReadModelChecks';

const __dir = dirname(fileURLToPath(import.meta.url));
const brainRoot = join(__dir, '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN');

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readBrainCase(name: string): string {
  return readFileSync(join(brainRoot, 'CASE', name), 'utf8');
}

export function runCaseWorkspaceOperatorUatChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
  metricsSnapshot: string | null;
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = [
    'RUNTIME_STATE: NOT_WIRED',
    'No live operator sessions in agent run — metrics N/A until staging UAT',
  ];
  const skipped: string[] = ['live_operator_sessions', 'operator_feedback_scores'];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const telemetry = readLocal('caseWorkspaceUatTelemetry.ts');
  const feature = readLocal('ocmsFeature.ts');
  let recorder = '';
  try {
    recorder = readLocal('CaseWorkspaceUatRecorder.tsx');
  } catch {
    /* optional */
  }
  let uatScript = '';
  let evidenceLog = '';
  try {
    uatScript = readBrainCase('CASE_WORKSPACE_OPERATOR_UAT_SCRIPT.md');
    evidenceLog = readBrainCase('CASE_WORKSPACE_OPERATOR_EVIDENCE_LOG.md');
  } catch {
    /* brain paths optional in some checkouts */
  }

  push('UAT_TELEMETRY_SESSION_ONLY', telemetry.includes('sessionStorage') && !telemetry.includes('fetch('));
  push('UAT_CONSOLE_EXPORT', telemetry.includes('__CASE_WORKSPACE_UAT_EXPORT__'));
  push('UAT_FLAG', feature.includes('VITE_CASE_WORKSPACE_UAT_TELEMETRY'));
  push('UAT_SCRIPT_EXISTS', uatScript.includes('Case Workspace') && uatScript.includes('O1'));
  push(
    'UAT_EVIDENCE_HONEST',
    evidenceLog.includes('No live operator session') || evidenceLog.includes('not fabricated'),
  );
  push('UAT_NO_CASE_MAIN', !telemetry.includes('CASE_MAIN'));
  push(
    'UAT_IN_APP_RECORDER',
    recorder.includes('CaseWorkspaceUatRecorder') &&
      recorder.includes('understanding_yes') &&
      recorder.includes('isCaseWorkspaceUatTelemetryEnabled'),
  );
  push(
    'UAT_RECORDER_WIRED',
    readLocal('CaseWorkspace.tsx').includes('CaseWorkspaceUatRecorder'),
  );

  const workspaceChecks = runCaseWorkspaceChecks();
  push('REGRESSION_WORKSPACE', workspaceChecks.status !== 'FAIL', workspaceChecks.status);
  const readModelChecks = runCaseReadModelChecks();
  push('REGRESSION_READ_MODEL', readModelChecks.status !== 'FAIL', readModelChecks.status);

  let metricsSnapshot: string | null = null;
  try {
    metricsSnapshot = exportCaseWorkspaceUatMetricsJson();
    push('UAT_EXPORT_SHAPE', metricsSnapshot.includes('workspaceImpressions'));
  } catch (e) {
    push('UAT_EXPORT_SHAPE', false, String(e));
  }

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 1 ? 'GO_WITH_WARNINGS' : 'GO';

  return {
    suite: 'PHASE_CASE_REFACTOR_04_OPERATOR_UAT',
    status,
    checks,
    warnings,
    skipped,
    metricsSnapshot,
  };
}

/** PHASE_CASE_REFACTOR_04B — extends 04 checks with in-app recorder gates. */
export function runCaseWorkspaceOperatorUat04bChecks(): ReturnType<typeof runCaseWorkspaceOperatorUatChecks> {
  const base = runCaseWorkspaceOperatorUatChecks();
  const warnings = [
    ...base.warnings,
    'PHASE_04B: Live operator sessions still required for UAT gates — recorder enables honest self-report only',
  ];
  const recorderOk = base.checks.filter((c) => c.id.startsWith('UAT_IN_APP') || c.id === 'UAT_RECORDER_WIRED').every((c) => c.pass);
  const status =
    base.status === 'FAIL' || !recorderOk
      ? 'FAIL'
      : warnings.length > 2
        ? 'GO_WITH_WARNINGS'
        : base.status;
  return { ...base, suite: 'PHASE_CASE_REFACTOR_04B_OPERATOR_UAT', status, warnings };
}
