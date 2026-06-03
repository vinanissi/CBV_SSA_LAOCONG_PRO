/**
 * PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT — deliverable + live evidence gates.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportCaseWorkspaceUatMetricsJson } from './caseWorkspaceUatTelemetry';
import { runCaseWorkspaceOperatorUat04bChecks } from './caseWorkspaceOperatorUatChecks';

const __dir = dirname(fileURLToPath(import.meta.url));
const brainRoot = join(__dir, '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN');

function readBrainCase(name: string): string {
  return readFileSync(join(brainRoot, 'CASE', name), 'utf8');
}

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

/** True when evidence log documents at least one real operator session row. */
export function evidenceLogHasLiveOperatorSessions(evidenceLog: string): boolean {
  if (/Operator count:\s*0/i.test(evidenceLog) && !/\| UAT-\d{4}/.test(evidenceLog)) {
    return false;
  }
  if (evidenceLog.includes('*(none yet)*')) return false;
  if (/\| UAT-\d{4}-\d{2}-\d{2}/.test(evidenceLog)) return true;
  if (/\| OP-\d+ \|/.test(evidenceLog)) return true;
  return false;
}

export function runCaseWorkspaceLiveOperatorUat04cChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
  liveEvidencePresent: boolean;
  metricsSnapshot: string | null;
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = ['RUNTIME_STATE: NOT_WIRED'];
  const skipped: string[] = [];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  let script = '';
  let evidence = '';
  let metrics = '';
  let feedback = '';
  try {
    script = readBrainCase('CASE_WORKSPACE_LIVE_OPERATOR_UAT_SCRIPT.md');
    evidence = readBrainCase('CASE_WORKSPACE_LIVE_OPERATOR_EVIDENCE_LOG.md');
    metrics = readBrainCase('CASE_WORKSPACE_LIVE_OPERATOR_METRICS.md');
    feedback = readBrainCase('CASE_WORKSPACE_LIVE_OPERATOR_FEEDBACK_SUMMARY.md');
  } catch (e) {
    push('LIVE_DELIVERABLES_READ', false, String(e));
  }

  push('LIVE_SCRIPT', script.includes('04C') && /Minimum UAT target/i.test(script));
  push('LIVE_EVIDENCE_LOG', evidence.includes('PHASE_CASE_REFACTOR_04C'));
  push('LIVE_METRICS', metrics.includes('NOT_MEASURED') || metrics.includes('Actual'));
  push('LIVE_FEEDBACK', feedback.includes('not fabricated') || feedback.includes('Not collected'));
  push('LIVE_NO_FABRICATION', /not fabricat/i.test(evidence));

  const liveEvidencePresent = evidenceLogHasLiveOperatorSessions(evidence);
  push('LIVE_OPERATOR_SESSIONS', liveEvidencePresent, liveEvidencePresent ? 'sessions found' : '0 live sessions');

  const telemetry = readLocal('caseWorkspaceUatTelemetry.ts');
  push('LIVE_TELEMETRY_ACTION_BAR', telemetry.includes('actionBarSuccess'));
  push('LIVE_TELEMETRY_CONFUSION', telemetry.includes('operatorConfusionCount'));

  const regression = runCaseWorkspaceOperatorUat04bChecks();
  push('REGRESSION_04B', regression.status !== 'FAIL', regression.status);

  let metricsSnapshot: string | null = null;
  try {
    metricsSnapshot = exportCaseWorkspaceUatMetricsJson();
    push('LIVE_EXPORT_RATES', metricsSnapshot.includes('actionBarSuccessRate'));
  } catch (e) {
    push('LIVE_EXPORT_RATES', false, String(e));
  }

  if (!liveEvidencePresent) {
    warnings.push('FAIL gate: live operator evidence absent — schedule staging UAT');
  }

  const failed = checks.filter((c) => !c.pass);
  let status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = 'FAIL';
  if (failed.length === 0 && liveEvidencePresent) {
    status = warnings.length > 1 ? 'GO_WITH_WARNINGS' : 'GO';
  } else if (failed.filter((c) => c.id !== 'LIVE_OPERATOR_SESSIONS').length === 0 && liveEvidencePresent) {
    status = 'GO_WITH_WARNINGS';
  } else if (!liveEvidencePresent) {
    status = 'FAIL';
  } else if (failed.length > 0) {
    status = 'FAIL';
  }

  return {
    suite: 'PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT',
    status,
    checks,
    warnings,
    skipped,
    liveEvidencePresent,
    metricsSnapshot,
  };
}
