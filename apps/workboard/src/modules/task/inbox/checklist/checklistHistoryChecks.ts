/**
 * PHASE_CHECKLIST_05_HISTORY — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendChecklistHistoryEntry, makeChecklistHistoryId } from './checklistHistoryLocalStore';
import type { ChecklistHistoryEntry } from './checklistHistoryTypes';
import { enrichSmartChecklistItem } from './enrichSmartChecklistRuntime';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import { deriveChecklistInlineActions } from './deriveChecklistInlineActions';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

const LEGACY: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Thu hồ sơ',
  status: 'open',
  sortOrder: 1,
  isDone: false,
};

export function runChecklistHistoryRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const row = readLocal('SmartChecklistItemRow.tsx');
  const panel = readLocal('ChecklistHistoryPanel.tsx');
  const actionRow = readLocal('ChecklistInlineActionRow.tsx');
  const section = readLocal('WorkInboxChecklistSection.tsx');
  const derive = readLocal('deriveChecklistInlineActions.ts');

  const base = adaptToSmartChecklistItem(LEGACY);
  const entry: ChecklistHistoryEntry = {
    id: makeChecklistHistoryId(),
    checklistItemId: 'cl-1',
    type: 'feedback_added',
    message: 'Thêm phản hồi: Khách hẹn bổ sung GPLX.',
    actor: 'Ngọc',
    createdAt: new Date().toISOString(),
    source: 'feedback_runtime',
    refType: 'feedback',
  };
  const enriched = enrichSmartChecklistItem(base, {
    historyByItemId: { 'cl-1': [entry] },
  });
  const actions = deriveChecklistInlineActions(base, true);

  push('HISTORY_LEGACY_EMPTY', enrichSmartChecklistItem(base, {}).historyCount === 0);
  push('HISTORY_COUNT_MATCHES', enriched.historyCount === 1);
  push('HISTORY_UI_CHIP', derive.includes('Lịch sử') && actionRow.includes('--history'));
  push('HISTORY_UI_PANEL', row.includes('ChecklistHistoryPanel') && panel.includes('Lịch sử:'));
  push('HISTORY_MANUAL_NOTE', panel.includes('+ Thêm ghi chú lịch sử'));
  push('HISTORY_SECTION_WIRED', section.includes('useChecklistHistoryRuntime'));
  push('HISTORY_CAPTURE_FEEDBACK', section.includes("type: 'feedback_added'"));
  push('HISTORY_CAPTURE_STATUS', section.includes("type: 'checklist_status_changed'"));
  push('HISTORY_DELETE_CLEANS', section.includes('clearHistoryForItem'));
  push('HISTORY_NO_EVENT_STORE', !panel.includes('EVENT_STORE') && !section.includes('workflowEngine'));
  push('HISTORY_INLINE_ACTIONS_COUNT', (actions.length ?? 0) >= 4);
  push('HISTORY_APPEND_ONLY', readLocal('checklistHistoryLocalStore.ts').includes('appendChecklistHistoryEntry'));

  let map = appendChecklistHistoryEntry({}, entry);
  map = appendChecklistHistoryEntry(map, {
    ...entry,
    id: makeChecklistHistoryId(),
    message: 'Đánh dấu bước hoàn thành.',
    type: 'checklist_status_changed',
  });
  push('HISTORY_STORE_APPEND', (map['cl-1']?.length ?? 0) === 2);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('History stored in browser localStorage only; not synced to backend');
  warnings.push('note_updated events not auto-captured in this phase');
  warnings.push('Manual browser UAT recommended for chronological panel UX');

  return { suite: 'PHASE_CHECKLIST_05_HISTORY', status, checks, warnings };
}
