import type { InboxStatus } from '@/modules/task/types/workInboxTypes';

export interface WorkInboxStatusChipConfig {
  emoji: string;
  label: string;
  className: string;
}

export const WORK_INBOX_STATUS_CHIP: Record<InboxStatus, WorkInboxStatusChipConfig> = {
  overdue: { emoji: '🔴', label: 'Quá hạn', className: 'work-inbox-status-chip--overdue' },
  today: { emoji: '🟠', label: 'Hôm nay', className: 'work-inbox-status-chip--today' },
  waiting: { emoji: '🟡', label: 'Chờ xử lý', className: 'work-inbox-status-chip--waiting' },
  follow_up: { emoji: '🔵', label: 'Theo dõi', className: 'work-inbox-status-chip--follow_up' },
  completed: { emoji: '🟢', label: 'Hoàn thành', className: 'work-inbox-status-chip--completed' },
  unknown: { emoji: '⚪', label: 'Chưa xác định', className: 'work-inbox-status-chip--unknown' },
};

interface WorkInboxStatusChipProps {
  status: InboxStatus;
}

export function WorkInboxStatusChip({ status }: WorkInboxStatusChipProps) {
  const config = WORK_INBOX_STATUS_CHIP[status] ?? WORK_INBOX_STATUS_CHIP.unknown;
  return (
    <span
      className={`work-inbox-status-chip inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${config.className}`}
      data-inbox-status={status}
    >
      <span aria-hidden>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
