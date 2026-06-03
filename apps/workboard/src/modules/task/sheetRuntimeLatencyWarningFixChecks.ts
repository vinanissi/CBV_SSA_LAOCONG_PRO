/**
 * PHASE_SHEET_RUNTIME_LATENCY_WARNING_FIX — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runSheetRuntimeLatencyWarningFixChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const tasksPage = readRepo('apps/workboard/src/modules/task/TasksPage.tsx');
  const contract = readRepo('00_SYSTEM_BRAIN/SHEET_RUNTIME/SHEET_RUNTIME_LATENCY_WARNING_CONTRACT.md');
  const authority = readRepo('00_SYSTEM_BRAIN/SHEET_RUNTIME/SHEET_RUNTIME_LATENCY_WARNING_AUTHORITY.md');

  push('TRANSIENT_CLASSIFIER', tasksPage.includes('isSheetRuntimeTransientWarning'));
  push('NON_BLOCKING_SOFT_WARNING', tasksPage.includes('SHEET_RUNTIME_SOFT_WARNING'));
  push('RECOVERY_NORMALIZE', tasksPage.includes('normalizeWorkspaceWarnings'));
  push('REQUEST_SEQ_GUARD', tasksPage.includes('workspaceRequestSeqRef') && tasksPage.includes('requestSeq !== workspaceRequestSeqRef.current'));
  push('NO_STALE_OVERRIDE', tasksPage.includes('if (requestSeq !== workspaceRequestSeqRef.current) return;'));
  push('SLOW_SIGNAL_SOFT', tasksPage.includes('SHEET_RUNTIME_SLOW_SIGNAL'));
  push('NO_BLOCKING_ABORT_WITH_DATA', tasksPage.includes('softMessage = isSheetRuntimeTransientWarning(msg)'));
  push('CONTRACT_DOC', contract.includes('CANCELLED_STALE_REQUEST') && contract.includes('RECOVERED'));
  push('AUTHORITY_DOC', authority.includes('Forbidden Changes') && authority.includes('No persistence change'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
  warnings.push('Manual browser latency/retry evidence not captured in CI');
  return { suite: 'PHASE_SHEET_RUNTIME_LATENCY_WARNING_FIX', status, checks, warnings };
}

