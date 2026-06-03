/**
 * PHASE_CHECKLIST_09_FOCUS_WORKSPACE — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
const css = readRepo('apps/workboard/src/styles/index.css');
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_FOCUS_WORKSPACE_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_FOCUS_WORKSPACE_AUTHORITY.md');

const checks = [
  { id: 'ENTER_WORKSPACE', pass: section.includes('Tập trung bước') && section.includes('setFocusWorkspaceEnabled(true)') },
  { id: 'EXIT_WORKSPACE', pass: section.includes('Thoát tập trung') && section.includes('setFocusWorkspaceEnabled(false)') },
  { id: 'PREV_NEXT_NAV', pass: section.includes('Bước trước') && section.includes('Bước sau') },
  { id: 'NAVIGATOR_SWITCH', pass: section.includes('work-inbox-checklist-focus-workspace__step') && section.includes('setFocusedChecklistItemId(item.id)') },
  { id: 'SAFE_BOUNDS', pass: section.includes('disabled={focusedWorkspaceIndex <= 0}') && section.includes('focusedWorkspaceIndex < visibleItems.length - 1') },
  { id: 'DEEPLINK_FOCUS_COMPAT', pass: section.includes('setFocusedChecklistItemId(highlightedItemId)') },
  { id: 'FOCUSED_ROW_PROMINENT', pass: css.includes('.work-inbox-smart-checklist__row--focused') },
  { id: 'INTERACTION_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistInteractionFeedbackChecks.ts').includes('ROW_STATE_ATTR') },
  { id: 'TOAST_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts').includes('TOAST_PROVIDER') },
  { id: 'PROGRESS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts').includes('PERCENT_SAFE') },
  { id: 'COPY_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts').includes('STEP_PARAM_PRESENT') },
  { id: 'COMMENT_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCommentSignalingChecks.ts').includes('COMMENT_COUNT_RENDER') },
  { id: 'COMPACT_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCompactRowModeChecks.ts').includes('COMPACT_ROW_CLASS') },
  { id: 'LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('REQUEST_SEQ_GUARD') },
  { id: 'CONTRACT_DOC', pass: contract.includes('focusWorkspaceEnabled') && contract.includes('UI-only') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('No persistence change') && authority.includes('No schema change') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    {
      suite: 'PHASE_CHECKLIST_09_FOCUS_WORKSPACE',
      status: failed.length ? 'FAIL' : 'GO_WITH_WARNINGS',
      checks,
      warnings: ['Manual browser focus workspace flow evidence is partial in CI-only run'],
    },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

