import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import {
  buildTaskChecklistFieldBag,
  resolveOperatorDetailSummaryRows,
  type ResolvedSchemaRow,
} from './resolveTaskChecklistFieldValues';

export interface OperatorDetailFieldRow {
  label: string;
  value: string;
}

const SOURCE_LABEL_VI: Record<string, string> = {
  TASK_MAIN: 'Bảng công việc',
  google_sheet_existing_db: 'Google Sheet (runtime)',
  SHEET: 'Google Sheet',
  APPSHEET: 'AppSheet',
};

function formatSourceLabel(source?: string): string {
  const raw = source?.trim();
  if (!raw) return '—';
  return SOURCE_LABEL_VI[raw] ?? 'Hệ thống nội bộ';
}

export function buildOperatorDetailSummaryRows(options: {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  aiSummaryText?: string;
}): OperatorDetailFieldRow[] {
  const bag = buildTaskChecklistFieldBag({
    item: options.item,
    runtimeTask: options.runtimeTask,
    taskDetail: options.taskDetail,
    aiSummaryText: options.aiSummaryText,
    assigneeFallback: undefined,
  });
  return resolveOperatorDetailSummaryRows(bag).map((row: ResolvedSchemaRow) => ({
    label: row.label,
    value: row.value,
  }));
}

export function buildOperatorTechnicalMetadataRows(options: {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  createdLabel?: string;
  updatedLabel?: string;
}): OperatorDetailFieldRow[] {
  const { item, runtimeTask, createdLabel, updatedLabel } = options;
  const rows: OperatorDetailFieldRow[] = [];

  if (item.code?.trim()) {
    rows.push({ label: 'Mã hiển thị', value: item.code.trim() });
  }
  rows.push({ label: 'Mã hệ thống (task)', value: item.id });
  if (runtimeTask?.source?.trim()) {
    rows.push({ label: 'Nguồn runtime', value: runtimeTask.source.trim() });
  }
  rows.push({ label: 'Nguồn (hiển thị)', value: formatSourceLabel(runtimeTask?.source) });
  if (runtimeTask?.relatedEntityId?.trim()) {
    rows.push({ label: 'Liên kết thực thể', value: runtimeTask.relatedEntityId.trim() });
  }
  rows.push({ label: 'Tạo lúc', value: createdLabel || '—' });
  rows.push({ label: 'Cập nhật', value: updatedLabel || '—' });

  return rows;
}
