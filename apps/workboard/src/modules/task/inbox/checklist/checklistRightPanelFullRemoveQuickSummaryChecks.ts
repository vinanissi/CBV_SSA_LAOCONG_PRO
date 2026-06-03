/**
 * PHASE_CHECKLIST_RIGHT_PANEL_FULL_REMOVE_QUICK_SUMMARY — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..', '..', '..', '..', '..', '..');
const readLocal = (name: string) => readFileSync(join(__dir, name), 'utf8');
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

const panel = readLocal('FocusedChecklistStepDetailPanel.tsx');
const right = readRepo('apps/workboard/src/modules/task/inbox/focusRuntime/RightContextTabs.tsx');
const row = readLocal('SmartChecklistItemRow.tsx');
const authority = readRepo('00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md');

const checks = [
  { id: 'PANEL_STUB_NULL', pass: panel.includes('return null') && !panel.includes('work-inbox-focused-step-detail') },
  { id: 'PANEL_NO_COUNTS', pass: !panel.includes('Tài liệu') && !panel.includes('Phản hồi') },
  { id: 'RIGHT_NO_PANEL_MOUNT', pass: !right.includes('<FocusedChecklistStepDetailPanel') },
  { id: 'RIGHT_TABS_ONLY', pass: right.includes("label: 'Chi tiết'") && right.includes("label: 'Hồ sơ'") },
  {
    id: 'CENTER_INLINE_PRESERVED',
    pass: row.includes('openCenterInlineSection') && row.includes('work-inbox-smart-checklist__center-inline-panels'),
  },
  { id: 'LAYOUT_AUTHORITY', pass: authority.includes('RIGHT PANEL = Supplementary context only') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_RIGHT_PANEL_FULL_REMOVE_QUICK_SUMMARY', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
