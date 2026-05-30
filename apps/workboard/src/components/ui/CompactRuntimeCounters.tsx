import type { TaskWorkspaceCounts } from '@/api/contracts';

interface CompactRuntimeCountersProps {
  counts: TaskWorkspaceCounts;
}

export function CompactRuntimeCounters({ counts }: CompactRuntimeCountersProps) {
  const items = [
    { label: 'Tổng', value: counts.total },
    { label: 'Mở', value: counts.open },
    { label: 'Xử lý', value: counts.inProgress },
    { label: 'Kẹt', value: counts.blocked },
    { label: 'Quá hạn', value: counts.overdue },
    { label: 'Hôm nay', value: counts.dueToday },
  ];

  return (
    <div className="runtime-counter-strip" role="status" aria-label="Thống kê task runtime">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mr-3 text-slate-700">·</span>}
          {item.label} <strong>{item.value}</strong>
        </span>
      ))}
    </div>
  );
}
