/**
 * Task header context — UI schema (no DB migration).
 * PHASE_TASK_HEADER_CONTEXT_ENRICHMENT_V1
 */

export type TaskHeaderContextSection = 'header' | 'context' | 'summary' | 'semantic';

export interface TaskHeaderContextFieldSchema {
  key: string;
  label: string;
  source: string;
  fallbackSources?: string[];
  section: TaskHeaderContextSection;
  order: number;
  operatorFacing: boolean;
  required?: boolean;
  showWhenEmpty?: boolean;
  emptyPlaceholder?: string;
}

export const TASK_HEADER_CONTEXT_SCHEMA: TaskHeaderContextFieldSchema[] = [
  {
    key: 'task_title',
    label: 'Tên việc',
    source: 'task_title',
    section: 'header',
    order: 1,
    operatorFacing: true,
    required: true,
  },
  {
    key: 'task_description',
    label: 'MÔ TẢ',
    source: 'task_description',
    fallbackSources: ['task_detail_description'],
    section: 'context',
    order: 2,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_context',
    label: 'THÔNG TIN THÊM',
    source: 'task_context',
    fallbackSources: ['task_pending_action', 'task_block_reason'],
    section: 'context',
    order: 3,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_expected_result',
    label: 'KẾT QUẢ CẦN ĐẠT',
    source: 'task_expected_result',
    fallbackSources: ['task_next_step'],
    section: 'context',
    order: 4,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_related_entity',
    label: 'ĐỐI TƯỢNG LIÊN QUAN',
    source: 'task_related_entity_display',
    section: 'context',
    order: 5,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'task_ai_summary',
    label: 'TÓM TẮT AI',
    source: 'task_ai_summary',
    section: 'summary',
    order: 6,
    operatorFacing: true,
    showWhenEmpty: false,
  },
  {
    key: 'semantic_status_summary',
    label: 'Trạng thái',
    source: 'semantic_status_summary',
    section: 'semantic',
    order: 7,
    operatorFacing: true,
  },
];
