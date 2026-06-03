import type { UserContext } from '@/api/contracts';
import { resolveRuntimeUser } from '@/runtime/runtimeIdentity';
import {
  TASK_CREATION_TASK_TYPE_CATALOG,
  TASK_CREATION_UNIT_CATALOG,
  type TaskCreationCatalogItem,
} from './taskCreationMinimalInputSchemas';

export interface TaskCreationCatalogContext {
  taskTypes: TaskCreationCatalogItem[];
  units: TaskCreationCatalogItem[];
  operatorDonViId?: string;
  unitSelectionRequired: boolean;
  taskTypeRequired: boolean;
}

function mergeCatalogItem(
  list: TaskCreationCatalogItem[],
  id: string | undefined,
  label?: string,
): TaskCreationCatalogItem[] {
  if (!id?.trim()) return list;
  const exists = list.some((u) => u.id === id);
  if (exists) return list;
  return [...list, { id: id.trim(), label: label?.trim() || id.trim() }];
}

export function resolveTaskCreationCatalog(operator: UserContext): TaskCreationCatalogContext {
  const runtimeUser = resolveRuntimeUser(operator);
  const operatorDonViId = runtimeUser?.relationships?.donViId?.trim();

  let units = [...TASK_CREATION_UNIT_CATALOG];
  units = mergeCatalogItem(units, operatorDonViId, 'Đơn vị của bạn');

  const taskTypes = [...TASK_CREATION_TASK_TYPE_CATALOG];

  return {
    taskTypes,
    units,
    operatorDonViId,
    unitSelectionRequired: units.length > 1,
    taskTypeRequired: taskTypes.length > 0,
  };
}

/** Auto-select only when exactly one unit; never guess among multiple. */
export function resolveDefaultDonViId(
  units: TaskCreationCatalogItem[],
  operatorDonViId?: string,
): string {
  if (units.length === 1) return units[0]!.id;
  if (operatorDonViId && units.some((u) => u.id === operatorDonViId)) return operatorDonViId;
  return '';
}

export function resolveUnitLabel(units: TaskCreationCatalogItem[], donViId: string): string {
  return units.find((u) => u.id === donViId)?.label ?? donViId;
}

export function resolveTaskTypeLabel(taskTypes: TaskCreationCatalogItem[], taskTypeId: string): string {
  return taskTypes.find((t) => t.id === taskTypeId)?.label ?? taskTypeId;
}
