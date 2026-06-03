/**
 * PHASE_CHECKLIST_ROW_CLICK_FOCUS_ONLY — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const row = readFileSync(join(__dir, 'SmartChecklistItemRow.tsx'), 'utf8');
const section = readFileSync(join(__dir, 'WorkInboxChecklistSection.tsx'), 'utf8');

const checks = [
  {
    id: 'TITLE_OUTSIDE_CHECK_LABEL',
    pass:
      row.includes('work-inbox-smart-checklist__check--completion-only') &&
      !row.match(/<label[\s\S]{0,400}work-inbox-smart-checklist__title/),
  },
  { id: 'CHECK_STOP_PROPAGATION', pass: row.includes('stopPropagation') && row.includes('onChange={() => onToggle') },
  { id: 'HEADER_FOCUS_HANDLER', pass: row.includes('handleHeaderFocusClick') && row.includes('header--focusable') },
  { id: 'TOGGLE_NO_FOCUS_COUPLE', pass: !section.includes('onToggle={() => {\n                setFocusedChecklistItemId') },
  { id: 'FOCUS_TOGGLE', pass: section.includes('focusedChecklistItemId === item.id') && section.includes('setFocusedChecklistItemId(null)') },
  { id: 'ON_ACTIVATE_STEP', pass: section.includes('onActivateStep={() =>') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_ROW_CLICK_FOCUS_ONLY', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
