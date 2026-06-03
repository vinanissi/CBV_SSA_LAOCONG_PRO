/**
 * PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const section = readRepo('apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx');
const row = readRepo('apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx');
const panel = readRepo('apps/workboard/src/modules/task/inbox/checklist/FocusedChecklistStepDetailPanel.tsx');
const context = readRepo('apps/workboard/src/modules/task/inbox/checklist/ChecklistDualPaneFocusContext.tsx');
const runtime = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx');
const right = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/RightContextTabs.tsx');
const css = readRepo('apps/workboard/src/styles/index.css');
const contract = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_DUAL_PANE_RUNTIME_CONTRACT.md');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_DUAL_PANE_RUNTIME_AUTHORITY.md');

const checks = [
  { id: 'DUAL_PANE_PROVIDER', pass: runtime.includes('ChecklistDualPaneFocusProvider') },
  { id: 'RIGHT_DETAIL_PANEL', pass: right.includes('FocusedChecklistStepDetailPanel') },
  { id: 'FOCUS_CONTEXT_SYNC', pass: section.includes('setFocusedItem') && context.includes('focusedItem') },
  { id: 'NAVIGATOR_ONLY_ROWS', pass: row.includes('navigatorOnly') && section.includes('navigatorOnly={dualPaneOn}') },
  { id: 'ROW_ACTIVATE_FOCUS', pass: section.includes('onActivateStep') && row.includes('onActivateStep') },
  {
    id: 'INLINE_ACTION_DUAL_PANE_BRIDGE',
    pass: row.includes('openDualPaneSection') && context.includes('openDetailForItem'),
  },
  { id: 'DEEPLINK_FOCUS_SYNC', pass: section.includes('setFocusedChecklistItemId(highlightedItemId)') },
  { id: 'TASK_LEVEL_DOSSIER_KEPT', pass: right.includes("activeTab === 'dossier'") && right.includes('DossierAggregatePanel') },
  { id: 'EMPTY_STATE', pass: panel.includes('Chọn một bước trong checklist') },
  { id: 'SECTION_LABELS', pass: panel.includes('Tài liệu') && panel.includes('Liên kết') && panel.includes('Phản hồi') && panel.includes('Lịch sử') },
  { id: 'NO_PERSISTENCE', pass: !section.includes('localStorage') && contract.includes('UI-only') },
  { id: 'DUAL_PANE_ATTR', pass: section.includes('data-checklist-dual-pane') },
  { id: 'FOCUS_WORKSPACE_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistFocusWorkspaceChecks.ts').includes('ENTER_WORKSPACE') },
  { id: 'INTERACTION_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistInteractionFeedbackChecks.ts').includes('ROW_STATE_ATTR') },
  { id: 'TOAST_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistToastNotificationChecks.ts').includes('TOAST_PROVIDER') },
  { id: 'PROGRESS_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistProgressVisualizationChecks.ts').includes('PERCENT_SAFE') },
  { id: 'COPY_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCopyLinkUxChecks.ts').includes('STEP_PARAM_PRESENT') },
  { id: 'COMMENT_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCommentSignalingChecks.ts').includes('COMMENT_COUNT_RENDER') },
  { id: 'COMPACT_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/checklist/checklistCompactRowModeChecks.ts').includes('COMPACT_ROW_CLASS') },
  { id: 'LINK_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/inbox/link/deferredStepResolutionChecks.ts').includes('HIGHLIGHT_EXACT_ROW') },
  { id: 'SHEET_REGRESSION', pass: readRepo('apps/workboard/src/modules/task/sheetRuntimeLatencyWarningFixChecks.ts').includes('REQUEST_SEQ_GUARD') },
  { id: 'DETAIL_PANEL_CSS', pass: css.includes('.work-inbox-focused-step-detail') },
  { id: 'CONTRACT_DOC', pass: contract.includes('dualPaneEnabled') && contract.includes('navigator') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('No persistence change') && authority.includes('Dossier Runtime') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    {
      suite: 'PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME',
      status: failed.length ? 'FAIL' : 'GO_WITH_WARNINGS',
      checks,
      warnings: ['Manual browser dual-pane sync evidence is partial in CI-only run'],
    },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
