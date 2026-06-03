/**
 * PHASE_CHECKLIST_03B_INLINE_ACTIONS — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveChecklistInlineActions } from './deriveChecklistInlineActions';
import { enrichSmartChecklistWithInlineActions } from './enrichSmartChecklistWithInlineActions';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

const LEGACY: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Gọi xã viên',
  status: 'open',
  sortOrder: 1,
  isDone: false,
};

export function runChecklistInlineActionChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const row = readLocal('SmartChecklistItemRow.tsx');
  const actionRow = readLocal('ChecklistInlineActionRow.tsx');
  const preview = readLocal('ChecklistItemLatestPreview.tsx');
  const feedbackPanel = readLocal('ChecklistFeedbackPanel.tsx');
  const attachPanel = readLocal('ChecklistAttachmentPanel.tsx');

  const base = adaptToSmartChecklistItem(LEGACY);
  const enriched = enrichSmartChecklistWithInlineActions(base, true);
  const actions = deriveChecklistInlineActions(base, true);

  push('INLINE_ACTIONS_DERIVED', (enriched.inlineActions?.length ?? 0) >= 4);
  push('INLINE_ACTION_ROW_UI', row.includes('ChecklistInlineActionRow') && actionRow.includes('inline-actions__chip'));
  push('INLINE_ONE_CLICK_COMPOSE', feedbackPanel.includes('autoCompose') && attachPanel.includes('autoCompose'));
  push('INLINE_LATEST_PREVIEW', row.includes('ChecklistItemLatestPreview') && preview.includes('Mới nhất'));
  push('INLINE_OPENS_FEEDBACK_PANEL', row.includes('ChecklistFeedbackPanel') && row.includes('handleFeedbackAction'));
  push('INLINE_OPENS_ATTACHMENT_PANEL', row.includes('ChecklistAttachmentPanel') && row.includes('handleAttachmentAction'));
  push('INLINE_NO_ACTION_TABLE', !row.includes('CHECKLIST_ACTION_TABLE'));
  push('INLINE_NO_WORKFLOW', !row.includes('workflowEngine') && !actionRow.includes('agentRuntime'));
  push('INLINE_FEEDBACK_PRESERVED', feedbackPanel.includes('+ Thêm phản hồi'));
  push('INLINE_ATTACHMENT_PRESERVED', attachPanel.includes('+ Thêm tài liệu'));
  push('INLINE_LEGACY_SAFE', actions.every((a) => a.enabled) && enriched.responseCount === 0);
  push(
    'INLINE_LINK_CHIP',
    readLocal('deriveChecklistInlineActions.ts').includes('linkAction') &&
      readLocal('ChecklistInlineActionRow.tsx').includes('--link'),
  );
  push(
    'INLINE_HISTORY_CHIP',
    readLocal('deriveChecklistInlineActions.ts').includes('historyAction') &&
      readLocal('ChecklistInlineActionRow.tsx').includes('--history'),
  );

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Inline actions are UI-only; no persistence or workflow engine');
  warnings.push('Manual browser one-click UX verification recommended');

  return { suite: 'PHASE_CHECKLIST_03B_INLINE_ACTIONS', status, checks, warnings };
}
