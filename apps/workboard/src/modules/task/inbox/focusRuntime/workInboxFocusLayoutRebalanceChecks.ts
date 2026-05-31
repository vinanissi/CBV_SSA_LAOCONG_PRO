/**
 * PHASE_WORK_INBOX_FOCUS_LAYOUT_RIGHT_PANEL_REBALANCE — static layout checks.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runWorkInboxFocusLayoutRebalanceChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const cards = readLocal('FocusContentCards.tsx');
  const right = readLocal('RightContextTabs.tsx');
  const shared = readLocal('focusLayoutShared.ts');
  const workspace = readLocal('FocusTaskWorkspace.tsx');

  push('MAIN_NO_RELATED_CARD', !cards.includes('THÔNG TIN LIÊN QUAN') && cards.includes('--stack'));
  push('MAIN_NO_TIMELINE_PREVIEW', !cards.includes('TimelinePreviewCard') && !cards.includes('TIMELINE PREVIEW'));
  push('MAIN_NO_HANDOFF_PREVIEW', !cards.includes('HandoffPreviewCard') && !cards.includes('HANDOFF PREVIEW'));
  push('MAIN_HAS_OPERATIONAL_BLOCKS', cards.includes('AI TÓM TẮT') && cards.includes('WorkInboxChecklistSection'));
  push('MAIN_HAS_ATTACHMENTS_PREVIEW', cards.includes('WorkInboxAttachmentsSection'));
  push('MAIN_HAS_NEXT_TASK', workspace.includes('NextTaskCard'));
  push('RIGHT_DETAIL_RELATED_INFO', right.includes('THÔNG TIN LIÊN QUAN') && right.includes('buildFocusRelatedInfoRows'));
  push('RIGHT_TIMELINE_FRIENDLY', right.includes('formatFocusTimelineFriendlyLabel') && right.includes('formatFocusTimelineClock'));
  push('RIGHT_HANDOFF_EMPTY_STATE', right.includes('Chưa có bàn giao cho việc này'));
  push('RIGHT_HANDOFF_DETAIL_LINK', right.includes('Xem chi tiết Handoff'));
  push('RIGHT_NOTES_PRESERVED', right.includes('Lưu ghi chú') && right.includes('onSaveNote'));
  push('RIGHT_ATTACHMENTS_TAB', right.includes("activeTab === 'documents'") && right.includes('variant="panel"'));
  push('NO_NEW_FETCH_IN_LAYOUT', !cards.includes('api.') && !right.includes('script.google.com'));
  push('SHARED_TIMELINE_MAP', shared.includes('TIMELINE_EVENT_VI') && shared.includes('TASK_HANDOFF'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO';

  if (status !== 'FAIL') {
    warnings.push('Manual Focus Mode visual verification recommended');
  }

  return { suite: 'PHASE_WORK_INBOX_FOCUS_LAYOUT_RIGHT_PANEL_REBALANCE', status, checks, warnings };
}
