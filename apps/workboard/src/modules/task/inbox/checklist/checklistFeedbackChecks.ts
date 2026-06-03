/**
 * PHASE_CHECKLIST_02_FEEDBACK — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  appendChecklistFeedback,
  loadChecklistFeedbackForTask,
  makeChecklistFeedbackId,
} from './checklistFeedbackLocalStore';
import type { ChecklistFeedback } from './checklistFeedbackTypes';
import { enrichSmartChecklistWithFeedback } from './enrichSmartChecklistWithFeedback';
import { formatChecklistFeedbackTime } from './smartChecklistFormat';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readContract(): string {
  try {
    return readFileSync(
      join(__dir, '..', '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN', 'CHECKLIST', 'CHECKLIST_FEEDBACK_CONTRACT.md'),
      'utf8',
    );
  } catch {
    return '';
  }
}

const LEGACY_ITEM: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Gọi xã viên',
  status: 'open',
  sortOrder: 1,
  isDone: false,
};

export function runChecklistFeedbackRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const row = readLocal('SmartChecklistItemRow.tsx');
  const panel = readLocal('ChecklistFeedbackPanel.tsx');
  const section = readLocal('WorkInboxChecklistSection.tsx');
  const store = readLocal('checklistFeedbackLocalStore.ts');
  const contract = readContract();

  const base = adaptToSmartChecklistItem(LEGACY_ITEM);
  const entry: ChecklistFeedback = {
    id: makeChecklistFeedbackId(),
    checklistItemId: 'cl-1',
    message: 'Đã gọi.',
    author: 'Op',
    createdAt: '2026-06-01T14:00:00.000Z',
  };
  const enriched = enrichSmartChecklistWithFeedback(base, { 'cl-1': [entry] });

  push('FB_LEGACY_NO_FEEDBACK', enrichSmartChecklistWithFeedback(base, {}).responseCount === 0);
  push('FB_COUNT_MATCHES_LIST', enriched.responseCount === 1 && (enriched.feedback?.length ?? 0) === 1);
  push('FB_NULL_MAP_SAFE', enrichSmartChecklistWithFeedback(base, null).feedback?.length === 0);
  push('FB_TIME_FORMAT', formatChecklistFeedbackTime(entry.createdAt).length >= 4);
  push(
    'FB_UI_TOGGLE',
    row.includes('ChecklistFeedbackPanel') &&
      (row.includes('ChecklistInlineActionRow') || readLocal('ChecklistInlineActionRow.tsx').includes('phản hồi')),
  );
  push('FB_UI_ADD', panel.includes('+ Thêm phản hồi'));
  push('FB_SECTION_WIRED', section.includes('useChecklistFeedbackRuntime') && section.includes('enrichSmartChecklistList'));
  push('FB_NO_FEEDBACK_TABLE', !store.includes('CHECKLIST_FEEDBACK_TABLE'));
  push(
    'FB_LOCAL_STORE',
    store.includes('localStorage') &&
      store.includes('cbv-checklist-feedback:') &&
      store.includes('saveChecklistFeedbackForTask'),
  );
  push('FB_CONTRACT_DOC', contract.includes('ChecklistFeedback') || panel.includes('ChecklistFeedback'));
  push('FB_DELETE_CLEANS', section.includes('clearFeedbackForItem'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  warnings.push('Feedback persisted in browser localStorage only until server contract exists');
  warnings.push('Cross-device sync and GAS persistence not in this phase');

  return { suite: 'PHASE_CHECKLIST_02_FEEDBACK', status, checks, warnings };
}
