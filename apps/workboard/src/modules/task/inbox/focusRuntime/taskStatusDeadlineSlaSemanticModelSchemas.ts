/**
 * TASK status / deadline / SLA semantic summary — UI schema.
 * PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1
 */

export type TaskSemanticType =
  | 'workflow_state'
  | 'deadline_state'
  | 'service_level_state'
  | 'business_priority'
  | 'owner';

export interface TaskStatusSummaryFieldSchema {
  key: string;
  label: string;
  semanticType: TaskSemanticType;
  /** Key on TaskSemanticSummary bag (see resolveTaskStatusSemanticSummary). */
  source: string;
  fallbackSources?: string[];
  icon?: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'danger';
  order: number;
  operatorFacing: boolean;
  emptyPlaceholder?: string;
}

export const TASK_STATUS_SUMMARY_SCHEMA: TaskStatusSummaryFieldSchema[] = [
  {
    key: 'workflow_status',
    label: 'TRẠNG THÁI',
    semanticType: 'workflow_state',
    source: 'workflow_status',
    icon: '🟢',
    tone: 'neutral',
    order: 1,
    operatorFacing: true,
    emptyPlaceholder: 'Chưa xác định',
  },
  {
    key: 'deadline_state',
    label: 'THỜI HẠN',
    semanticType: 'deadline_state',
    source: 'deadline_state',
    fallbackSources: ['deadline_state_label', 'task_due_state'],
    icon: '📅',
    tone: 'neutral',
    order: 2,
    operatorFacing: true,
    emptyPlaceholder: 'Không có hạn',
  },
  {
    key: 'sla_state',
    label: 'SLA',
    semanticType: 'service_level_state',
    source: 'sla_state',
    fallbackSources: ['task_sla_state'],
    icon: '⚡',
    tone: 'ok',
    order: 3,
    operatorFacing: true,
    emptyPlaceholder: 'Không áp dụng',
  },
  {
    key: 'priority_state',
    label: 'ƯU TIÊN',
    semanticType: 'business_priority',
    source: 'priority_state',
    fallbackSources: ['task_priority_label'],
    icon: '⚪',
    tone: 'neutral',
    order: 4,
    operatorFacing: true,
    emptyPlaceholder: 'Bình thường',
  },
  {
    key: 'owner',
    label: 'PHỤ TRÁCH',
    semanticType: 'owner',
    source: 'owner',
    fallbackSources: ['task_owner'],
    icon: '👤',
    tone: 'neutral',
    order: 5,
    operatorFacing: true,
    emptyPlaceholder: 'Chưa phân công',
  },
];
