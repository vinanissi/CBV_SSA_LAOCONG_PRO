/**
 * PHASE_CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readLocal = (name: string) => readFileSync(join(__dir, name), 'utf8');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const panel = readLocal('FocusedChecklistStepDetailPanel.tsx');
const row = readLocal('SmartChecklistItemRow.tsx');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RIGHT_PANEL_DEDUP_AUTHORITY.md');

const checks = [
  {
    id: 'RIGHT_NO_FEEDBACK_PANEL',
    pass: !panel.includes('ChecklistFeedbackPanel') && !panel.includes('ChecklistAttachmentPanel'),
  },
  {
    id: 'RIGHT_NO_LINK_HISTORY_PANEL',
    pass: !panel.includes('ChecklistLinkPanel') && !panel.includes('ChecklistHistoryPanel'),
  },
  {
    id: 'RIGHT_READ_ONLY_ATTR',
    pass: panel.includes('data-checklist-right-quick-actions="read-only-summary"'),
  },
  {
    id: 'RIGHT_NO_SECTION_TABS',
    pass: !panel.includes('work-inbox-focused-step-detail__section-tab'),
  },
  {
    id: 'ROW_NO_MIRROR_OPEN_DETAIL',
    pass: !row.includes('mirrorRightPane') && !row.includes('openDetailForItem'),
  },
  { id: 'ROW_SYNC_FOCUS_ONLY', pass: row.includes('syncRightPaneFocus') && row.includes('setDetailSection(null)') },
  {
    id: 'CENTER_INLINE_PRESERVED',
    pass: row.includes('openCenterInlineSection') && row.includes('work-inbox-smart-checklist__center-inline-panels'),
  },
  { id: 'DEDUP_AUTHORITY_DOC', pass: authority.includes('CENTER-only') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
