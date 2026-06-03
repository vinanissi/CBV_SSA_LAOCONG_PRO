/**
 * PHASE_OCMS_03B_REAL_OPERATOR_UAT — readiness + governance checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOcmsOperatorValidationChecks } from './ocmsOperatorValidationChecks';
import { exportOcmsUatMetricsJson } from './ocmsStripUatTelemetry';

const __dir = dirname(fileURLToPath(import.meta.url));
const brainRoot = join(__dir, '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN');

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readFocus(name: string): string {
  return readFileSync(join(__dir, '..', 'task', 'inbox', 'focusRuntime', name), 'utf8');
}

function readBrain(rel: string): string {
  return readFileSync(join(brainRoot, rel.replace(/^00_SYSTEM_BRAIN[\\/]/, '')), 'utf8');
}

export function runOcmsRealOperatorUatChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
  metricsSnapshot: string | null;
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = [];
  const skipped: string[] = [];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  const telemetry = readLocal('ocmsStripUatTelemetry.ts');
  const strip = readLocal('WorkInboxCaseContextStrip.tsx');
  const workspace = readFocus('FocusTaskWorkspace.tsx');
  const feature = readLocal('ocmsFeature.ts');
  let operatorScript = '';
  try {
    operatorScript = readBrain('OCMS/OCMS_CASE_STRIP_UAT_OPERATOR_SCRIPT.md');
  } catch {
    operatorScript = '';
  }

  push('UAT_TELEMETRY_SESSION_ONLY', telemetry.includes('sessionStorage') && !telemetry.includes('fetch('));
  push('UAT_TELEMETRY_FLAG', feature.includes('VITE_OCMS_UAT_TELEMETRY'));
  push('UAT_CONSOLE_EXPORT', telemetry.includes('__OCMS_UAT_EXPORT__'));
  push('UAT_STRIP_WIRES_TELEMETRY', strip.includes('recordStripImpression') && strip.includes('recordRelationLinkClick'));
  push('UAT_DISCOVERY_OUTCOME_PROP', workspace.includes('discoveryOutcome'));
  push('UAT_OPERATOR_SCRIPT', operatorScript.includes('O1') && operatorScript.includes('__OCMS_UAT_EXPORT__'));

  push('UAT_NO_CASE_MAIN', !telemetry.includes('CASE_MAIN'));
  push('UAT_NO_API', !telemetry.includes('/api/'));

  const exported = exportOcmsUatMetricsJson();
  push('UAT_EXPORT_JSON', exported.includes('stripUsageRate') && exported.includes('discoverySuccessRate'));
  push('UAT_EXPORT_ZERO_BASELINE', exported.includes('"stripImpressions": 0'));

  const base = runOcmsOperatorValidationChecks();
  push('UAT_03A_REGRESSION', base.status !== 'FAIL', `03A: ${base.status}`);

  skipped.push('Real operator browser sessions — not executed in agent environment');
  skipped.push('Operator feedback scores (1–5) — pending staff trial');
  warnings.push('RUNTIME_STATE: NOT_WIRED — live staging UAT required to populate metrics');
  warnings.push('Metrics snapshot from fixture bump only — not representative of operators');

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  return {
    suite: 'PHASE_OCMS_03B_REAL_OPERATOR_UAT',
    status,
    checks,
    warnings,
    skipped,
    metricsSnapshot: exported,
  };
}
