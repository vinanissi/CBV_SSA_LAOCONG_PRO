import type { FocusProgressRuntime } from './workInboxOperationalTypes';

export function buildFocusProgressRuntime(focusIndex: number, total: number): FocusProgressRuntime {
  const safeTotal = Math.max(total, 1);
  const current = Math.min(Math.max(focusIndex + 1, 1), safeTotal);
  const remaining = Math.max(safeTotal - current, 0);
  const percent = Math.round((current / safeTotal) * 100);
  return {
    currentIndex: current,
    total: safeTotal,
    remaining,
    percent,
    label: `${current} / ${safeTotal}`,
    subLabel: remaining > 0 ? `Còn ${remaining} việc` : 'Hết hàng đợi',
  };
}
