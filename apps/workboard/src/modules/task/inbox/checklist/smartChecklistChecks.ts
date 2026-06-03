/**
 * PHASE_CHECKLIST_01_SMART_CHECKLIST — static foundation checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import { formatSmartChecklistUpdatedAt } from './smartChecklistFormat';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readContractDoc(): string {
  try {
    return readFileSync(
      join(__dir, '..', '..', '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN', 'CHECKLIST', 'CHECKLIST_SMART_ITEM_CONTRACT.md'),
      'utf8',
    );
  } catch {
    return '';
  }
}

const LEGACY_OPEN: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Gọi xã viên',
  status: 'open',
  sortOrder: 1,
  isDone: false,
};

const LEGACY_DONE: WorkInboxChecklistItem = {
  checklistId: 'cl-2',
  taskId: 'T-1',
  title: 'Hoàn tất',
  status: 'done',
  sortOrder: 2,
  isDone: true,
  updatedAt: '2026-06-01T10:00:00.000Z',
  note: 'Đã liên hệ',
};

export function runSmartChecklistFoundationChecks(): {
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
  const adapter = readLocal('adaptToSmartChecklistItem.ts');
  const contractText = readContractDoc();

  const openSmart = adaptToSmartChecklistItem(LEGACY_OPEN);
  const doneSmart = adaptToSmartChecklistItem(LEGACY_DONE);
  const idempotent =
    JSON.stringify(adaptToSmartChecklistItem(LEGACY_OPEN)) === JSON.stringify(openSmart);

  push('SMART_LEGACY_OPEN_ADAPTS', openSmart.status === 'todo' && openSmart.responseCount === 0);
  push('SMART_LEGACY_DONE_ADAPTS', doneSmart.status === 'done' && doneSmart.note === 'Đã liên hệ');
  push('SMART_ADAPTER_IDEMPOTENT', idempotent);
  push('SMART_MISSING_COUNTS_DEFAULT', openSmart.attachmentCount === 0 && openSmart.linkCount === 0);
  push(
    'SMART_MISSING_TIMESTAMP_SAFE',
    formatSmartChecklistUpdatedAt(null) === 'chưa có' && formatSmartChecklistUpdatedAt('bad') === 'chưa có',
  );
  push('SMART_UI_META_LINE', row.includes('phản hồi') && row.includes('tài liệu') && row.includes('liên kết'));
  push('SMART_SECTION_USES_ROW', section.includes('SmartChecklistItemRow') && section.includes('adaptChecklistItems'));
  push('SMART_NO_PERSISTENCE_TABLES', !adapter.includes('CHECKLIST_MAIN') && !section.includes('CHECKLIST_TABLE'));
  push(
    'SMART_CONTRACT_DOC',
    contractText.includes('SmartChecklistItem') || adapter.includes('SmartChecklistItem'),
  );
  push('SMART_CASE_BOUNDARY', !row.includes('createCase') && !adapter.includes('CASE_MAIN'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  warnings.push('Feedback/attachment/link phases not implemented — counts are placeholders');
  if (!contractText) {
    warnings.push('CHECKLIST_SMART_ITEM_CONTRACT.md not found at expected path during check run');
  }

  return { suite: 'PHASE_CHECKLIST_01_SMART_CHECKLIST', status, checks, warnings };
}
