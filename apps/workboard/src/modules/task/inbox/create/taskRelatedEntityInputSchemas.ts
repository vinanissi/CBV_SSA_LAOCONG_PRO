/**
 * Task related entity — input/display schemas.
 * PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1
 */

export type TaskRelatedEntityValidation =
  | 'phone_optional'
  | 'license_plate_optional'
  | 'text_optional';

export interface TaskRelatedEntityTypeCatalogItem {
  key: string;
  label: string;
  inputPlaceholder: string;
  validation: TaskRelatedEntityValidation;
  /** DB/API RELATED_ENTITY_TYPE value when different from key. */
  dbType?: string;
  order: number;
}

export const TASK_RELATED_ENTITY_TYPE_CATALOG: TaskRelatedEntityTypeCatalogItem[] = [
  {
    key: 'PHONE',
    label: 'SĐT',
    inputPlaceholder: 'Nhập số điện thoại',
    validation: 'phone_optional',
    order: 1,
  },
  {
    key: 'LICENSE_PLATE',
    label: 'Biển số',
    inputPlaceholder: 'Nhập biển số xe',
    validation: 'license_plate_optional',
    order: 2,
  },
  {
    key: 'MEMBER',
    label: 'Xã viên',
    inputPlaceholder: 'Nhập mã/tên xã viên',
    validation: 'text_optional',
    dbType: 'XA_VIEN',
    order: 3,
  },
  {
    key: 'DOSSIER',
    label: 'Hồ sơ',
    inputPlaceholder: 'Nhập mã hồ sơ',
    validation: 'text_optional',
    dbType: 'HO_SO',
    order: 4,
  },
  {
    key: 'OTHER',
    label: 'Khác',
    inputPlaceholder: 'Nhập thông tin liên quan',
    validation: 'text_optional',
    order: 99,
  },
];

export interface TaskRelatedEntityInputFieldSchema {
  key: string;
  label: string;
  source: string;
  section: 'Đối tượng liên quan';
  order: number;
  operatorFacing: boolean;
  required: boolean;
}

export const TASK_CREATION_RELATED_ENTITY_INPUT_SCHEMA: TaskRelatedEntityInputFieldSchema[] = [
  {
    key: 'relatedEntityType',
    label: 'Loại đối tượng',
    source: 'relatedEntityType',
    section: 'Đối tượng liên quan',
    order: 1,
    operatorFacing: true,
    required: false,
  },
  {
    key: 'relatedEntityValue',
    label: 'Giá trị',
    source: 'relatedEntityValue',
    section: 'Đối tượng liên quan',
    order: 2,
    operatorFacing: true,
    required: false,
  },
];

export const TASK_RELATED_ENTITY_SCHEMA = {
  typeCatalog: TASK_RELATED_ENTITY_TYPE_CATALOG,
  creationInput: TASK_CREATION_RELATED_ENTITY_INPUT_SCHEMA,
  displayLabel: 'ĐỐI TƯỢNG LIÊN QUAN',
} as const;
