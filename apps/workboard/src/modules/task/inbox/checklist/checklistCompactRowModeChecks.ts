/**
 * PHASE_CHECKLIST_08_COMPACT_ROW_MODE — static checks.
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
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_COMPACT_ROW_MODE_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_COMPACT_ROW_MODE_AUTHORITY.md');

const checks = [
  { id: 'COMPACT_ROW_CLASS', pass: css.includes('.work-inbox-smart-checklist__row--compact') && css.includes('py-0.5') },
  { id: 'FOCUSED_ROW_STILL_PROMINENT', pass: css.includes('.work-inbox-smart-checklist__row--focused') && css.includes('ring-violet-500') },
  { id: 'COUNTS_VISIBLE', pass: css.includes('.work-inbox-checklist-inline-actions__chip') && css.includes('work-inbox-smart-checklist__comment-signal') },
  { id: 'COPY_LINK_VISIBLE', pass: css.includes('.work-inbox-smart-checklist__step-link-btn') },
  { id: 'INTERACTION_STATE_VISIBLE', pass: css.includes('row--pending') && css.includes('row--saved') && css.includes('row--failed') },
  { id: 'DIMMED_READABLE', pass: css.includes('.work-inbox-smart-checklist__row--dimmed') && css.includes('opacity: 0.72') },
  { id: 'METADATA_NOT_LOST', pass: css.includes('.work-inbox-smart-checklist__meta') && css.includes('.work-inbox-smart-checklist__note') },
  { id: 'FOCUS_MODE_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFocusStepModeChecks.ts').includes('ONE_FOCUS_ONLY') },
  { id: 'PROGRESS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts').includes('PERCENT_SAFE') },
  { id: 'COMMENT_SIGNAL_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCommentSignalingChecks.ts').includes('COMMENT_COUNT_RENDER') },
  { id: 'COPY_LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts').includes('STEP_PARAM_PRESENT') },
  { id: 'TOAST_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts').includes('TOAST_PROVIDER') },
  { id: 'LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('REQUEST_SEQ_GUARD') },
  { id: 'CONTRACT_DOC', pass: contract.includes('80-120px') && contract.includes('compact') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('No persistence change') && authority.includes('No schema change') },
];

const failed = checks.filter((c) => !c.pass);
const result = {
  suite: 'PHASE_CHECKLIST_08_COMPACT_ROW_MODE',
  status: failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS',
  checks,
  warnings: ['Manual browser visual density verification remains partial in CI-only run'],
};

console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

