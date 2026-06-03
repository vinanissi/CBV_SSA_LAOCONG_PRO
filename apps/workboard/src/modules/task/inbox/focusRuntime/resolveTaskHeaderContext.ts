import type { TaskChecklistFieldBag } from './resolveTaskChecklistFieldValues';
import { resolveSchemaFieldValue } from './resolveTaskChecklistFieldValues';
import {
  TASK_HEADER_CONTEXT_SCHEMA,
  type TaskHeaderContextFieldSchema,
} from './taskHeaderContextEnrichmentSchemas';

export interface ResolvedTaskHeaderContextRow {
  key: string;
  label: string;
  value: string;
  section: TaskHeaderContextFieldSchema['section'];
}

function normalizeCompare(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function shouldSkipDuplicateValue(
  field: TaskHeaderContextFieldSchema,
  value: string,
  bag: TaskChecklistFieldBag,
): boolean {
  const norm = normalizeCompare(value);
  if (!norm) return true;

  const title = normalizeCompare(bag.task_title);
  if (field.key !== 'task_title' && title && norm === title) return true;

  if (field.key === 'task_description' && norm === title) return true;

  if (field.key === 'task_context') {
    const desc = normalizeCompare(bag.task_description);
    const ai = normalizeCompare(bag.task_ai_summary);
    if (desc && norm === desc) return true;
    if (ai && norm === ai) return true;
  }

  if (field.key === 'task_ai_summary') {
    const desc = normalizeCompare(bag.task_description);
    if (desc && norm === desc) return true;
  }

  return false;
}

export function resolveTaskHeaderContextRows(
  bag: TaskChecklistFieldBag,
  schema: TaskHeaderContextFieldSchema[] = TASK_HEADER_CONTEXT_SCHEMA,
): ResolvedTaskHeaderContextRow[] {
  const sorted = [...schema]
    .filter((f) => f.section !== 'header' && f.key !== 'semantic_status_summary')
    .sort((a, b) => a.order - b.order);

  const rows: ResolvedTaskHeaderContextRow[] = [];

  for (const field of sorted) {
    const raw = resolveSchemaFieldValue(
      {
        key: field.key,
        label: field.label,
        source: field.source,
        fallbackSources: field.fallbackSources,
        section: 'header',
        order: field.order,
        operatorFacing: field.operatorFacing,
        showWhenEmpty: field.showWhenEmpty,
        emptyPlaceholder: field.emptyPlaceholder,
      },
      bag,
    );

    if (!raw) {
      if (field.showWhenEmpty && field.emptyPlaceholder) {
        rows.push({
          key: field.key,
          label: field.label,
          value: field.emptyPlaceholder,
          section: field.section,
        });
      }
      continue;
    }

    if (shouldSkipDuplicateValue(field, raw, bag)) continue;

    rows.push({
      key: field.key,
      label: field.label,
      value: raw,
      section: field.section,
    });
  }

  return rows;
}

export function resolveTaskHeaderTitle(
  bag: TaskChecklistFieldBag,
  schema: TaskHeaderContextFieldSchema[] = TASK_HEADER_CONTEXT_SCHEMA,
): string {
  const titleField = schema.find((f) => f.key === 'task_title');
  if (!titleField) return bag.task_title?.trim() || '—';
  return (
    resolveSchemaFieldValue(
      {
        key: titleField.key,
        label: titleField.label,
        source: titleField.source,
        section: 'header',
        order: titleField.order,
        operatorFacing: true,
      },
      bag,
    ) ??
    bag.task_title?.trim() ??
    '—'
  );
}
