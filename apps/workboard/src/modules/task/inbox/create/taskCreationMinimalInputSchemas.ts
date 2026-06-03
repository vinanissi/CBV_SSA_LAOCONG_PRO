/**
 * Task creation — minimal input / autofill schemas.
 * PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1
 */

export type TaskCreationFieldSection =
  | 'Nội dung việc'
  | 'Phân loại & phân công'
  | 'Hệ thống tự điền';

export interface TaskCreationCatalogItem {
  id: string;
  label: string;
}

export interface TaskCreationInputFieldSchema {
  key: string;
  label: string;
  source: 'input';
  required: boolean;
  section: TaskCreationFieldSection;
  order: number;
  operatorFacing: boolean;
  technical: boolean;
}

export interface TaskCreationAutofillFieldSchema {
  key: string;
  label: string;
  strategy: 'uuid' | 'generate_task_code' | 'now' | 'current_user' | 'constant' | 'derived';
  value?: string;
  operatorFacing: boolean;
  technical: boolean;
  order: number;
}

export interface TaskCreationValidationRule {
  field: string;
  rule: 'required' | 'required_if_catalog' | 'required_if_multiple_units' | 'max_length' | 'date';
  message: string;
}

/** Pilot task-type catalog — extend via config when TASK_TYPE sheet is wired. */
export const TASK_CREATION_TASK_TYPE_CATALOG: TaskCreationCatalogItem[] = [
  { id: 'TT_GENERAL', label: 'Công việc chung' },
  { id: 'TT_OPERATION', label: 'Vận hành' },
];

/** Pilot unit catalog — extend when DON_VI directory is wired to snapshot. */
export const TASK_CREATION_UNIT_CATALOG: TaskCreationCatalogItem[] = [
  { id: 'DV_OPS', label: 'Vận hành' },
  { id: 'DV_FIN', label: 'Tài chính' },
];

export const TASK_CREATION_INPUT_SCHEMA: TaskCreationInputFieldSchema[] = [
  {
    key: 'TITLE',
    label: 'Tên việc',
    source: 'input',
    required: true,
    section: 'Nội dung việc',
    order: 1,
    operatorFacing: true,
    technical: false,
  },
  {
    key: 'DESCRIPTION',
    label: 'Mô tả',
    source: 'input',
    required: false,
    section: 'Nội dung việc',
    order: 2,
    operatorFacing: true,
    technical: false,
  },
  {
    key: 'TASK_TYPE_ID',
    label: 'Loại việc',
    source: 'input',
    required: true,
    section: 'Phân loại & phân công',
    order: 3,
    operatorFacing: true,
    technical: false,
  },
  {
    key: 'DON_VI_ID',
    label: 'Đơn vị',
    source: 'input',
    required: true,
    section: 'Phân loại & phân công',
    order: 4,
    operatorFacing: true,
    technical: false,
  },
  {
    key: 'OWNER_ID',
    label: 'Người phụ trách',
    source: 'input',
    required: false,
    section: 'Phân loại & phân công',
    order: 5,
    operatorFacing: true,
    technical: false,
  },
  {
    key: 'DUE_DATE',
    label: 'Hạn xử lý',
    source: 'input',
    required: false,
    section: 'Phân loại & phân công',
    order: 6,
    operatorFacing: true,
    technical: false,
  },
  {
    key: 'PRIORITY',
    label: 'Ưu tiên',
    source: 'input',
    required: false,
    section: 'Phân loại & phân công',
    order: 7,
    operatorFacing: true,
    technical: false,
  },
];

export const TASK_CREATION_AUTOFILL_SCHEMA: TaskCreationAutofillFieldSchema[] = [
  { key: 'ID', label: 'Mã hệ thống', strategy: 'uuid', operatorFacing: false, technical: true, order: 1 },
  { key: 'TASK_CODE', label: 'Mã việc', strategy: 'generate_task_code', operatorFacing: true, technical: false, order: 2 },
  { key: 'STATUS', label: 'Trạng thái', strategy: 'constant', value: 'NEW', operatorFacing: true, technical: false, order: 3 },
  { key: 'REPORTER_ID', label: 'Người tạo', strategy: 'current_user', operatorFacing: true, technical: false, order: 4 },
  { key: 'CREATED_AT', label: 'Ngày tạo', strategy: 'now', operatorFacing: true, technical: false, order: 5 },
  { key: 'CREATED_BY', label: 'Người tạo (audit)', strategy: 'current_user', operatorFacing: false, technical: true, order: 6 },
  { key: 'UPDATED_AT', label: 'Cập nhật lúc', strategy: 'now', operatorFacing: false, technical: true, order: 7 },
  { key: 'UPDATED_BY', label: 'Cập nhật bởi', strategy: 'current_user', operatorFacing: false, technical: true, order: 8 },
  { key: 'PROGRESS_PERCENT', label: 'Tiến độ', strategy: 'constant', value: '0', operatorFacing: false, technical: true, order: 9 },
  { key: 'IS_PRIVATE', label: 'Riêng tư', strategy: 'constant', value: 'false', operatorFacing: false, technical: true, order: 10 },
  { key: 'IS_STARRED', label: 'Gắn sao', strategy: 'constant', value: 'false', operatorFacing: false, technical: true, order: 11 },
  { key: 'IS_PINNED', label: 'Ghim', strategy: 'constant', value: 'false', operatorFacing: false, technical: true, order: 12 },
  { key: 'IS_DELETED', label: 'Đã xóa', strategy: 'constant', value: 'false', operatorFacing: false, technical: true, order: 13 },
  { key: 'PENDING_ACTION', label: 'Việc chờ', strategy: 'constant', value: '', operatorFacing: false, technical: true, order: 14 },
  { key: 'SHARED_WITH', label: 'Chia sẻ', strategy: 'constant', value: '', operatorFacing: false, technical: true, order: 15 },
  { key: 'START_DATE', label: 'Ngày bắt đầu', strategy: 'constant', value: '', operatorFacing: false, technical: true, order: 16 },
  { key: 'DONE_AT', label: 'Hoàn thành lúc', strategy: 'constant', value: '', operatorFacing: false, technical: true, order: 17 },
  { key: 'RESULT_SUMMARY', label: 'Kết quả', strategy: 'constant', value: '', operatorFacing: false, technical: true, order: 18 },
];

export const TASK_CREATION_VALIDATION_SCHEMA: TaskCreationValidationRule[] = [
  { field: 'TITLE', rule: 'required', message: 'Tên việc là bắt buộc' },
  { field: 'TITLE', rule: 'max_length', message: 'Tên việc quá dài' },
  { field: 'DESCRIPTION', rule: 'max_length', message: 'Mô tả quá dài' },
  { field: 'TASK_TYPE_ID', rule: 'required_if_catalog', message: 'Vui lòng chọn loại việc' },
  { field: 'DON_VI_ID', rule: 'required_if_multiple_units', message: 'Vui lòng chọn đơn vị' },
  { field: 'DUE_DATE', rule: 'date', message: 'Ngày hạn không hợp lệ' },
];
