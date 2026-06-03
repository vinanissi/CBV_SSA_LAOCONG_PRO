/**
 * PHASE_CHECKLIST_01_INTERACTION_FEEDBACK — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistInteractionFeedbackChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
  const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
  const css = readRepo('apps/workboard/src/styles/index.css');
  const toast = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastFeedback.ts');
  const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_INTERACTION_FEEDBACK_CONTRACT.md');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_INTERACTION_FEEDBACK_AUTHORITY.md');

  push('ROW_STATE_ATTR', row.includes('data-checklist-interaction-state={interactionState}'));
  push('PENDING_ON_CLICK', section.includes("setInteractionFeedback(item.id, 'pending', 'Đang lưu...')"));
  push('SUCCESS_FEEDBACK', section.includes("setInteractionFeedback(item.id, 'saved', 'Đã lưu', 1400)"));
  push('FAILED_FEEDBACK', section.includes("setInteractionFeedback(item.id, 'failed', 'Lưu thất bại', 2600)"));
  push('DUPLICATE_GUARD', row.includes('disabled={!allowMutate || busy || isArchived}'));
  push('ROW_CLASSES', css.includes('work-inbox-smart-checklist__row--pending') && css.includes('work-inbox-smart-checklist__row--failed'));
  push('UNRELATED_ROWS_USABLE', section.includes('busy={busy}') && !section.includes('busy={true}'));
  push('LINK_REGRESSION_GUARD', readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW'));
  push('TOAST_LAYER', section.includes('showChecklistToast(') && toast.includes('TOAST_THROTTLE_MS'));
  push('TOAST_STYLE', css.includes('.cbv-checklist-toast') && css.includes("data-kind='error'"));
  push('CONTRACT_DOC', contract.includes('data-checklist-interaction-state') && contract.includes('PENDING'));
  push('AUTHORITY_DOC', authority.includes('Forbidden Changes') && authority.includes('No persistence change'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
  warnings.push('Browser UAT timing/animation confirmation not captured in CI');
  return { suite: 'PHASE_CHECKLIST_01_INTERACTION_FEEDBACK', status, checks, warnings };
}

