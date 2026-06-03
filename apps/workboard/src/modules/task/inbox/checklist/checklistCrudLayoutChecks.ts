/**
 * PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichSmartChecklistWithCrudLayout } from './enrichSmartChecklistWithCrudLayout';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import { patchChecklistCrudOverlay } from './checklistCrudOverlayLocalStore';
import {
  collapseAllChecklistItems,
  expandAllChecklistItems,
  loadChecklistLayoutForTask,
} from './checklistLayoutLocalStore';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

const LEGACY: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Thu GPLX',
  status: 'open',
  sortOrder: 1,
  isDone: false,
  note: 'Ghi chú mẫu',
};

export function runChecklistCrudLayoutRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readLocal('WorkInboxChecklistSection.tsx');
  const row = readLocal('SmartChecklistItemRow.tsx');
  const toolbar = readLocal('ChecklistListToolbar.tsx');
  const menu = readLocal('ChecklistItemCrudMenu.tsx');
  const hook = readLocal('useWorkInboxChecklistRuntime.ts');

  const base = adaptToSmartChecklistItem(LEGACY);
  let overlay = patchChecklistCrudOverlay({}, 'cl-1', { isArchived: true, note: 'Lưu trữ' });
  const layout = expandAllChecklistItems(loadChecklistLayoutForTask('T-1'), ['cl-1']);
  const enriched = enrichSmartChecklistWithCrudLayout(base, {
    legacy: LEGACY,
    overlayByItemId: overlay,
    layout,
    fallbackSortOrder: 1,
  });

  push('CRUD_TOOLBAR', toolbar.includes('Mở tất cả') && toolbar.includes('+ Thêm bước'));
  push('CRUD_ITEM_MENU', menu.includes('Lưu trữ') && menu.includes('Di chuyển lên'));
  push('CRUD_EXPAND_COLLAPSE', row.includes('Thu nhỏ') && section.includes('collapseAll'));
  push('CRUD_NOTE_EDIT', row.includes('Ghi chú bước') && section.includes('setNote'));
  push('CRUD_ARCHIVE_OVERLAY', enriched.isArchived === true);
  push('CRUD_LAYOUT_EXPANDED', enriched.layoutExpanded === true);
  push('CRUD_REORDER_API', hook.includes('reorderItem') && hook.includes('sortOrder'));
  push('CRUD_NO_HARD_DELETE_UI', !row.includes('work-inbox-checklist__delete'));
  push('CRUD_SECTION_WIRED', section.includes('useChecklistLayoutRuntime'));
  push('CRUD_HISTORY_CREATE', section.includes('Tạo bước:'));
  push('CRUD_NO_WORKFLOW', !section.includes('workflowEngine') && !toolbar.includes('agentRuntime'));
  push('CRUD_LEGACY_SAFE', enriched.title === 'Thu GPLX' && enriched.sortOrder === 1);

  overlay = patchChecklistCrudOverlay(overlay, 'cl-1', { isArchived: false });
  const restored = enrichSmartChecklistWithCrudLayout(base, { overlayByItemId: overlay });
  push('CRUD_RESTORE', restored.isArchived === false);

  const collapsed = collapseAllChecklistItems(layout);
  push('CRUD_COLLAPSE_ALL', collapsed.expandedItemIds.length === 0);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Archive and note overlay use browser localStorage; title/order use existing API');
  warnings.push('Permanent delete removed from row UI; archive is reversible');
  warnings.push('Manual browser CRUD UAT recommended');

  return { suite: 'PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME', status, checks, warnings };
}
