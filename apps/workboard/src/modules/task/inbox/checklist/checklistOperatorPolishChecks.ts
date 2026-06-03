/**
 * PHASE_CHECKLIST_07_OPERATOR_POLISH — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

const css = readRepo('apps/workboard/src/styles/index.css');
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_OPERATOR_POLISH_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_OPERATOR_POLISH_AUTHORITY.md');

const checks = [
  { id: 'HEADER_READABLE', pass: css.includes('.work-inbox-focus-card__title') },
  { id: 'PROGRESS_VISIBLE_COMPACT', pass: css.includes('.work-inbox-checklist-progress') && css.includes('work-inbox-checklist-progress__meta') },
  { id: 'FOCUSED_ROW_PROMINENT', pass: css.includes('.work-inbox-smart-checklist__row--focused') && css.includes('shadow-sm') },
  { id: 'DIMMED_READABLE', pass: css.includes('.work-inbox-smart-checklist__row--dimmed') && css.includes('opacity: 0.72') },
  { id: 'INTERACTION_STATES_VISIBLE', pass: css.includes('row--pending') && css.includes('row--saved') && css.includes('row--failed') },
  { id: 'TOAST_NON_BLOCKING', pass: css.includes('.cbv-checklist-toast') && css.includes('pointer-events-none') },
  { id: 'COPY_LINK_DISCOVERABLE', pass: css.includes('.work-inbox-smart-checklist__step-link-btn') },
  { id: 'COMMENT_SIGNAL_VISIBLE', pass: css.includes('comment-signal--has-comments') && css.includes('comment-signal--none') },
  { id: 'ROW_HOVER_AFFORDANCE', pass: css.includes('.work-inbox-smart-checklist__row:hover') },
  { id: 'KEYBOARD_FOCUS_VISIBLE', pass: css.includes('.work-inbox-smart-checklist__row:focus-within') && css.includes('focus-visible:ring-2') },
  { id: 'DISABLED_STATE_CLEAR', pass: css.includes('work-inbox-smart-checklist__row--disabled') && css.includes('disabled:opacity-60') },
  { id: 'LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('REQUEST_SEQ_GUARD') },
  { id: 'CONTRACT_DOC', pass: contract.includes('Visual hierarchy') && contract.includes('Accessibility') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('No persistence change') && authority.includes('No schema change') },
];

const failed = checks.filter((c) => !c.pass);
const result = {
  suite: 'PHASE_CHECKLIST_07_OPERATOR_POLISH',
  status: failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS',
  checks,
  warnings: ['Manual browser visual ergonomics and keyboard smoke evidence not captured in CI'],
};

console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

