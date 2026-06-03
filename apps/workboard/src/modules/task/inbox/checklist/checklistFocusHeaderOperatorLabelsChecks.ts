/**
 * PHASE_CHECKLIST_FOCUS_HEADER_OPERATOR_LABELS — static checks.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const section = readFileSync(join(__dir, 'WorkInboxChecklistSection.tsx'), 'utf8');

const checks = [
  {
    id: 'NO_ID_IN_FOCUS_STATUS',
    pass: !section.includes('Đang focus bước: {focusedChecklistItemId}'),
  },
  { id: 'USES_DISPLAY_TITLE', pass: section.includes('focusedStepDisplayTitle') },
  { id: 'TITLE_LOOKUP', pass: section.includes('item?.title?.trim()') },
  { id: 'FALLBACK_LABEL', pass: section.includes("'bước đang chọn'") },
  { id: 'FOCUS_STATUS_ROW', pass: section.includes('work-inbox-checklist-focus-status') },
  { id: 'CLEAR_FOCUS_KEPT', pass: section.includes('Bỏ focus') && section.includes('setFocusedChecklistItemId(null)') },
];

const failed = checks.filter((c) => !c.pass);
console.log(
  JSON.stringify(
    { suite: 'PHASE_CHECKLIST_FOCUS_HEADER_OPERATOR_LABELS', status: failed.length ? 'FAIL' : 'GO', checks },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(`FAILED: ${failed.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
