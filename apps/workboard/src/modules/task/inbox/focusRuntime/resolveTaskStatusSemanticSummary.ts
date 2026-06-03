import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { InboxStatus, WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { STATUS_LABELS } from '@/shared/constants';
import {
  TASK_STATUS_SUMMARY_SCHEMA,
  type TaskStatusSummaryFieldSchema,
} from './taskStatusDeadlineSlaSemanticModelSchemas';

export type TaskSemanticSummaryBag = Record<string, string | undefined>;

const DEADLINE_INBOX_STATUSES: InboxStatus[] = ['today', 'overdue'];

function normalizeWorkflowKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '_');
}

function mapWorkflowStatusFromApi(statusRaw?: string | null): string | undefined {
  if (!statusRaw?.trim()) return undefined;
  const key = normalizeWorkflowKey(statusRaw);
  if (STATUS_LABELS[key]) return STATUS_LABELS[key];
  const norm = statusRaw.trim().toLowerCase();
  if (/in.?progress|dang (lam|xu ly)/.test(norm)) return 'Đang xử lý';
  if (/new|moi/.test(norm)) return 'Mới tạo';
  if (/wait|cho/.test(norm)) return 'Chờ phản hồi';
  if (/pause|tam dung/.test(norm)) return 'Tạm dừng';
  if (/done|complete|hoan thanh/.test(norm)) return 'Hoàn thành';
  if (/cancel|huy/.test(norm)) return 'Đã hủy';
  return statusRaw.trim();
}

function mapWorkflowFromInboxStatus(status: InboxStatus): string | undefined {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'waiting':
      return 'Chờ xử lý';
    case 'follow_up':
      return 'Theo dõi';
    case 'today':
    case 'overdue':
      return undefined;
    case 'unknown':
      return 'Chưa xác định';
    default:
      return undefined;
  }
}

function normalizeDeadlineLabel(dueLabel?: string, status?: InboxStatus): string {
  const label = dueLabel?.trim();
  if (label) {
    if (/qua han/i.test(label)) return 'Quá hạn';
    if (/hom nay|hôm nay/i.test(label)) return 'Hôm nay';
    if (/chua co han|khong co han/i.test(label)) return 'Không có hạn';
    if (label.startsWith('Hạn:')) return label.replace(/^Hạn:\s*/i, '').trim() || label;
    return label;
  }
  if (status === 'overdue') return 'Quá hạn';
  if (status === 'today') return 'Hôm nay';
  return 'Không có hạn';
}

function mapSlaState(options: {
  taskDetail?: TaskDetail | null;
  runtimeTask?: TaskItem;
  inboxStatus: InboxStatus;
}): string {
  const { taskDetail, runtimeTask, inboxStatus } = options;
  const raw = taskDetail?.slaStatus?.trim();
  if (raw) {
    const norm = raw.toLowerCase();
    if (/ok|pass|dat|đạt|green/.test(norm)) return 'Đạt';
    if (/warn|cảnh báo|amber|yellow/.test(norm)) return 'Cảnh báo';
    if (/fail|vi phạm|breach|red|overdue/.test(norm)) return 'Vi phạm';
    if (/n\/a|na|khong ap dung/.test(norm)) return 'Không áp dụng';
    return raw;
  }
  if (runtimeTask?.urgency?.isOverdue || inboxStatus === 'overdue') return 'Vi phạm';
  if (runtimeTask?.urgency?.isWaiting) return 'Cảnh báo';
  return 'Đạt';
}

function mapPriorityState(priority?: string): string {
  if (!priority?.trim()) return 'Bình thường';
  const map: Record<string, string> = {
    low: 'Thấp',
    normal: 'Bình thường',
    high: 'Quan trọng',
    critical: 'Khẩn cấp',
    LOW: 'Thấp',
    NORMAL: 'Bình thường',
    HIGH: 'Quan trọng',
    CRITICAL: 'Khẩn cấp',
  };
  return map[priority] ?? priority;
}

function mapOwnerName(options: {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  assigneeFallback?: string;
}): string {
  const name =
    options.item.assigneeName?.trim() ||
    options.taskDetail?.displayAssigneeName?.trim() ||
    options.runtimeTask?.displayAssigneeName?.trim() ||
    options.runtimeTask?.assignedToDisplayName?.trim() ||
    options.assigneeFallback?.trim() ||
  '';
  return name || 'Chưa phân công';
}

export function buildTaskSemanticSummaryBag(options: {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  assigneeFallback?: string;
}): TaskSemanticSummaryBag {
  const { item, runtimeTask, taskDetail, assigneeFallback } = options;

  const workflowFromApi = mapWorkflowStatusFromApi(runtimeTask?.status ?? taskDetail?.status);
  const workflowResolved = workflowFromApi
    ? workflowFromApi
    : DEADLINE_INBOX_STATUSES.includes(item.status)
      ? 'Đang xử lý'
      : mapWorkflowFromInboxStatus(item.status) ?? 'Chưa xác định';

  const deadline_state = normalizeDeadlineLabel(item.dueLabel, item.status);
  const sla_state = mapSlaState({ taskDetail, runtimeTask, inboxStatus: item.status });
  const priority_state = mapPriorityState(item.priority ?? runtimeTask?.priority);
  const owner = mapOwnerName({ item, runtimeTask, taskDetail, assigneeFallback });

  return {
    workflow_status: workflowResolved,
    deadline_state,
    deadline_state_label: deadline_state,
    sla_state,
    priority_state,
    owner,
    task_due_state: deadline_state,
    task_sla_state: sla_state,
    task_priority_label: priority_state,
    task_owner: owner,
    task_status_label: workflowResolved,
  };
}

export interface ResolvedTaskStatusSummaryRow {
  key: string;
  label: string;
  semanticType: TaskStatusSummaryFieldSchema['semanticType'];
  value: string;
  icon?: string;
  tone?: TaskStatusSummaryFieldSchema['tone'];
}

export function resolveTaskStatusSummaryRows(
  bag: TaskSemanticSummaryBag,
  schema: TaskStatusSummaryFieldSchema[] = TASK_STATUS_SUMMARY_SCHEMA,
): ResolvedTaskStatusSummaryRow[] {
  const sorted = [...schema].sort((a, b) => a.order - b.order);
  const rows: ResolvedTaskStatusSummaryRow[] = [];

  for (const field of sorted) {
    let value = bag[field.source]?.trim();
    if (!value) {
      for (const fb of field.fallbackSources ?? []) {
        const v = bag[fb]?.trim();
        if (v) {
          value = v;
          break;
        }
      }
    }
    if (!value && field.emptyPlaceholder) value = field.emptyPlaceholder;
    if (!value) continue;

    rows.push({
      key: field.key,
      label: field.label,
      semanticType: field.semanticType,
      value,
      icon: field.icon,
      tone: field.tone,
    });
  }

  return rows;
}
