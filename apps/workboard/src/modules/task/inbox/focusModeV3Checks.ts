/**
 * PHASE_UI_CBV_WORK_INBOX_V3 — Phase E Focus Mode V3 checks.
 */

import focusSource from './components/WorkInboxFocusModeV3.tsx?raw';
import panelSource from './WorkInboxGroupsPanel.tsx?raw';
import { mapInboxItemToTaskCardModel, mapTaskToInboxItem } from '@/modules/task/adapters/workInboxAdapter';
import {
  clampFocusIndex,
  mapTaskCardModelsToFocusItems,
} from './focusModeModels';
import type { TaskCardModel } from '@/modules/task/types/workInboxTypes';

export interface FocusModeV3Check {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

function card(overrides: Partial<TaskCardModel> = {}): TaskCardModel {
  return {
    id: 'f1',
    title: 'Gia hạn GPLX',
    status: 'overdue',
    group: 'need_action',
    primaryActionLabel: 'Mở xử lý',
    primaryActionHref: '/inbox/f1',
    ...overrides,
  };
}

export function runFocusModeV3Checks(): { suite: string; status: string; checks: FocusModeV3Check[] } {
  const checks: FocusModeV3Check[] = [];

  checks.push({
    id: 'focusComponentCreated',
    label: 'WorkInboxFocusModeV3 created',
    pass: focusSource.includes('WorkInboxFocusModeV3') && focusSource.includes('Thoát Focus'),
  });

  const items = mapTaskCardModelsToFocusItems([card(), card({ id: 'f2', title: 'B' })]);
  checks.push({
    id: 'mapsCardsToFocusItems',
    label: 'maps cards to focus items',
    pass: items.length === 2 && items[0].progressIndex === 1 && items[1].progressTotal === 2,
    detail: `${items[0].progressIndex}/${items[0].progressTotal}`,
  });

  checks.push({
    id: 'setsProgressCorrectly',
    label: 'sets progress correctly',
    pass: items[1].progressIndex === 2 && items[1].detailHref === '/inbox/f2',
  });

  checks.push({
    id: 'showsEmptyState',
    label: 'shows empty state',
    pass: focusSource.includes('Không có công việc để focus'),
  });

  checks.push({
    id: 'emptyInputSafe',
    label: 'empty input safe',
    pass: mapTaskCardModelsToFocusItems([]).length === 0 && clampFocusIndex(0, 0) === 0,
  });

  checks.push({
    id: 'previousNextBoundsSafe',
    label: 'previous/next bounds safe',
    pass: clampFocusIndex(-5, 3) === 0 && clampFocusIndex(99, 3) === 2,
    detail: `0..2`,
  });

  const completed = mapTaskCardModelsToFocusItems([card({ status: 'completed', group: 'completed' })])[0];
  checks.push({
    id: 'completedDisablesActions',
    label: 'completed item disables complete/forward/pause',
    pass: !completed.canComplete && !completed.canForward && !completed.canPause,
  });

  checks.push({
    id: 'usesTaskCardModelNotSnapshot',
    label: 'focus uses TaskCardModel, not raw snapshot',
    pass:
      panelSource.includes('mapTaskCardModelsToFocusItems') &&
      panelSource.includes('mapInboxGroupBucketToCardModels') &&
      !panelSource.includes('snapshot.tasks'),
  });

  checks.push({
    id: 'singleTaskSurface',
    label: 'shows exactly one task',
    pass: focusSource.includes('const current =') && !focusSource.includes('.map((item)'),
    detail: 'No multi-card map in focus panel',
  });

  checks.push({
    id: 'actionsRuntimeWired',
    label: 'focus actions wired to handlers (not Phase E stub)',
    pass:
      focusSource.includes('onComplete') &&
      focusSource.includes('onPause') &&
      !focusSource.includes('Phase E — hành động chưa kết nối'),
  });

  checks.push({
    id: 'openDetailCallback',
    label: 'Mở xử lý uses onOpenDetail',
    pass: focusSource.includes('onOpenDetail') && panelSource.includes('handleOpenDetail'),
  });

  const fromAdapter = mapTaskCardModelsToFocusItems([
    mapInboxItemToTaskCardModel(mapTaskToInboxItem({ taskId: 'x1', title: 'T', status: 'IN_PROGRESS' })),
  ]);
  checks.push({
    id: 'adapterChain',
    label: 'adapter chain to focus',
    pass: fromAdapter[0]?.primaryActionHref?.includes('/inbox/'),
    detail: fromAdapter[0]?.primaryActionHref,
  });

  const passCount = checks.filter((c) => c.pass).length;
  return {
    suite: 'PHASE_UI_CBV_WORK_INBOX_V3_PHASE_E_FOCUS_MODE_V3',
    status: passCount === checks.length ? 'PASS' : 'FAIL',
    checks,
  };
}
