/**
 * PHASE_OCMS_03C_OPERATOR_EVIDENCE_COLLECTION — evidence readiness checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportOcmsUatMetricsJson } from './ocmsStripUatTelemetry';
import {
  formatOcmsEvidenceMetricsTable,
  meetsMinimumEvidenceThreshold,
  parseOcmsUatExportJson,
} from './ocmsOperatorEvidenceParser';
import { runOcmsRealOperatorUatChecks } from './ocmsRealOperatorUatChecks';

const __dir = dirname(fileURLToPath(import.meta.url));
const brainRoot = join(__dir, '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN');

function readBrain(rel: string): string {
  return readFileSync(join(brainRoot, rel), 'utf8');
}

function readTestEvidence(phase: string): string {
  try {
    return readFileSync(
      join(brainRoot, '005_TEST_EVIDENCE', `PHASE_${phase}_TEST_EVIDENCE.md`),
      'utf8',
    );
  } catch {
    return '';
  }
}

export function runOcmsOperatorEvidenceCollectionChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean; detail?: string }[];
  warnings: string[];
  skipped: string[];
  evidenceCollected: boolean;
} {
  const checks: { id: string; pass: boolean; detail?: string }[] = [];
  const warnings: string[] = [];
  const skipped: string[] = [];
  const push = (id: string, pass: boolean, detail?: string) => checks.push({ id, pass, detail });

  let evidenceLog = '';
  try {
    evidenceLog = readBrain('OCMS/OCMS_CASE_STRIP_OPERATOR_EVIDENCE_LOG.md');
  } catch {
    evidenceLog = '';
  }

  push('EVIDENCE_LOG_EXISTS', evidenceLog.includes('PHASE_OCMS_03C'));
  push('EVIDENCE_LOG_NO_FAKE_METRICS', !evidenceLog.match(/stripUsageRate \| 0\.[0-9]{2,}/));
  push('EVIDENCE_LOG_PENDING_HONEST', evidenceLog.includes('NOT COLLECTED') || evidenceLog.includes('Pending'));

  const sample = exportOcmsUatMetricsJson();
  const parsed = parseOcmsUatExportJson(sample);
  push('EVIDENCE_PARSER_VALID', parsed.ok);
  if (parsed.ok) {
    push('EVIDENCE_TABLE_FORMAT', formatOcmsEvidenceMetricsTable(parsed.payload).includes('stripUsageRate'));
    const threshold = meetsMinimumEvidenceThreshold(parsed.payload);
    push('EVIDENCE_THRESHOLD_BASELINE', !threshold.pass, 'zero baseline correctly below minimum');
  } else {
    push('EVIDENCE_TABLE_FORMAT', false);
    push('EVIDENCE_THRESHOLD_BASELINE', false);
  }

  const prior03c = readTestEvidence('OCMS_03C_OPERATOR_EVIDENCE_COLLECTION');
  const evidenceCollected =
    prior03c.includes('COLLECTED') &&
    !prior03c.includes('NOT COLLECTED') &&
    !prior03c.includes('Pending');

  push('EVIDENCE_REAL_OPERATORS', evidenceCollected, evidenceCollected ? 'collected' : 'not yet');

  const uat = runOcmsRealOperatorUatChecks();
  push('EVIDENCE_03B_REGRESSION', uat.status !== 'FAIL');

  skipped.push('3–5 operators — no sessions in agent environment');
  skipped.push('20–50 observed cases — requires staging Focus workflow');
  warnings.push('RUNTIME_STATE: NOT_WIRED — real operator evidence still missing');
  warnings.push('OCMS_04 blocked until evidence log rollup completed by operator lead');

  const failed = checks.filter((c) => !c.pass && c.id !== 'EVIDENCE_REAL_OPERATORS');
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  return {
    suite: 'PHASE_OCMS_03C_OPERATOR_EVIDENCE_COLLECTION',
    status,
    checks,
    warnings,
    skipped,
    evidenceCollected,
  };
}
