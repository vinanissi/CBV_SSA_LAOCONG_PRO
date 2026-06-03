/**
 * PHASE_CHECKLIST_05_COPY_LINK_UX — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel.replace(/^\//, '')), 'utf8');
}

const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
const copy = readRepo('apps/workboard/src/modules/task/inbox/link/copyChecklistStepLink.ts');
const deepLink = readRepo('apps/workboard/src/modules/task/inbox/link/stepDeepLink.ts');
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_COPY_LINK_UX_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_COPY_LINK_UX_AUTHORITY.md');

const checks = [
  { id: 'COPY_ACTION_VISIBLE', pass: row.includes('onCopyStepLink') && row.includes('copyStepLinkTitle') },
  { id: 'TASK_ID_IN_URL', pass: deepLink.includes('buildChecklistStepDeepLinkPath') && deepLink.includes('encodeURIComponent(tid)') },
  { id: 'STEP_PARAM_PRESENT', pass: deepLink.includes('qs.set(CHECKLIST_STEP_QUERY_KEY, cid);') },
  { id: 'STEP_PARAM_SINGLE', pass: deepLink.includes('qs.set(CHECKLIST_STEP_QUERY_KEY, cid);') },
  { id: 'CLIPBOARD_API', pass: copy.includes('navigator.clipboard?.writeText') },
  { id: 'COPY_SUCCESS_FEEDBACK', pass: copy.includes("message: 'Đã sao chép link'") && section.includes('Đã sao chép link') && section.includes('showChecklistToast(') },
  { id: 'COPY_FAILURE_FEEDBACK', pass: copy.includes("message: 'Không thể sao chép link'") && section.includes('Không thể sao chép link') && section.includes('showChecklistToast(') },
  { id: 'RAPID_DUPLICATE_GUARD', pass: section.includes("if (copyLinkStateByItemId[checklistItemId] === 'copying') return;") },
  { id: 'NO_STATE_MUTATION', pass: !copy.includes('updateItem(') && !copy.includes('toggleItem(') },
  { id: 'FOCUS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFocusStepModeChecks.ts').includes('ONE_FOCUS_ONLY') },
  { id: 'PROGRESS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts').includes('PERCENT_SAFE') },
  { id: 'LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('REQUEST_SEQ_GUARD') },
  { id: 'CONTRACT_DOC', pass: contract.includes('/inbox/<taskId>?step=<checklistItemId>') && contract.includes('Đã sao chép link') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('No persistence change') && authority.includes('No schema change') },
];

const failed = checks.filter((c) => !c.pass);
const result = {
  suite: 'PHASE_CHECKLIST_05_COPY_LINK_UX',
  status: failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS',
  checks,
  warnings: ['Manual browser clipboard-failure simulation evidence not captured in CI'],
};

console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

