/**
 * PHASE_CHECKLIST_04_LINKS — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendChecklistLink, makeChecklistLinkId } from './checklistLinkLocalStore';
import type { ChecklistLink } from './checklistLinkTypes';
import { enrichSmartChecklistItem } from './enrichSmartChecklistRuntime';
import { adaptToSmartChecklistItem } from './adaptToSmartChecklistItem';
import { isValidChecklistLinkUrl } from './checklistLinkUtils';
import type { WorkInboxChecklistItem } from './workInboxChecklistTypes';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

const LEGACY: WorkInboxChecklistItem = {
  checklistId: 'cl-1',
  taskId: 'T-1',
  title: 'Liên hệ xã viên',
  status: 'open',
  sortOrder: 1,
  isDone: false,
};

export function runChecklistLinkRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const row = readLocal('SmartChecklistItemRow.tsx');
  const panel = readLocal('ChecklistLinkPanel.tsx');
  const actionRow = readLocal('ChecklistInlineActionRow.tsx');
  const section = readLocal('WorkInboxChecklistSection.tsx');
  const derive = readLocal('deriveChecklistInlineActions.ts');

  const base = adaptToSmartChecklistItem(LEGACY);
  const validLink: ChecklistLink = {
    id: makeChecklistLinkId(),
    checklistItemId: 'cl-1',
    label: 'Zalo chat',
    url: 'https://zalo.me/example',
    type: 'zalo',
    createdAt: new Date().toISOString(),
  };
  const enriched = enrichSmartChecklistItem(base, {
    linksByItemId: { 'cl-1': [validLink] },
  });

  push('LINK_LEGACY_EMPTY', enrichSmartChecklistItem(base, {}).linkCount === 0);
  push('LINK_COUNT_MATCHES', enriched.linkCount === 1 && enriched.links?.[0]?.label === 'Zalo chat');
  push('LINK_VALID_URL', isValidChecklistLinkUrl('https://example.com'));
  push('LINK_INVALID_URL', !isValidChecklistLinkUrl('not-a-url'));
  push('LINK_UI_CHIP', derive.includes('Liên kết') && actionRow.includes('--link'));
  push('LINK_UI_PANEL', row.includes('ChecklistLinkPanel') && panel.includes('+ Thêm liên kết'));
  push('LINK_INLINE_OPEN', panel.includes('openChecklistLinkUrl'));
  push('LINK_DISABLED_STATE', panel.includes('chưa mở được'));
  push('LINK_SECTION_WIRED', section.includes('useChecklistLinkRuntime'));
  push('LINK_NO_LINK_TABLE', !panel.includes('CHECKLIST_LINK_TABLE'));
  push('LINK_DELETE_CLEANS', section.includes('clearLinksForItem'));
  push('LINK_INLINE_ACTIONS_COUNT', derive.includes('linkAction'));

  let map: Record<string, ChecklistLink[]> = {};
  map = appendChecklistLink(map, validLink);
  push('LINK_STORE_APPEND', (map['cl-1']?.length ?? 0) === 1);

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Links stored in browser localStorage only');
  warnings.push('No URL preview/scraper — open in new tab only when valid https');

  return { suite: 'PHASE_CHECKLIST_04_LINKS', status, checks, warnings };
}
