export type OperationalAlertSeverity = 'risk' | 'warning' | 'passive' | 'ok';

export interface OperationalAlertItem {
  code: string;
  label: string;
  count: number;
  severity: OperationalAlertSeverity;
  detail?: string;
  href?: string;
}

export interface OperationalAlertSummary {
  riskCount: number;
  summaryText: string;
  passiveText?: string;
  allClear: boolean;
  /** GS_10A: true when primary today summary API failed — never show all-clear */
  degraded?: boolean;
  errorDetail?: string;
  items: OperationalAlertItem[];
}

export interface OperationalAlertInput {
  overdueCount: number;
  missingGplxCount: number;
  pendingConfirmCount: number;
  unassignedCount: number;
}

export interface OperationalAlertBuildOptions {
  /** When false, omit unassigned/coordination passive item (e.g. no COORDINATION_VIEW). */
  includeUnassigned?: boolean;
}

function riskShortLabel(item: OperationalAlertItem): string | null {
  if (item.count <= 0) return null;
  switch (item.code) {
    case 'overdue':
      return `${item.count} quá hạn`;
    case 'hoso-gplx':
      return `${item.count} GPLX thiếu`;
    case 'finance-pending':
      return `${item.count} chờ xác nhận`;
    default:
      return item.label;
  }
}

export function buildOperationalAlertSummary(
  input: OperationalAlertInput,
  options?: OperationalAlertBuildOptions,
): OperationalAlertSummary {
  const includeUnassigned = options?.includeUnassigned !== false;

  const items: OperationalAlertItem[] = [
    {
      code: 'overdue',
      label: `${input.overdueCount} việc quá hạn`,
      count: input.overdueCount,
      severity: 'risk',
      href: '/tasks?filter=overdue',
    },
    {
      code: 'hoso-gplx',
      label: `${input.missingGplxCount} hồ sơ thiếu GPLX`,
      count: input.missingGplxCount,
      severity: 'risk',
      href: '/hoso',
    },
    {
      code: 'finance-pending',
      label: `${input.pendingConfirmCount} khoản chờ xác nhận`,
      count: input.pendingConfirmCount,
      severity: 'risk',
      href: '/finance',
    },
  ];

  if (includeUnassigned) {
    items.push({
      code: 'unassigned',
      label: `${input.unassignedCount} việc chưa phân công`,
      count: input.unassignedCount,
      severity: 'passive',
      href: '/coordination',
    });
  }

  const riskItems = items.filter((i) => i.severity === 'risk' && i.count > 0);
  const riskCount = riskItems.length;
  const passiveItem = items.find((i) => i.code === 'unassigned');

  const parts = riskItems
    .map(riskShortLabel)
    .filter((p): p is string => Boolean(p));

  let summaryText: string;
  let allClear: boolean;

  if (riskCount > 0) {
    allClear = false;
    summaryText = `⚠ ${riskCount} vấn đề vận hành · ${parts.join(' · ')}`;
  } else {
    allClear = true;
    summaryText = '✓ Không có vấn đề vận hành quan trọng';
  }

  const passiveText =
    passiveItem && passiveItem.count >= 0
      ? passiveItem.label
      : undefined;

  return {
    riskCount,
    summaryText,
    passiveText,
    allClear,
    items,
  };
}

/** Degraded strip when getTodaySummary fails — no false all-clear. */
export function buildDegradedOperationalAlertSummary(errorDetail?: string): OperationalAlertSummary {
  return {
    riskCount: 0,
    summaryText: '⚠ Không xác minh được cảnh báo vận hành · Dữ liệu có thể chưa đồng bộ',
    allClear: false,
    degraded: true,
    errorDetail: errorDetail,
    items: [],
  };
}
