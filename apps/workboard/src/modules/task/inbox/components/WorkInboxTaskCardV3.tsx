import type { KeyboardEventHandler, MouseEvent } from 'react';
import type { TaskCardModel } from '@/modules/task/types/workInboxTypes';
import { WORK_INBOX_STATUS_CHIP } from './WorkInboxStatusChip';

const ASSIGNEE_FALLBACK = 'Chưa gán';

interface WorkInboxTaskCardV3Props {
  model: TaskCardModel;
  compact?: boolean;
  selected?: boolean;
  /** Card click opens task; no per-row "Mở xử lý" button. */
  hideOpenButton?: boolean;
  onOpen?: (model: TaskCardModel) => void;
  onSelect?: (model: TaskCardModel) => void;
}

function warnUnbound(action: string, model: TaskCardModel) {
  console.warn(`[WorkInboxV3] ${action} handler not bound`, {
    taskId: model.id,
    title: model.title,
    href: model.primaryActionHref,
  });
}

export function WorkInboxTaskCardV3({
  model,
  compact = false,
  selected = false,
  hideOpenButton = false,
  onOpen,
  onSelect,
}: WorkInboxTaskCardV3Props) {
  const assignee = model.assigneeName?.trim() || ASSIGNEE_FALLBACK;
  const statusConfig = WORK_INBOX_STATUS_CHIP[model.status] ?? WORK_INBOX_STATUS_CHIP.unknown;
  const metaLine = [assignee, model.dueLabel?.trim()].filter(Boolean).join(' · ');

  const handleSelect = () => {
    if (hideOpenButton && onOpen) {
      onOpen(model);
      return;
    }
    if (onSelect) {
      onSelect(model);
      return;
    }
    warnUnbound('select', model);
  };

  const handleOpen = (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    if (onOpen) {
      onOpen(model);
      return;
    }
    warnUnbound('open', model);
  };

  const handleCardKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleSelect();
  };

  const selectedClass = selected ? 'ring-2 ring-blue-400/70 border-blue-300/80' : '';

  if (compact) {
    return (
      <article
        className={`work-inbox-task-card-v3 work-inbox-task-card-v3--compact flex cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-surface-content px-2 py-1.5 ${selectedClass}`}
        data-cbv-card="work-inbox-task-v3"
        data-task-id={model.id}
        data-selected={selected ? 'true' : 'false'}
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={handleCardKeyDown}
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-semibold text-operational-text" title={model.title}>
            {model.title || 'Chưa có tiêu đề'}
          </h3>
          <p className="mt-0.5 truncate text-[10px] text-operational-muted">
            <span aria-hidden>{statusConfig.emoji} </span>
            {metaLine || statusConfig.label}
          </p>
        </div>
        {!hideOpenButton && (
          <button
            type="button"
            className="work-inbox-primary-action shrink-0 rounded border border-border bg-surface-raised px-2 py-1 text-[10px] font-semibold text-operational-text hover:bg-surface-overlay"
            onClick={handleOpen}
          >
            {model.primaryActionLabel || 'Mở xử lý'}
          </button>
        )}
      </article>
    );
  }

  return (
    <article
      className={`work-inbox-task-card-v3 cursor-pointer rounded-lg border border-border/70 bg-surface-content p-3 shadow-sm ${selectedClass}`}
      data-cbv-card="work-inbox-task-v3"
      data-task-id={model.id}
      data-selected={selected ? 'true' : 'false'}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleCardKeyDown}
    >
      <header className="work-inbox-task-card-v3__header min-w-0">
        <h3 className="truncate text-sm font-semibold text-operational-text" title={model.title}>
          {model.title || 'Chưa có tiêu đề'}
        </h3>
        {model.code && model.code !== model.id && (
          <p className="mt-0.5 truncate text-[10px] text-operational-muted">{model.code}</p>
        )}
      </header>

      <div className="work-inbox-task-card-v3__meta mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px]">
          {statusConfig.emoji} {statusConfig.label}
        </span>
      </div>

      <p className="mt-1 flex items-center gap-1 text-xs text-operational-secondary">
        <span aria-hidden>👤</span>
        <span className="truncate">{assignee}</span>
        {model.dueLabel && <span className="text-operational-muted">· {model.dueLabel}</span>}
      </p>

      {!hideOpenButton && (
        <footer className="work-inbox-task-card-v3__footer mt-2">
          <button
            type="button"
            className="work-inbox-primary-action w-full rounded-md border border-border bg-surface-raised px-3 py-1.5 text-xs font-semibold text-operational-text hover:border-border-soft hover:bg-surface-overlay"
            onClick={handleOpen}
          >
            {model.primaryActionLabel || 'Mở xử lý'}
          </button>
        </footer>
      )}
    </article>
  );
}
