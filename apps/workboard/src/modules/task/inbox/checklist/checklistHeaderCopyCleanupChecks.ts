/**
 * PHASE_CHECKLIST_HEADER_COPY_CLEANUP — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const section = readFileSync(join(__dir, 'WorkInboxChecklistSection.tsx'), 'utf8');
const layoutAuthority = readFileSync(
  join(repoRoot, '00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md'),
  'utf8',
);

const checks = [
  { id: 'NO_STALE_RIGHT_PANEL_COPY', pass: !section.includes('cột phải') && !section.includes('bảng điều hướng') },
  { id: 'HEADING_KEPT', pass: section.includes('CHECKLIST</h3>') || section.includes('>CHECKLIST<') },
  { id: 'NO_DUAL_PANE_HINT_BLOCK', pass: !section.includes('hint--dual-pane') },
  { id: 'PROGRESS_KEPT', pass: section.includes('work-inbox-checklist-progress') },
  { id: 'CENTER_INLINE_KEPT', pass: section.includes('navigatorOnly={dualPaneOn}') },
  { id: 'LAYOUT_AUTHORITY', pass: layoutAuthority.includes('CENTER = Checklist execution area') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_HEADER_COPY_CLEANUP', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
