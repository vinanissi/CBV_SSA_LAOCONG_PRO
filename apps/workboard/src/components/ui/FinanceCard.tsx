import type { FinanceItem } from '@/api/contracts';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '@/shared/utils';

interface FinanceCardProps {
  item: FinanceItem;
  onSelect?: (item: FinanceItem) => void;
}

export function FinanceCard({ item, onSelect }: FinanceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="panel w-full p-4 text-left transition-colors hover:border-border-soft"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-slate-100">{item.title}</h3>
          <p className="mt-1 text-lg font-semibold text-accent">{formatCurrency(item.amount)}</p>
        </div>
        <StatusBadge status={item.type === 'INCOME' ? 'Thu' : 'Chi'} variant="readonly" />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
        <span>Hạn: {formatDate(item.dueDate)}</span>
        <span>{item.status}</span>
        {item.missingDocuments && <span className="text-status-warn">Thiếu chứng từ</span>}
      </div>
      <p className="mt-2 text-xs text-slate-500">Chỉ xem trong phiên bản này</p>
    </button>
  );
}
