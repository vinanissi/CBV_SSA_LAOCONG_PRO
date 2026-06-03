/**
 * PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

function has(source: string, token: string): boolean {
  return source.includes(token);
}

const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
const css = readRepo('apps/workboard/src/styles/index.css');
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_PROGRESS_VISUALIZATION_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_PROGRESS_VISUALIZATION_AUTHORITY.md');

const checks = [
  { id: 'TOTAL_STEPS', pass: has(section, 'const totalSteps = smartItems.length;') },
  { id: 'COMPLETED_STEPS', pass: has(section, "item.status === 'done'") },
  { id: 'REMAINING_STEPS', pass: has(section, 'const remainingSteps = Math.max(0, totalSteps - completedSteps);') },
  { id: 'PERCENT_SAFE', pass: has(section, 'const percentComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;') },
  { id: 'PROGRESS_ATTRS', pass: has(section, 'data-checklist-progress-total=') && has(section, 'data-checklist-progress-completed=') && has(section, 'data-checklist-progress-percent=') },
  { id: 'PROGRESS_BAR', pass: has(section, "role=\"progressbar\"") && has(section, 'work-inbox-checklist-progress__fill') },
  { id: 'CSS_PROGRESS', pass: has(css, '.work-inbox-checklist-progress') && has(css, '.work-inbox-checklist-progress__bar') && has(css, '.work-inbox-checklist-progress__fill') },
  { id: 'TOAST_REGRESSION', pass: has(readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts'), 'TOAST_PROVIDER') },
  { id: 'FOCUS_REGRESSION', pass: has(readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFocusStepModeChecks.ts'), 'ONE_FOCUS_ONLY') },
  { id: 'LINK_REGRESSION', pass: has(readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts'), 'HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: has(readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts'), 'REQUEST_SEQ_GUARD') },
  { id: 'CONTRACT_DOC', pass: has(contract, 'percentComplete') && has(contract, '0 / 0 bước') },
  { id: 'AUTHORITY_DOC', pass: has(authority, 'No persistence change') && has(authority, 'No schema change') },
];

const failed = checks.filter((c) => !c.pass);
const result = {
  suite: 'PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION',
  status: failed.length ? 'FAIL' : 'GO_WITH_WARNINGS',
  checks,
  warnings: ['Manual browser UAT for progress visual polish not captured in CI'],
};

console.log(JSON.stringify(result, null, 2));
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

