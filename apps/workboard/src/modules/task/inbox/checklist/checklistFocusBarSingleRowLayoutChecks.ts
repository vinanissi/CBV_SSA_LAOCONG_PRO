/**
 * PHASE_CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT — static layout checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

export function runChecklistFocusBarSingleRowLayoutChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readLocal('WorkInboxChecklistSection.tsx');
  const css = readRepo('apps/workboard/src/styles/index.css');
  const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md');

  push('FOCUS_BAR_ROW', section.includes('work-inbox-checklist-focus-bar__row'));
  push('ACTION_IN_ROW', section.includes('Tập trung bước') && section.includes('work-inbox-checklist-focus-bar__row'));
  push('STATUS_IN_ROW', section.includes('work-inbox-checklist-focus-status') && section.includes('work-inbox-checklist-focus-bar__row'));
  push('NO_SEPARATE_STATUS_BLOCK', !section.match(/focus-bar__row[\s\S]*?<\/div>\s*\{focusedChecklistItemId/s) || section.indexOf('work-inbox-checklist-focus-bar__row') < section.lastIndexOf('work-inbox-checklist-focus-status'));
  push('DISPLAY_TITLE', section.includes('focusedStepDisplayTitle'));
  push('NO_ID_IN_UI', !section.includes('Đang focus: {focusedChecklistItemId}'));
  push('FALLBACK', section.includes("'bước đang chọn'"));
  push('CLEAR_FOCUS', section.includes('Bỏ focus'));
  push('CSS_FLEX_ROW', css.includes('work-inbox-checklist-focus-bar__row') && css.includes('items-center'));
  push('CSS_ELLIPSIS', css.includes('truncate') && css.includes('work-inbox-checklist-focus-status__title'));
  push('DATA_ATTR', section.includes('data-cbv-checklist-focus-bar="single-row"'));
  push('AUTHORITY', authority.includes('one compact row'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('FBS browser suite required for layout GO');

  return { suite: 'PHASE_CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT', status, checks, warnings };
}
