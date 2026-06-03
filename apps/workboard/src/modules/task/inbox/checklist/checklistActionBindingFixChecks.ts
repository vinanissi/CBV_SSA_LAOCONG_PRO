/**
 * PHASE_CHECKLIST_ACTION_BINDING_FIX — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readLocal = (name: string) => readFileSync(join(__dir, name), 'utf8');

const context = readLocal('ChecklistDualPaneFocusContext.tsx');
const row = readLocal('SmartChecklistItemRow.tsx');
const panel = readLocal('FocusedChecklistStepDetailPanel.tsx');
const section = readFileSync(
  join(repoRoot, 'apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx'),
  'utf8',
);

const checks = [
  {
    id: 'DUAL_PANE_OPEN_DETAIL',
    pass: context.includes('openDetailForItem') && context.includes('detailSection'),
  },
  {
    id: 'ROW_ACTION_BRIDGE',
    pass: row.includes('openDualPaneSection') && row.includes("openDualPaneSection('feedback'"),
  },
  {
    id: 'REGISTER_ROW_ACTIONS',
    pass: section.includes('registerRowActions') && context.includes('registerRowActions'),
  },
  {
    id: 'PANEL_BINDS_SECTION',
    pass: panel.includes('data-checklist-detail-section') && panel.includes('openSection ==='),
  },
  {
    id: 'PANEL_FEEDBACK_EXPANDED',
    pass: panel.includes("openSection === 'feedback'") && panel.includes('ChecklistFeedbackPanel'),
  },
  {
    id: 'ACTIVE_CHIP_SYNC',
    pass:
      row.includes('dualPaneCtx.detailSection ===') && row.includes('focusedChecklistItemId === item.id'),
  },
  {
    id: 'NO_SILENT_NAVIGATOR',
    pass:
      row.includes('navigatorOnly && layoutExpanded') === false ||
      row.includes('!navigatorOnly && layoutExpanded'),
  },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    {
      suite: 'PHASE_CHECKLIST_ACTION_BINDING_FIX',
      status: failed.length ? 'FAIL' : 'GO_WITH_WARNINGS',
      checks,
    },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
