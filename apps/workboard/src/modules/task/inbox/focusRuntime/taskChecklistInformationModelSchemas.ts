/**
 * TASK → CHECKLIST information model — UI schema (no DB migration).
 * PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1
 */

export type TaskChecklistFieldSection = 'header' | 'operator_summary' | 'technical' | 'checklist_item';

export interface TaskChecklistFieldSchema {
  key: string;
  label: string;
  /** Dot-path on resolved task view-model (see resolveTaskChecklistFieldValue). */
  source: string;
  fallbackSources?: string[];
  section: TaskChecklistFieldSection;
  order: number;
  operatorFacing: boolean;
  /** When false, hide row/block if value empty. */
  showWhenEmpty?: boolean;
  emptyPlaceholder?: string;
}

export const TASK_HEADER_SCHEMA: TaskChecklistFieldSchema[] = [
  {
    key: 'task_title',
    label: 'Tên việc',
    source: 'task_title',
    section: 'header',
    order: 1,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_description',
    label: 'Mô tả',
    source: 'task_description',
    fallbackSources: ['task_detail_description'],
    section: 'header',
    order: 2,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_context',
    label: 'Thông tin thêm',
    source: 'task_context',
    fallbackSources: ['task_pending_action', 'task_block_reason', 'task_summary'],
    section: 'header',
    order: 3,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_expected_result',
    label: 'Kết quả cần đạt',
    source: 'task_expected_result',
    fallbackSources: ['task_next_step'],
    section: 'header',
    order: 4,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_ai_summary',
    label: 'AI tóm tắt',
    source: 'task_ai_summary',
    section: 'header',
    order: 10,
    operatorFacing: true,
    showWhenEmpty: false,
  },
];

export const OPERATOR_DETAIL_PANEL_SCHEMA: TaskChecklistFieldSchema[] = [
  {
    key: 'task_title',
    label: 'Công việc',
    source: 'task_title',
    section: 'operator_summary',
    order: 1,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_owner',
    label: 'Phụ trách',
    source: 'owner',
    fallbackSources: ['task_owner'],
    section: 'operator_summary',
    order: 2,
    operatorFacing: true,
    showWhenEmpty: false,
    emptyPlaceholder: 'Chưa phân công',
  },
  {
    key: 'task_status',
    label: 'Trạng thái',
    source: 'workflow_status',
    fallbackSources: ['task_status_label'],
    section: 'operator_summary',
    order: 3,
    operatorFacing: true,
    showWhenEmpty: false,
    emptyPlaceholder: 'Chưa xác định',
  },
  {
    key: 'task_due_state',
    label: 'Thời hạn',
    source: 'deadline_state',
    fallbackSources: ['task_due_state', 'deadline_state_label'],
    section: 'operator_summary',
    order: 4,
    operatorFacing: true,
    showWhenEmpty: false,
    emptyPlaceholder: 'Không có hạn',
  },
  {
    key: 'task_sla_state',
    label: 'SLA',
    source: 'sla_state',
    fallbackSources: ['task_sla_state'],
    section: 'operator_summary',
    order: 5,
    operatorFacing: true,
    showWhenEmpty: false,
    emptyPlaceholder: 'Không áp dụng',
  },
  {
    key: 'task_priority',
    label: 'Ưu tiên',
    source: 'priority_state',
    fallbackSources: ['task_priority_label'],
    section: 'operator_summary',
    order: 6,
    operatorFacing: true,
    showWhenEmpty: false,
    emptyPlaceholder: 'Bình thường',
  },
  {
    key: 'task_related_entity',
    label: 'Đối tượng liên quan',
    source: 'task_related_entity_display',
    section: 'operator_summary',
    order: 7,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_queue_progress',
    label: 'Tiến độ',
    source: 'task_queue_progress',
    section: 'operator_summary',
    order: 8,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_related_dossier',
    label: 'Hồ sơ liên quan',
    source: 'task_related_dossier',
    section: 'operator_summary',
    order: 9,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_unit',
    label: 'Đơn vị',
    source: 'task_unit',
    section: 'operator_summary',
    order: 20,
    operatorFacing: true,
    showWhenEmpty: true,
    emptyPlaceholder: 'Chưa xác định',
  },
  {
    key: 'task_module',
    label: 'Loại việc',
    source: 'task_module_label',
    section: 'operator_summary',
    order: 21,
    operatorFacing: true,
    showWhenEmpty: false,
  },
];

/** Checklist item display keys — mapped in SmartChecklistItemRow (existing runtime). */
export const CHECKLIST_ITEM_SCHEMA: TaskChecklistFieldSchema[] = [
  { key: 'checklist_item_title', label: 'Bước', source: 'title', section: 'checklist_item', order: 1, operatorFacing: true },
  { key: 'checklist_item_status', label: 'Trạng thái', source: 'status', section: 'checklist_item', order: 2, operatorFacing: true },
  { key: 'checklist_item_focus_state', label: 'Focus', source: 'focus_state', section: 'checklist_item', order: 3, operatorFacing: true },
  { key: 'checklist_item_feedback_count', label: 'Phản hồi', source: 'feedback_count', section: 'checklist_item', order: 4, operatorFacing: true },
  { key: 'checklist_item_attachment_count', label: 'Tài liệu', source: 'attachment_count', section: 'checklist_item', order: 5, operatorFacing: true },
  { key: 'checklist_item_link_count', label: 'Liên kết', source: 'link_count', section: 'checklist_item', order: 6, operatorFacing: true },
  { key: 'checklist_item_history_count', label: 'Lịch sử', source: 'history_count', section: 'checklist_item', order: 7, operatorFacing: true },
  { key: 'checklist_item_note', label: 'Ghi chú bước', source: 'note', section: 'checklist_item', order: 8, operatorFacing: true },
];

export const TASK_DETAIL_SCHEMA = {
  taskHeader: TASK_HEADER_SCHEMA,
  operatorDetailPanel: OPERATOR_DETAIL_PANEL_SCHEMA,
  checklistItem: CHECKLIST_ITEM_SCHEMA,
} as const;
