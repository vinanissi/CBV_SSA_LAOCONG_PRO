/**
 * PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readLocal = (name: string) => readFileSync(join(__dir, name), 'utf8');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const row = readLocal('SmartChecklistItemRow.tsx');
const css = readRepo('apps/workboard/src/styles/index.css');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md');

const checks = [
  { id: 'OPEN_CENTER_INLINE', pass: row.includes('openCenterInlineSection') },
  {
    id: 'CENTER_INLINE_DOM',
    pass: row.includes('work-inbox-smart-checklist__center-inline-panels') && row.includes('data-checklist-center-inline'),
  },
  {
    id: 'NAVIGATOR_SHOWS_CENTER_PANELS',
    pass: row.includes('showCenterInlinePanels = navigatorOnly && anyPanelExpanded'),
  },
  {
    id: 'CHIP_ACTIVE_LOCAL_STATE',
    pass: row.includes('feedbackActive={feedbackExpanded}') && !row.includes('dualPaneCtx.detailSection ==='),
  },
  {
    id: 'RIGHT_MIRROR_OPTIONAL',
    pass: row.includes('mirrorRightPane') && row.includes('openDetailForItem'),
  },
  { id: 'CSS_CENTER_INLINE', pass: css.includes('.work-inbox-smart-checklist__center-inline-panels') },
  { id: 'AUTHORITY_DOC', pass: authority.includes('CENTER = fast checklist operation area') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
