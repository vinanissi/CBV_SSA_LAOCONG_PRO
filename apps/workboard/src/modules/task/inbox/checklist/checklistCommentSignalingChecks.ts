/**
 * PHASE_CHECKLIST_06_COMMENT_SIGNALING — static checks.
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
const inlineAction = readRepo('apps/workboard/src/modules/task/inbox/checklist/ChecklistInlineActionRow.tsx');
const feedbackTypes = readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFeedbackTypes.ts');
const css = readRepo('apps/workboard/src/styles/index.css');
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_COMMENT_SIGNALING_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_COMMENT_SIGNALING_AUTHORITY.md');

const checks = [
  { id: 'ZERO_COMMENT_NEUTRAL', pass: row.includes("const commentSignalState = commentCount > 0 ? 'has-comments' : 'none';") },
  { id: 'COMMENT_COUNT_RENDER', pass: row.includes('💬 Phản hồi (') && row.includes('commentCount') },
  { id: 'COUNT_DISTINGUISH', pass: row.includes('comment-signal--has-comments') && row.includes('comment-signal--none') },
  { id: 'ROW_COMMENT_ATTRS', pass: row.includes('data-checklist-comment-signal={commentSignalState}') && row.includes('data-checklist-comment-count={commentCount}') },
  { id: 'UNREAD_NOT_FABRICATED', pass: !feedbackTypes.includes('unread') && !row.includes('has-unread') },
  { id: 'FEEDBACK_ACTION_CLICKABLE', pass: inlineAction.includes('onFeedbackAction?.(!feedbackActive)') },
  { id: 'OPEN_BEHAVIOR_UNCHANGED', pass: row.includes('ChecklistFeedbackPanel') },
  { id: 'FOCUS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFocusStepModeChecks.ts').includes('ONE_FOCUS_ONLY') },
  { id: 'PROGRESS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts').includes('PERCENT_SAFE') },
  { id: 'COPY_LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts').includes('STEP_PARAM_PRESENT') },
  { id: 'TOAST_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts').includes('TOAST_PROVIDER') },
  { id: 'INTERACTION_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistInteractionFeedbackChecks.ts').includes('ROW_STATE_ATTR') },
  { id: 'LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('REQUEST_SEQ_GUARD') },
  { id: 'CONTRACT_DOC', pass: contract.includes('count-based signaling only') && contract.includes('data-checklist-comment-signal') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('No persistence change') && authority.includes('No schema change') },
  { id: 'COMMENT_SIGNAL_CSS', pass: css.includes('.work-inbox-smart-checklist__comment-signal') && css.includes('comment-signal--has-comments') },
];

const failed = checks.filter((c) => !c.pass);
const result = {
  suite: 'PHASE_CHECKLIST_06_COMMENT_SIGNALING',
  status: failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS',
  checks,
  warnings: ['Unread/new marker is unavailable because existing feedback model has no read-state'],
};

console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

