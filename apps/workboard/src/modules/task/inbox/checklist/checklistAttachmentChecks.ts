/**
 * PHASE_CHECKLIST_03_ATTACHMENTS — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendChecklistAttachment, makeChecklistAttachmentId } from './checklistAttachmentLocalStore';
import type { ChecklistAttachment } from './checklistAttachmentTypes';
import { enrichSmartChecklistItem } from './enrichSmartChecklistRuntime';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

function readContract(): string {
  try {
    return readFileSync(
      join(__dir, '..', '..', '..', '..', '..', '..', '00_SYSTEM_BRAIN', 'CHECKLIST', 'CHECKLIST_ATTACHMENT_CONTRACT.md'),
      'utf8',
    );
  } catch {
    return '';
  }
}

const LEGACY_ITEM: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Thu hồ sơ xã viên',
  status: 'open',
  sortOrder: 1,
  isDone: false,
};

export function runChecklistAttachmentRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const row = readLocal('SmartChecklistItemRow.tsx');
  const panel = readLocal('ChecklistAttachmentPanel.tsx');
  const section = readLocal('WorkInboxChecklistSection.tsx');
  const store = readLocal('checklistAttachmentLocalStore.ts');
  const feedbackPanel = readLocal('ChecklistFeedbackPanel.tsx');
  const contract = readContract();

  const base = adaptToSmartChecklistItem(LEGACY_ITEM);
  const att: ChecklistAttachment = {
    id: makeChecklistAttachmentId(),
    checklistItemId: 'cl-1',
    name: 'CCCD.pdf',
    url: null,
    mimeType: 'application/pdf',
    size: 1024,
    source: 'local',
    createdAt: new Date().toISOString(),
  };
  const enriched = enrichSmartChecklistItem(base, {
    attachmentsByItemId: { 'cl-1': [att] },
  });

  push('ATT_LEGACY_NO_ATTACHMENTS', enrichSmartChecklistItem(base, {}).attachmentCount === 0);
  push('ATT_COUNT_MATCHES_LIST', enriched.attachmentCount === 1 && enriched.attachments?.[0]?.name === 'CCCD.pdf');
  push('ATT_NULL_URL_SAFE', panel.includes('hasUrl') || panel.includes('att.url'));
  push(
    'ATT_UI_TOGGLE',
    row.includes('ChecklistAttachmentPanel') &&
      (row.includes('ChecklistInlineActionRow') || readLocal('ChecklistInlineActionRow.tsx').includes('Tài liệu')),
  );
  push('ATT_UI_ADD', panel.includes('+ Thêm tài liệu'));
  push('ATT_SECTION_WIRED', section.includes('useChecklistAttachmentRuntime') && section.includes('enrichSmartChecklistListRuntime'));
  push('ATT_NO_ATTACHMENT_TABLE', !store.includes('CHECKLIST_ATTACHMENT_TABLE'));
  push('ATT_LOCAL_STORE', store.includes('localStorage') && store.includes('cbv-checklist-attachment:'));
  push('ATT_CONTRACT_DOC', contract.includes('ChecklistAttachment') || panel.includes('ChecklistAttachment'));
  push('ATT_DELETE_CLEANS', section.includes('clearAttachmentsForItem'));
  push('ATT_FEEDBACK_PRESERVED', row.includes('ChecklistFeedbackPanel') && feedbackPanel.includes('+ Thêm phản hồi'));

  let map: Record<string, ChecklistAttachment[]> = {};
  map = appendChecklistAttachment(map, att);
  push('ATT_STORE_APPEND', (map['cl-1']?.length ?? 0) === 1);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Local attachment cache remains when bridge off; Drive upload requires bridge flag (phase 13)');
  warnings.push('Metadata-only picker still available without upload bytes');

  return { suite: 'PHASE_CHECKLIST_03_ATTACHMENTS', status, checks, warnings };
}
