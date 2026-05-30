interface TaskMetadataRowProps {
  assignee: string;
  dueLabel: string;
  createdLabel?: string;
  updatedLabel?: string;
}

export function TaskMetadataRow({
  assignee,
  dueLabel,
  createdLabel,
  updatedLabel,
}: TaskMetadataRowProps) {
  return (
    <dl className="work-inbox-task-metadata" data-cbv-panel="work-inbox-task-metadata">
      <div>
        <dt>Người phụ trách</dt>
        <dd>{assignee}</dd>
      </div>
      <div>
        <dt>Hạn</dt>
        <dd>{dueLabel}</dd>
      </div>
      <div>
        <dt>Tạo lúc</dt>
        <dd>{createdLabel || '—'}</dd>
      </div>
      <div>
        <dt>Cập nhật</dt>
        <dd>{updatedLabel || '—'}</dd>
      </div>
    </dl>
  );
}
