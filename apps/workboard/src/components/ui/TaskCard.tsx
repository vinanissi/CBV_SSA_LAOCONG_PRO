import type { TaskItem } from '@/api/contracts';
import { formatDate } from '@/shared/utils';
import {
  extractTaskSubtitle,
  getPriorityStyle,
  getSlaLabel,
  getStatusLabel,
} from '@/shared/utils/taskDisplay';

interface TaskCardProps {
  task: TaskItem;
  selected?: boolean;
  onOpen?: (task: TaskItem) => void;
  onTimeline?: (task: TaskItem) => void;
  onHoSo?: (task: TaskItem) => void;
  /** @deprecated use onOpen */
  onSelect?: (task: TaskItem) => void;
}

export function TaskCard({
  task,
  selected,
  onOpen,
  onTimeline,
  onHoSo,
  onSelect,
}: TaskCardProps) {
  const priority = getPriorityStyle(task.priority, task.status);
  const sla = getSlaLabel(task);
  const subtitle = extractTaskSubtitle(task.title);
  const openHandler = onOpen ?? onSelect;

  return (
    <article
      className={`panel w-full p-4 transition-colors hover:border-border-soft ${
        selected ? 'border-accent ring-1 ring-accent/25' : ''
      } ${task.isOverdue ? 'border-l-4 border-l-priority-urgent/70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${priority.className}`}
        >
          {priority.label}
        </span>
        {sla && (
          <span
            className={`text-xs font-medium ${task.isOverdue ? 'text-red-300' : 'text-amber-200/90'}`}
          >
            ⚠ {sla}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-50">{task.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
        <span>{getStatusLabel(task.status)}</span>
        <span>Hạn {formatDate(task.dueDate)}</span>
      </div>

      <p className="mt-2 text-sm text-slate-300">
        <span className="text-slate-500">Phụ trách:</span> {task.owner || 'Chưa giao'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-3">
        <button
          type="button"
          className="btn-card-action"
          onClick={() => openHandler?.(task)}
        >
          Mở
        </button>
        <button
          type="button"
          className="btn-card-action"
          onClick={() => (onTimeline ?? openHandler)?.(task)}
        >
          Timeline
        </button>
        <button
          type="button"
          className="btn-card-action"
          onClick={() => (onHoSo ?? (() => {}))(task)}
        >
          Hồ sơ
        </button>
      </div>
    </article>
  );
}
