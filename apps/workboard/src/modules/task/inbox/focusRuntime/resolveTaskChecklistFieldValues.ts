import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import {
  OPERATOR_DETAIL_PANEL_SCHEMA,
  type TaskChecklistFieldSchema,
} from './taskChecklistInformationModelSchemas';
import { resolveTaskHeaderContextRows } from './resolveTaskHeaderContext';
import { buildTaskSemanticSummaryBag } from './resolveTaskStatusSemanticSummary';
import { resolveTaskRelatedEntityDisplay } from '../create/resolveTaskRelatedEntity';

export type TaskChecklistFieldBag = Record<string, string | undefined>;

const MODULE_LABEL_VI: Record<string, string> = {
  TASK: 'Công việc',
  HO_SO: 'Hồ sơ',
  FINANCE: 'Tài chính',
  DOCS: 'Tài liệu',
  INVOICE: 'Hóa đơn',
};

function formatModuleLabel(module?: string): string {
  const key = module?.trim().toUpperCase();
  if (!key) return 'Công việc';
  return MODULE_LABEL_VI[key] ?? module ?? 'Công việc';
}

function resolveUnitLabel(runtimeTask?: TaskItem, taskDetail?: TaskDetail | null): string {
  const related = runtimeTask?.relatedEntityType?.trim() || taskDetail?.relatedEntityType?.trim();
  if (related && related !== 'GENERAL') return related.replace(/_/g, ' ');
  return '';
}

function firstNonEmpty(...values: (string | undefined | null)[]): string | undefined {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}

export function buildTaskChecklistFieldBag(options: {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  aiSummaryText?: string;
  assigneeFallback?: string;
}): TaskChecklistFieldBag {
  const { item, runtimeTask, taskDetail, aiSummaryText, assigneeFallback } = options;
  const semantic = buildTaskSemanticSummaryBag({ item, runtimeTask, taskDetail, assigneeFallback });
  const description = taskDetail?.description?.trim();
  const title = item.title?.trim() || taskDetail?.title?.trim() || runtimeTask?.title?.trim();

  const contextParts = [
    taskDetail?.pendingAction?.trim(),
    taskDetail?.blockReason?.trim(),
    runtimeTask?.pendingAction?.trim(),
    runtimeTask?.blockReason?.trim(),
  ].filter(Boolean);

  const uniqueContext = [...new Set(contextParts)];

  return {
    ...semantic,
    task_title: title,
    task_detail_description: description,
    task_description: description,
    task_pending_action: firstNonEmpty(taskDetail?.pendingAction, runtimeTask?.pendingAction),
    task_block_reason: firstNonEmpty(taskDetail?.blockReason, runtimeTask?.blockReason),
    task_context: uniqueContext.length > 0 ? uniqueContext.join(' · ') : undefined,
    task_expected_result: taskDetail?.nextStep?.trim(),
    task_next_step: taskDetail?.nextStep?.trim(),
    task_ai_summary: aiSummaryText?.trim(),
    task_related_entity_display: resolveTaskRelatedEntityDisplay(runtimeTask, taskDetail),
    task_queue_progress: `${item.progressIndex} / ${item.progressTotal}`,
    task_related_dossier: runtimeTask?.relatedHoSoId?.trim()
      ? 'Có — xem tab Hồ sơ'
      : 'Xem tab Hồ sơ',
    task_unit: resolveUnitLabel(runtimeTask, taskDetail) || undefined,
    task_module_label: formatModuleLabel(runtimeTask?.module ?? item.module),
  };
}

export function resolveSchemaFieldValue(
  field: TaskChecklistFieldSchema,
  bag: TaskChecklistFieldBag,
): string | undefined {
  const primary = bag[field.source]?.trim();
  if (primary) return primary;
  for (const fb of field.fallbackSources ?? []) {
    const v = bag[fb]?.trim();
    if (v) return v;
  }
  return undefined;
}

export interface ResolvedSchemaRow {
  key: string;
  label: string;
  value: string;
}

export function resolveSchemaRows(
  schema: TaskChecklistFieldSchema[],
  bag: TaskChecklistFieldBag,
): ResolvedSchemaRow[] {
  const sorted = [...schema].sort((a, b) => a.order - b.order);
  const rows: ResolvedSchemaRow[] = [];

  for (const field of sorted) {
    const raw = resolveSchemaFieldValue(field, bag);
    if (!raw) {
      if (field.showWhenEmpty && field.emptyPlaceholder) {
        rows.push({ key: field.key, label: field.label, value: field.emptyPlaceholder });
      }
      continue;
    }
    if (field.key === 'task_description' && raw === bag.task_title) continue;
    rows.push({ key: field.key, label: field.label, value: raw });
  }

  return rows;
}

export function resolveTaskHeaderBlocks(
  bag: TaskChecklistFieldBag,
): { key: string; label: string; value: string }[] {
  return resolveTaskHeaderContextRows(bag).map(({ key, label, value }) => ({
    key,
    label,
    value,
  }));
}

export function resolveOperatorDetailSummaryRows(bag: TaskChecklistFieldBag): ResolvedSchemaRow[] {
  return resolveSchemaRows(OPERATOR_DETAIL_PANEL_SCHEMA, bag);
}
