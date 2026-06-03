import type { ResolvedTaskHeaderContextRow } from './resolveTaskHeaderContext';

export interface TaskHeaderContextBlockProps {
  rows: ResolvedTaskHeaderContextRow[];
  className?: string;
}

export function TaskHeaderContextBlock({ rows, className = '' }: TaskHeaderContextBlockProps) {
  if (rows.length === 0) return null;

  const rootClass = `work-inbox-task-header-context ${className}`.trim();

  return (
    <dl className={rootClass} data-cbv-panel="work-inbox-task-header-context">
      {rows.map((row) => (
        <div
          key={row.key}
          className="work-inbox-task-header-context__row"
          data-header-context-section={row.section}
        >
          <dt className="work-inbox-task-header-context__label">{row.label}</dt>
          <dd className="work-inbox-task-header-context__value">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
