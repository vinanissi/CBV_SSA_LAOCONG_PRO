/**
 * PHASE_CHECKLIST_03_FOCUS_STEP_MODE — static checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistFocusStepModeChecks(): {
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
  const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_FOCUS_STEP_MODE_CONTRACT.md');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_FOCUS_STEP_MODE_AUTHORITY.md');

  push('FOCUS_STATE_ATTR', row.includes('data-checklist-focus-state={focusState}'));
  push('FOCUS_STEP_ATTR', row.includes('data-checklist-focused-step-id={focusState === \'focused\' ? item.id : undefined}'));
  push('CLICK_SETS_FOCUS', section.includes('setFocusedChecklistItemId(item.id)'));
  push('DEEPLINK_SETS_FOCUS', section.includes('setFocusedChecklistItemId(highlightedItemId)'));
  push('CLEAR_FOCUS', section.includes('Bỏ focus') && section.includes('setFocusedChecklistItemId(null)'));
  push('ONE_FOCUS_ONLY', section.includes('focusedChecklistItemId === item.id'));
  push('FOCUS_CSS', css.includes('work-inbox-smart-checklist__row--focused') && css.includes('work-inbox-smart-checklist__row--dimmed'));
  push('DIMMED_USABLE', css.includes('opacity: 0.72'));
  push('TOAST_REGRESSION_GUARD', readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts').includes('TOAST_PROVIDER'));
  push('LINK_REGRESSION_GUARD', readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW'));
  push('CONTRACT_DOC', contract.includes('data-checklist-focus-state') && contract.includes('FOCUSED'));
  push('AUTHORITY_DOC', authority.includes('Forbidden Changes') && authority.includes('No persistence change'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' = failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
  warnings.push('Manual browser focus/clear-flow evidence not captured in CI');
  return { suite: 'PHASE_CHECKLIST_03_FOCUS_STEP_MODE', status, checks, warnings };
}

