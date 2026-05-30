import type { WorkInboxKpiMetrics } from '@/modules/task/inbox/workInboxKpi';

const KPI_CELLS: { key: keyof WorkInboxKpiMetrics; label: string }[] = [
  { key: 'total', label: 'Việc' },
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'open', label: 'Đang mở' },
  { key: 'alerts', label: 'Cảnh báo' },
];

interface WorkInboxKpiStripProps {
  metrics: WorkInboxKpiMetrics;
  loading?: boolean;
  /** Single-line dashboard for Focus Runtime (no 4-cell grid). */
  variant?: 'grid' | 'compact-line';
}

export function WorkInboxKpiStrip({ metrics, loading, variant = 'grid' }: WorkInboxKpiStripProps) {
  if (variant === 'compact-line') {
    return (
      <div
        className="work-inbox-kpi-strip work-inbox-kpi-strip--line flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md border border-border/50 bg-surface-raised/60 px-3 py-1.5 text-xs"
        role="region"
        aria-label="Tóm tắt hộp việc"
        data-cbv-panel="work-inbox-kpi"
      >
        {KPI_CELLS.map(({ key, label }, i) => (
          <span key={key} className="inline-flex items-center gap-1 text-operational-secondary">
            {i > 0 && <span className="text-operational-muted" aria-hidden>·</span>}
            <span className="font-medium text-operational-muted">{label}</span>
            <span className="font-bold tabular-nums text-operational-text">
              {loading ? '—' : metrics[key]}
            </span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="work-inbox-kpi-strip grid grid-cols-4 gap-1.5 rounded-lg border border-border/60 bg-surface-raised/80 p-1.5"
      role="region"
      aria-label="Tóm tắt hộp việc"
      data-cbv-panel="work-inbox-kpi"
    >
      {KPI_CELLS.map(({ key, label }) => (
        <div
          key={key}
          className="work-inbox-kpi-cell rounded-md bg-surface-content px-2 py-1.5 text-center"
        >
          <div className="text-lg font-bold tabular-nums leading-tight text-operational-text">
            {loading ? '—' : metrics[key]}
          </div>
          <div className="text-[10px] font-medium text-operational-muted">{label}</div>
        </div>
      ))}
    </div>
  );
}
