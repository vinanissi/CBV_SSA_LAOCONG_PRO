import type { TaskDetail, TaskItem } from '@/api/contracts';
import {
  TASK_RELATED_ENTITY_TYPE_CATALOG,
  type TaskRelatedEntityTypeCatalogItem,
} from './taskRelatedEntityInputSchemas';

export interface ResolvedRelatedEntityInput {
  relatedEntityType?: string;
  relatedEntityId?: string;
}

const LEGACY_PHONE_RE = /\[SĐT:\s*([^\]]+)\]/i;
const LEGACY_PLATE_RE = /\[Biển số:\s*([^\]]+)\]/i;

export function findRelatedEntityCatalogItem(
  typeKey: string | undefined,
): TaskRelatedEntityTypeCatalogItem | undefined {
  if (!typeKey?.trim()) return undefined;
  const norm = typeKey.trim().toUpperCase();
  return TASK_RELATED_ENTITY_TYPE_CATALOG.find(
    (item) => item.key === norm || item.dbType === norm,
  );
}

export function mapRelatedEntityTypeToDb(typeKey: string): string {
  const item = findRelatedEntityCatalogItem(typeKey);
  return item?.dbType ?? typeKey.trim().toUpperCase();
}

export function mapRelatedEntityTypeFromDb(dbType: string | undefined): string {
  if (!dbType?.trim()) return '';
  const norm = dbType.trim().toUpperCase();
  const byDb = TASK_RELATED_ENTITY_TYPE_CATALOG.find((item) => item.dbType === norm);
  return byDb?.key ?? norm;
}

export function normalizeRelatedEntityValue(
  typeKey: string,
  rawValue: string,
): string {
  const value = rawValue.trim();
  if (!value) return '';
  if (typeKey === 'PHONE') return value.replace(/[^\d+]/g, '').trim();
  if (typeKey === 'LICENSE_PLATE') return value.replace(/\s+/g, '').toUpperCase();
  return value;
}

export function resolveRelatedEntityFromLegacyRequest(options: {
  relatedEntityType?: string;
  relatedEntityValue?: string;
  relatedPhone?: string;
  relatedPlate?: string;
}): ResolvedRelatedEntityInput {
  const type = options.relatedEntityType?.trim();
  const value = options.relatedEntityValue?.trim();
  if (type && value) {
    const catalogKey = mapRelatedEntityTypeFromDb(type) || type.toUpperCase();
    return {
      relatedEntityType: mapRelatedEntityTypeToDb(catalogKey),
      relatedEntityId: normalizeRelatedEntityValue(catalogKey, value),
    };
  }
  if (options.relatedPhone?.trim()) {
    return {
      relatedEntityType: 'PHONE',
      relatedEntityId: normalizeRelatedEntityValue('PHONE', options.relatedPhone),
    };
  }
  if (options.relatedPlate?.trim()) {
    return {
      relatedEntityType: 'LICENSE_PLATE',
      relatedEntityId: normalizeRelatedEntityValue('LICENSE_PLATE', options.relatedPlate),
    };
  }
  return {};
}

export function validateRelatedEntityInput(
  relatedEntityType: string,
  relatedEntityValue: string,
): string | null {
  const type = relatedEntityType.trim();
  const value = relatedEntityValue.trim();
  if (!type && !value) return null;
  if (type && !value) return 'Vui lòng nhập giá trị đối tượng liên quan';
  if (!type && value) return 'Vui lòng chọn loại đối tượng';
  const catalogKey = mapRelatedEntityTypeFromDb(type) || type.toUpperCase();
  const normalized = normalizeRelatedEntityValue(catalogKey, value);
  if (catalogKey === 'PHONE' && normalized.length < 8) {
    return 'Số điện thoại không hợp lệ';
  }
  if (catalogKey === 'LICENSE_PLATE' && normalized.length < 4) {
    return 'Biển số không hợp lệ';
  }
  return null;
}

export function formatRelatedEntityDisplay(
  relatedEntityType?: string,
  relatedEntityId?: string,
): string | undefined {
  const id = relatedEntityId?.trim();
  if (!id) return undefined;
  const catalogKey = mapRelatedEntityTypeFromDb(relatedEntityType);
  const item = findRelatedEntityCatalogItem(catalogKey || relatedEntityType);
  const label = item?.label ?? relatedEntityType?.replace(/_/g, ' ') ?? 'Liên quan';
  return `${label}: ${id}`;
}

export function resolveRelatedEntityFromTask(
  runtimeTask?: TaskItem,
  taskDetail?: TaskDetail | null,
): ResolvedRelatedEntityInput {
  const type =
    runtimeTask?.relatedEntityType?.trim() || taskDetail?.relatedEntityType?.trim() || '';
  const id = runtimeTask?.relatedEntityId?.trim() || taskDetail?.relatedEntityId?.trim() || '';
  if (type && id) return { relatedEntityType: type, relatedEntityId: id };

  const desc = taskDetail?.description?.trim() || '';
  const phoneMatch = desc.match(LEGACY_PHONE_RE);
  if (phoneMatch?.[1]) {
    return { relatedEntityType: 'PHONE', relatedEntityId: phoneMatch[1].trim() };
  }
  const plateMatch = desc.match(LEGACY_PLATE_RE);
  if (plateMatch?.[1]) {
    return { relatedEntityType: 'LICENSE_PLATE', relatedEntityId: plateMatch[1].trim() };
  }
  return {};
}

export function resolveTaskRelatedEntityDisplay(
  runtimeTask?: TaskItem,
  taskDetail?: TaskDetail | null,
): string | undefined {
  const resolved = resolveRelatedEntityFromTask(runtimeTask, taskDetail);
  return formatRelatedEntityDisplay(resolved.relatedEntityType, resolved.relatedEntityId);
}

export function relatedEntityPlaceholder(typeKey: string): string {
  const item = findRelatedEntityCatalogItem(typeKey);
  return item?.inputPlaceholder ?? 'Nhập giá trị';
}
