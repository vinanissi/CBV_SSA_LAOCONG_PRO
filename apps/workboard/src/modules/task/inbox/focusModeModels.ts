import type { TaskCardModel, WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';

/**
 * TaskCardModel[] → WorkInboxFocusItem[] for Focus Mode V3 (single-task queue).
 */
export function mapTaskCardModelsToFocusItems(cards: TaskCardModel[]): WorkInboxFocusItem[] {
  const safe = Array.isArray(cards) ? cards : [];
  const total = safe.length;

  return safe.map((card, index) => {
    const completed = card.status === 'completed';
    return {
      ...card,
      progressIndex: index + 1,
      progressTotal: total,
      detailHref: card.primaryActionHref,
      canComplete: !completed,
      canForward: !completed,
      canPause: !completed,
    };
  });
}

/** Clamp focus index for prev/next navigation. */
export function clampFocusIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, index), total - 1);
}
