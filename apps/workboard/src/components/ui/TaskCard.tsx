import type { TaskItem } from '@/api/contracts';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/shared/utils';
import { STATUS_LABELS } from '@/shared/constants';

interface TaskCardProps {
  task: TaskItem;
  selected?: boolean;
  onSelect?: (task: TaskItem) => void;
}

export function TaskCard({ task, selected, onSelect }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(task)}
      className={`panel w-full p-4 text-left transition-colors hover:border-border-soft ${
        selected ? 'border-accent ring-1 ring-accent/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-100">{task.title}</h3>
        <StatusBadge
          status={STATUS_LABELS[task.status] ?? task.status}
          variant={task.isOverdue ? 'overdue' : 'default'}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
        <span>{task.owner || 'Chưa giao'}</span>
        <span>Hạn: {formatDate(task.dueDate)}</span>
        <span>{task.priority}</span>
      </div>
    </button>
  );
}
