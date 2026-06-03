import type { UserContext } from '@/api/contracts';
import {
  TASK_CREATION_AUTOFILL_SCHEMA,
  type TaskCreationAutofillFieldSchema,
} from './taskCreationMinimalInputSchemas';
import type { TaskCreationCatalogContext } from './resolveTaskCreationCatalog';
import {
  resolveDefaultDonViId,
  resolveTaskCreationCatalog,
  resolveTaskTypeLabel,
  resolveUnitLabel,
} from './resolveTaskCreationCatalog';
import type { WorkInboxCreateTaskForm, WorkInboxCreateTaskRequest } from './workInboxCreateTaskTypes';
import { DESCRIPTION_MAX, TITLE_MAX } from './workInboxCreateTaskTypes';
import {
  mapRelatedEntityTypeToDb,
  normalizeRelatedEntityValue,
  validateRelatedEntityInput,
} from './resolveTaskRelatedEntity';

export interface TaskCreationAutofillPreviewRow {
  key: string;
  label: string;
  value: string;
}

export interface TaskCreationBuiltPayload {
  request: WorkInboxCreateTaskRequest;
  resolvedDonViId: string;
  resolvedOwnerId: string;
  autofillPreview: TaskCreationAutofillPreviewRow[];
}

function resolveAutofillValue(
  field: TaskCreationAutofillFieldSchema,
  operator: UserContext,
): string {
  switch (field.strategy) {
    case 'uuid':
      return '(Tự sinh khi lưu)';
    case 'generate_task_code':
      return '(Tự sinh khi lưu)';
    case 'now':
      return new Date().toLocaleString('vi-VN');
    case 'current_user':
      return operator.displayName || operator.userId;
    case 'constant':
      if (field.key === 'STATUS') return 'Mới (NEW)';
      if (field.key === 'PROGRESS_PERCENT') return '0%';
      if (field.value === 'false') return 'Không';
      return field.value ?? '—';
    default:
      return '—';
  }
}

export function buildTaskCreationAutofillPreview(
  operator: UserContext,
  schema = TASK_CREATION_AUTOFILL_SCHEMA,
): TaskCreationAutofillPreviewRow[] {
  return schema
    .filter((f) => f.operatorFacing && !f.technical)
    .sort((a, b) => a.order - b.order)
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: resolveAutofillValue(field, operator),
    }));
}

export function buildTaskCreationPayload(options: {
  form: WorkInboxCreateTaskForm;
  operator: UserContext;
  catalog?: TaskCreationCatalogContext;
  traceId?: string;
}): TaskCreationBuiltPayload {
  const { form, operator, traceId } = options;
  const catalog = options.catalog ?? resolveTaskCreationCatalog(operator);

  const resolvedDonViId =
    form.donViId.trim() ||
    resolveDefaultDonViId(catalog.units, catalog.operatorDonViId) ||
    catalog.operatorDonViId ||
    '';

  const resolvedOwnerId = form.ownerId.trim() || operator.userId;

  const relatedInput = (() => {
    const typeKey = form.relatedEntityType.trim().toUpperCase();
    const value = form.relatedEntityValue.trim();
    if (!typeKey && !value) return {};
    return {
      relatedEntityType: mapRelatedEntityTypeToDb(typeKey),
      relatedEntityId: normalizeRelatedEntityValue(typeKey, value),
    };
  })();

  const request: WorkInboxCreateTaskRequest = {
    traceId,
    actor: operator.displayName,
    actorRole: operator.role,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    taskTypeId: form.taskTypeId.trim() || undefined,
    donViId: resolvedDonViId || undefined,
    ownerId: resolvedOwnerId,
    priority: form.priority,
    dueDate: form.dueDate || undefined,
    relatedEntityType: relatedInput.relatedEntityType,
    relatedEntityId: relatedInput.relatedEntityId,
  };

  const autofillPreview = buildTaskCreationAutofillPreview(operator);
  if (resolvedDonViId) {
    autofillPreview.splice(2, 0, {
      key: 'DON_VI_ID',
      label: 'Đơn vị',
      value: resolveUnitLabel(catalog.units, resolvedDonViId),
    });
  }
  if (form.taskTypeId.trim()) {
    autofillPreview.splice(2, 0, {
      key: 'TASK_TYPE_ID',
      label: 'Loại việc',
      value: resolveTaskTypeLabel(catalog.taskTypes, form.taskTypeId.trim()),
    });
  }

  return { request, resolvedDonViId, resolvedOwnerId, autofillPreview };
}

export function validateTaskCreationInput(
  form: WorkInboxCreateTaskForm,
  catalog: TaskCreationCatalogContext,
): string | null {
  const title = form.title.trim();
  if (!title) return 'Tên việc là bắt buộc';
  if (title.length > TITLE_MAX) return `Tên việc tối đa ${TITLE_MAX} ký tự`;
  if (form.description.trim().length > DESCRIPTION_MAX) return `Mô tả tối đa ${DESCRIPTION_MAX} ký tự`;
  if (form.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) return 'Ngày hạn không hợp lệ';

  if (catalog.taskTypeRequired && !form.taskTypeId.trim()) {
    return 'Vui lòng chọn loại việc';
  }

  if (catalog.unitSelectionRequired && !form.donViId.trim()) {
    return 'Vui lòng chọn đơn vị';
  }

  const relatedErr = validateRelatedEntityInput(form.relatedEntityType, form.relatedEntityValue);
  if (relatedErr) return relatedErr;

  return null;
}

export function initializeCreateTaskForm(operator: UserContext): WorkInboxCreateTaskForm {
  const catalog = resolveTaskCreationCatalog(operator);
  return {
    title: '',
    description: '',
    taskTypeId: catalog.taskTypes.length === 1 ? catalog.taskTypes[0]!.id : '',
    donViId: resolveDefaultDonViId(catalog.units, catalog.operatorDonViId),
    ownerId: operator.userId,
    priority: 'NORMAL',
    dueDate: '',
    relatedEntityType: '',
    relatedEntityValue: '',
  };
}
