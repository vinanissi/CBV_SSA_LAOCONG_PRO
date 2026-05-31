/**
 * PHASE_WORK_INBOX_FOCUS_DENSITY_OPTIMIZATION — static layout checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runWorkInboxFocusDensityOptimizationChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const workspace = readLocal('FocusTaskWorkspace.tsx');
  const cards = readLocal('FocusContentCards.tsx');
  const right = readLocal('RightContextTabs.tsx');
  const checklist = readLocal('../checklist/WorkInboxChecklistSection.tsx');
  const attachments = readLocal('../attachments/WorkInboxAttachmentsSection.tsx');
  const css = readFileSync(
    join(__dir, '..', '..', '..', '..', 'styles', 'index.css'),
    'utf8',
  );

  push('DENSITY_COMPACT_HEADER', workspace.includes('CompactTaskHeader') && !workspace.includes('TaskMetadataRow'));
  push('DENSITY_NO_CREATED_UPDATED_MAIN', !workspace.includes('createdLabel') && !workspace.includes('Tạo lúc'));
  push('DENSITY_AI_COMPACT_ROW', cards.includes('work-inbox-ai-summary--compact') && cards.includes('isCompactAiSummary'));
  push('DENSITY_CHECKLIST_DENSE_PROP', cards.includes('dense') && checklist.includes('checklist-dense'));
  push('DENSITY_ATTACHMENTS_DENSE_PROP', cards.includes('dense') && attachments.includes('attachments-dense'));
  push('DENSITY_CHECKLIST_RUNTIME_INTACT', checklist.includes('toggleItem(') && checklist.includes('deleteItem('));
  push('DENSITY_CHECKLIST_CRUD', checklist.includes('createItem') && checklist.includes('deleteItem'));
  push('DENSITY_ATTACHMENTS_RUNTIME_INTACT', attachments.includes('useWorkInboxAttachmentsRuntime'));
  push('DENSITY_RIGHT_PANEL_RELATED', right.includes('THÔNG TIN LIÊN QUAN'));
  push('DENSITY_NO_API_IN_LAYOUT', !cards.includes('api.list') && !checklist.includes('script.google.com'));
  push('DENSITY_CSS_TOKENS', css.includes('work-inbox-focus-workspace--focus-density'));
  push('DENSITY_MAIN_ORDER', workspace.indexOf('CompactTaskHeader') < workspace.indexOf('FocusContentCards'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  warnings.push('Visual scroll reduction — verify in browser');

  return { suite: 'PHASE_WORK_INBOX_FOCUS_DENSITY_OPTIMIZATION', status, checks, warnings };
}
