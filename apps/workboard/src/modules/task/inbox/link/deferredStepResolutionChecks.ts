/**
 * PHASE_LINK_02 — static deferred-step-resolution checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runDeferredStepResolutionChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const consumer = readRepo(
    'apps/workboard/src/modules/task/inbox/link/useChecklistStepDeepLinkConsumer.ts',
  );
  const section = readRepo(
    'apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx',
  );
  const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
  const contract = readRepo('00_SYSTEM_BRAIN/LINK/LINK_DEFERRED_STEP_RESOLUTION_CONTRACT.md');
  const authority = readRepo('00_SYSTEM_BRAIN/LINK/LINK_DEFERRED_STEP_RESOLUTION_AUTHORITY.md');

  push('PENDING_STATE_MACHINE', consumer.includes('PENDING_TASK') && consumer.includes('PENDING_DOM'));
  push(
    'BOUNDED_RETRY',
    consumer.includes('RESOLVE_ATTEMPT_DELAYS_MS') && consumer.includes('RESOLUTION_TIMEOUT_MS'),
  );
  push('DOM_READINESS_GUARD', consumer.includes('checklistItemDomId') && consumer.includes('hasDomTarget'));
  push('NO_PREMATURE_CLEAR', consumer.includes('clearStepQuery') && consumer.includes('RESOLVED'));
  push('MISSING_STEP_FINAL', consumer.includes('FAILED_MISSING_STEP'));
  push('TARGET_VERIFY_FINAL', consumer.includes('FAILED_TARGET_VERIFY') && consumer.includes('verifyStepAnchorResolved'));
  push('TIMEOUT_FINAL', consumer.includes('FAILED_TIMEOUT'));
  push('RETRY_SAFE_PENDING', consumer.includes('PENDING_CHECKLIST_DATA'));
  push('STABLE_STEP_ANCHOR', row.includes('data-checklist-step-id={item.id}') && row.includes('data-step-anchor="true"'));
  push('HIGHLIGHT_EXACT_ROW', row.includes('data-deep-link-target={crossFocusHighlighted ? \'true\' : undefined}'));
  push('NO_EARLY_CLEAR_ON_VERIFY_FAIL', consumer.includes('FAILED_TARGET_VERIFY') && consumer.includes('Đang kiểm tra vị trí bước deep link...'));
  push(
    'TRACE_GATED',
    consumer.includes('VITE_LINK_DEEP_LINK_TRACE_ENABLED') &&
      consumer.includes('__CBV_LINK_TRACE_ENABLED__') &&
      consumer.includes('emitLinkTrace('),
  );
  push('NON_BLOCKING_HINT', section.includes('deepLinkHint') && section.includes('onResolutionMessage'));
  push('CONTRACT_DOC', contract.includes('PENDING_CHECKLIST_DATA') && contract.includes('timeout'));
  push('AUTHORITY_DOC', authority.includes('Forbidden Changes') && authority.includes('No persistence change'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
  warnings.push('Live browser slow/aborted simulation not executed in CI');
  return { suite: 'PHASE_LINK_02_DEFERRED_STEP_RESOLUTION', status, checks, warnings };
}

