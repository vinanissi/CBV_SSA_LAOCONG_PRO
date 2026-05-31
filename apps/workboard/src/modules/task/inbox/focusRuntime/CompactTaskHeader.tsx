import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WORK_INBOX_STATUS_CHIP } from '../components/WorkInboxStatusChip';

interface CompactTaskHeaderProps {
  item: WorkInboxFocusItem;
  assignee: string;
  dueLabel: string;
}

export function CompactTaskHeader({ item, assignee, dueLabel }: CompactTaskHeaderProps) {
  const statusConfig = WORK_INBOX_STATUS_CHIP[item.status] ?? WORK_INBOX_STATUS_CHIP.unknown;
  const slaWarn = item.status === 'overdue';

  return (
    <header className="work-inbox-compact-task-header" data-cbv-panel="work-inbox-compact-task-header">
      <h2 className="work-inbox-compact-task-header__title">{item.title}</h2>
      <div className="work-inbox-compact-task-header__badges">
        <span
          className={`work-inbox-compact-task-header__pill work-inbox-compact-task-header__pill--status work-inbox-compact-task-header__pill--${item.status}`}
        >
          {statusConfig.label}
        </span>
        <span
          className={
            slaWarn
              ? 'work-inbox-compact-task-header__pill work-inbox-compact-task-header__pill--sla-warn'
              : 'work-inbox-compact-task-header__pill work-inbox-compact-task-header__pill--sla-ok'
          }
        >
          SLA: {slaWarn ? 'Cảnh báo' : 'OK'}
        </span>
      </div>
      <p className="work-inbox-compact-task-header__meta">
        <span className="work-inbox-compact-task-header__meta-item">
          <span className="work-inbox-compact-task-header__meta-label">Phụ trách</span> {assignee}
        </span>
        <span className="work-inbox-compact-task-header__sep" aria-hidden>
          ·
        </span>
        <span className="work-inbox-compact-task-header__meta-item">
          <span className="work-inbox-compact-task-header__meta-label">Hạn</span> {dueLabel}
        </span>
      </p>
    </header>
  );
}
