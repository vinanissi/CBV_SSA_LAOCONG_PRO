import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WORK_INBOX_STATUS_CHIP } from '../components/WorkInboxStatusChip';

interface QuickContextBadgesProps {
  item: WorkInboxFocusItem;
}

type BadgeVariant = 'need-action' | 'urgent' | 'no-due' | 'sla-ok' | 'open';

interface BadgeDef {
  id: string;
  label: string;
  variant: BadgeVariant;
  active: boolean;
}

export function QuickContextBadges({ item }: QuickContextBadgesProps) {
  const statusConfig = WORK_INBOX_STATUS_CHIP[item.status] ?? WORK_INBOX_STATUS_CHIP.unknown;
  const noDue = !item.dueLabel?.trim();
  const urgent = item.status === 'overdue' || item.priority === 'critical' || item.priority === 'high';
  const needAction = item.group === 'need_action';

  const badges: BadgeDef[] = [
    { id: 'need-action', label: statusConfig.label, variant: 'need-action', active: needAction },
    { id: 'urgent', label: 'Khẩn cấp', variant: 'urgent', active: urgent },
    { id: 'no-due', label: 'Chưa có hạn', variant: 'no-due', active: noDue },
    { id: 'sla', label: 'SLA: OK', variant: 'sla-ok', active: !urgent },
    { id: 'open', label: 'Đang mở', variant: 'open', active: item.status !== 'completed' },
  ];

  return (
    <div className="work-inbox-quick-badges" data-cbv-panel="work-inbox-quick-context-badges">
      {badges.map((b) => (
        <span
          key={b.id}
          className={[
            'work-inbox-quick-badges__chip',
            `work-inbox-quick-badges__chip--${b.variant}`,
            b.active ? 'active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
