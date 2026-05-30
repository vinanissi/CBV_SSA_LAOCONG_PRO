/**
 * PHASE_UI_CBV_WORK_INBOX_V3 — Phase D Task Card V3 checks.
 */

import cardSource from './components/WorkInboxTaskCardV3.tsx?raw';
import chipSource from './components/WorkInboxStatusChip.tsx?raw';
import panelSource from './WorkInboxGroupsPanel.tsx?raw';
import { mapInboxItemToTaskCardModel, mapTaskToInboxItem } from '@/modules/task/adapters/workInboxAdapter';
import { mapInboxGroupBucketToCardModels } from './inboxCardModels';
import type { InboxItem } from '@/modules/task/types/workInboxTypes';

export interface TaskCardV3Check {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function baseItem(overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id: 't-card-1',
    title: 'Gia hạn GPLX',
    group: 'need_action',
    status: 'overdue',
    module: 'TASK',
    assigneeName: 'Operation 1',
    dueLabel: 'Quá hạn',
    primaryActionLabel: 'Mở xử lý',
    primaryActionHref: '/inbox/t-card-1',
    ...overrides,
  };
}

export function runTaskCardV3Checks(): { suite: string; status: string; checks: TaskCardV3Check[] } {
  const checks: TaskCardV3Check[] = [];

  checks.push({
    id: 'componentExists',
    label: 'WorkInboxTaskCardV3 created',
    pass: cardSource.includes('WorkInboxTaskCardV3') && cardSource.includes('TaskCardModel'),
  });

  checks.push({
    id: 'rendersTitle',
    label: 'renders title',
    pass: cardSource.includes('model.title'),
  });

  checks.push({
    id: 'rendersStatus',
    label: 'renders status',
    pass: cardSource.includes('WorkInboxStatusChip') && chipSource.includes('Quá hạn'),
  });

  checks.push({
    id: 'rendersAssignee',
    label: 'renders assignee',
    pass: cardSource.includes('assigneeName') && cardSource.includes('👤'),
  });

  checks.push({
    id: 'rendersAction',
    label: 'renders action',
    pass: cardSource.includes('primaryActionLabel') && cardSource.includes('onPrimaryAction'),
  });

  const noAssignee = mapInboxItemToTaskCardModel(baseItem({ assigneeName: undefined }));
  checks.push({
    id: 'handlesMissingAssignee',
    label: 'handles missing assignee',
    pass: !noAssignee.assigneeName,
    detail: 'Card uses fallback label at render',
  });

  const noDue = mapInboxItemToTaskCardModel(baseItem({ dueLabel: undefined }));
  checks.push({
    id: 'handlesMissingDueLabel',
    label: 'handles missing dueLabel',
    pass: !noDue.dueLabel,
  });

  const unknown = mapInboxItemToTaskCardModel(
    mapTaskToInboxItem({ taskId: 'u1', status: 'CUSTOM', title: 'X' }),
  );
  checks.push({
    id: 'handlesUnknownStatus',
    label: 'handles unknown status',
    pass: unknown.status === 'unknown',
    detail: unknown.status,
  });

  const emptyCard = mapInboxItemToTaskCardModel(mapTaskToInboxItem({}));
  checks.push({
    id: 'handlesEmptyData',
    label: 'handles empty data',
    pass: Boolean(emptyCard.id) && Boolean(emptyCard.title) && Boolean(emptyCard.primaryActionHref),
    detail: emptyCard.id,
  });

  checks.push({
    id: 'usesAdapterOutput',
    label: 'uses adapter output',
    pass:
      panelSource.includes('mapTasksToInboxItems') &&
      panelSource.includes('mapInboxGroupBucketToCardModels') &&
      !panelSource.includes('task.title'),
  });

  const bucket = {
    key: 'need_action' as const,
    label: '🔥 Cần làm ngay',
    items: [baseItem(), baseItem({ id: 't2', title: 'B' })],
  };
  const cards = mapInboxGroupBucketToCardModels(bucket, 5);
  checks.push({
    id: 'groupPanelCardModels',
    label: 'group panel uses TaskCardModel[]',
    pass: cards.length === 2 && cards[0].title === 'Gia hạn GPLX',
    detail: cards.map((c) => c.id).join(', '),
  });

  checks.push({
    id: 'primaryHrefInbox',
    label: 'primary action href /inbox/:id',
    pass: cards[0].primaryActionHref.startsWith('/inbox/'),
    detail: cards[0].primaryActionHref,
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_PHASE_D_TASK_CARD_V3',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
