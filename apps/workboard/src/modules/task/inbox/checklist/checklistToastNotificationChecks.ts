/**
 * PHASE_CHECKLIST_02_TOAST_NOTIFICATION — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistToastNotificationChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
  const toast = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastFeedback.ts');
  const css = readRepo('apps/workboard/src/styles/index.css');
  const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_TOAST_NOTIFICATION_CONTRACT.md');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_TOAST_NOTIFICATION_AUTHORITY.md');

  push('TOAST_PROVIDER', toast.includes('showChecklistToast') && toast.includes('cbv-checklist-toast'));
  push('TOAST_DEDUPE', toast.includes('TOAST_THROTTLE_MS') && toast.includes('lastToastKey'));
  push(
    'COPY_LINK_SUCCESS_TOAST',
    section.includes('showChecklistToast(') &&
      section.includes('Đã sao chép link') &&
      section.includes("'success'"),
  );
  push(
    'COPY_LINK_ERROR_TOAST',
    section.includes('showChecklistToast(') &&
      section.includes('Không thể sao chép link') &&
      section.includes("'error'"),
  );
  push('FAILED_SAVE_TOAST', section.includes("showChecklistToast('Lưu thất bại', 'error')"));
  push('TOAST_NON_BLOCKING_STYLE', css.includes('.cbv-checklist-toast') && css.includes('pointer-events-none'));
  push('ROW_FEEDBACK_STILL_PRESENT', section.includes('setInteractionFeedback('));
  push('LINK_REGRESSION_GUARD', readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW'));
  push('SHEET_WARNING_REGRESSION_GUARD', readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('TRANSIENT_CLASSIFIER'));
  push('CONTRACT_DOC', contract.includes('success') && (contract.includes('Auto-dismiss') || contract.includes('auto-dismiss')));
  push('AUTHORITY_DOC', authority.includes('Forbidden Changes') && authority.includes('No persistence change'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
  warnings.push('Manual browser toast timing/placement evidence not captured in CI');
  return { suite: 'PHASE_CHECKLIST_02_TOAST_NOTIFICATION', status, checks, warnings };
}

