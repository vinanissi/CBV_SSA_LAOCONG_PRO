import type { HoSoItem } from '@/api/contracts';
import { StatusBadge } from './StatusBadge';

interface HoSoCardProps {
  item: HoSoItem;
  onSelect?: (item: HoSoItem) => void;
}

export function HoSoCard({ item, onSelect }: HoSoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="panel w-full p-4 text-left transition-colors hover:border-border-soft"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-slate-100">{item.personName}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {item.vehiclePlate} · {item.phone}
          </p>
        </div>
        <StatusBadge status={`${item.documentCompleteness}%`} variant="readonly" />
      </div>
      {item.missingDocuments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.missingDocuments.map((doc) => (
            <span key={doc} className="rounded bg-status-warn/15 px-2 py-0.5 text-xs text-status-warn">
              Thiếu {doc}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
