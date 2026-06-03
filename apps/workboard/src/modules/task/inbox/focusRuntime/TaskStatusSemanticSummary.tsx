import type { TaskDetail, TaskItem } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import {
  buildTaskSemanticSummaryBag,
  resolveTaskStatusSummaryRows,
  type ResolvedTaskStatusSummaryRow,
} from './resolveTaskStatusSemanticSummary';

export interface TaskStatusSemanticSummaryProps {
  item: WorkInboxFocusItem;
  runtimeTask?: TaskItem;
  taskDetail?: TaskDetail | null;
  assigneeFallback?: string;
  layout?: 'stack' | 'compact';
  className?: string;
}

export function TaskStatusSemanticSummary({
  item,
  runtimeTask,
  taskDetail = null,
  assigneeFallback,
  layout = 'stack',
  className = '',
}: TaskStatusSemanticSummaryProps) {
  const bag = buildTaskSemanticSummaryBag({
    item,
    runtimeTask,
    taskDetail,
    assigneeFallback,
  });
  const rows = resolveTaskStatusSummaryRows(bag);

  if (rows.length === 0) return null;

  const rootClass =
    layout === 'compact'
      ? `work-inbox-task-semantic-summary work-inbox-task-semantic-summary--compact ${className}`.trim()
      : `work-inbox-task-semantic-summary ${className}`.trim();

  return (
    <dl className={rootClass} data-cbv-panel="work-inbox-task-semantic-summary">
      {rows.map((row) => (
        <SemanticRow key={row.key} row={row} layout={layout} />
      ))}
    </dl>
  );
}

function SemanticRow({
  row,
  layout,
}: {
  row: ResolvedTaskStatusSummaryRow;
  layout: 'stack' | 'compact';
}) {
  const toneClass = row.tone ? `work-inbox-task-semantic-summary__value--${row.tone}` : '';
  if (layout === 'compact') {
    return (
      <div
        className="work-inbox-task-semantic-summary__row work-inbox-task-semantic-summary__row--compact"
        data-semantic-type={row.semanticType}
      >
        <dt className="work-inbox-task-semantic-summary__label">{row.label}</dt>
        <dd className={`work-inbox-task-semantic-summary__value ${toneClass}`.trim()}>
          {row.icon ? <span aria-hidden>{row.icon} </span> : null}
          {row.value}
        </dd>
      </div>
    );
  }

  return (
    <div className="work-inbox-task-semantic-summary__row" data-semantic-type={row.semanticType}>
      <dt className="work-inbox-task-semantic-summary__label">{row.label}</dt>
      <dd className={`work-inbox-task-semantic-summary__value ${toneClass}`.trim()}>
        {row.icon ? <span aria-hidden>{row.icon} </span> : null}
        {row.value}
      </dd>
    </div>
  );
}
