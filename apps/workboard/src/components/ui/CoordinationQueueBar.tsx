import { COORDINATION_QUEUES, type CoordinationQueueMode } from '@/shared/utils/coordinationQueues';

interface CoordinationQueueBarProps {
  mode: CoordinationQueueMode;
  onChange: (mode: CoordinationQueueMode) => void;
}

export function CoordinationQueueBar({ mode, onChange }: CoordinationQueueBarProps) {
  return (
    <div className="coordination-queue-bar">
      <span className="mr-1 text-[10px] uppercase text-slate-600">Coordination:</span>
      {COORDINATION_QUEUES.map((q) => (
        <button
          key={q.key}
          type="button"
          onClick={() => onChange(q.key)}
          className={mode === q.key ? 'btn-primary !px-2 !py-1 text-xs' : 'btn-ghost !px-2 !py-1 text-xs'}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
