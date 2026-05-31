import { useState } from 'react';
import type { UserContext } from '@/api/contracts';
import {
  attachmentOpenHref,
  attachmentTypeIcon,
} from './workInboxAttachmentsLocalState';
import { WorkInboxAddAttachmentDialog } from './WorkInboxAddAttachmentDialog';
import { useWorkInboxAttachmentsRuntime } from './useWorkInboxAttachmentsRuntime';
import type { WorkInboxAttachmentItem } from './workInboxAttachmentsTypes';

const PREVIEW_LIMIT = 5;

function formatAttTime(value?: string): string {
  if (!value?.trim()) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface WorkInboxAttachmentsSectionProps {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
  variant?: 'preview' | 'panel';
  dense?: boolean;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

export function WorkInboxAttachmentsSection({
  taskId,
  operator,
  canMutate = true,
  variant = 'preview',
  dense = false,
  dialogOpen: dialogOpenProp,
  onDialogOpenChange,
}: WorkInboxAttachmentsSectionProps) {
  const {
    items,
    loading,
    error,
    mutatingId,
    canMutate: allowMutate,
    createAttachment,
    deleteAttachment,
    pasteFromClipboard,
    reload,
  } = useWorkInboxAttachmentsRuntime({ taskId, operator, canMutate });

  const [dialogOpenLocal, setDialogOpenLocal] = useState(false);
  const dialogOpen = dialogOpenProp ?? dialogOpenLocal;
  const setDialogOpen = onDialogOpenChange ?? setDialogOpenLocal;

  const listItems = variant === 'panel' ? items : items.slice(0, PREVIEW_LIMIT);
  const showEmpty = !loading && items.length === 0;

  const renderRow = (item: WorkInboxAttachmentItem) => {
    const href = attachmentOpenHref(item);
    const busy = mutatingId === item.attachmentId;
    return (
      <li key={item.attachmentId} className="work-inbox-attachment__row">
        <span className="work-inbox-attachment__icon" aria-hidden>
          {attachmentTypeIcon(item.type)}
        </span>
        <div className="work-inbox-attachment__body">
          <span className="work-inbox-attachment__title">{item.title}</span>
          <span className="work-inbox-attachment__meta">
            {item.createdBy || '—'} · {formatAttTime(item.createdAt)}
          </span>
        </div>
        <div className="work-inbox-attachment__actions">
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="work-inbox-attachment__open">
              Mở
            </a>
          ) : item.type === 'TEXT' ? (
            <span className="work-inbox-attachment__open work-inbox-attachment__open--muted" title={item.textContent}>
              Nội dung
            </span>
          ) : null}
          {allowMutate ? (
            <button
              type="button"
              className="work-inbox-attachment__delete"
              disabled={busy}
              onClick={() => void deleteAttachment(item.attachmentId)}
            >
              ×
            </button>
          ) : null}
        </div>
      </li>
    );
  };

  const list = (
    <>
      {loading && items.length === 0 ? (
        <p className="work-inbox-attachment__hint">Đang tải tài liệu…</p>
      ) : null}
      {error ? (
        <p className="work-inbox-attachment__error">
          {error}{' '}
          <button type="button" className="work-inbox-attachment__retry" onClick={() => void reload()}>
            Thử lại
          </button>
        </p>
      ) : null}
      {showEmpty ? <p className="work-inbox-attachment__hint">Chưa có tài liệu đính kèm.</p> : null}
      <ul className="work-inbox-attachment__list">{listItems.map(renderRow)}</ul>
      {variant === 'preview' && items.length > PREVIEW_LIMIT ? (
        <p className="work-inbox-attachment__more">+{items.length - PREVIEW_LIMIT} tài liệu khác (xem tab Tài liệu)</p>
      ) : null}
    </>
  );

  if (variant === 'panel') {
    return (
      <div className="work-inbox-attachment-panel">
        {list}
        {allowMutate ? (
          <button type="button" className="btn-secondary w-full text-xs" onClick={() => setDialogOpen(true)}>
            + Đính kèm tài liệu
          </button>
        ) : null}
        <WorkInboxAddAttachmentDialog
          open={dialogOpen}
          loading={mutatingId === '__create__'}
          onClose={() => setDialogOpen(false)}
          onSubmit={createAttachment}
          onPasteClipboard={pasteFromClipboard}
        />
      </div>
    );
  }

  return (
    <section
      className={
        dense
          ? 'work-inbox-focus-card work-inbox-focus-card--preview work-inbox-focus-card--attachments work-inbox-focus-card--attachments-dense'
          : 'work-inbox-focus-card work-inbox-focus-card--preview work-inbox-focus-card--attachments'
      }
      aria-label="Tài liệu gần đây"
      data-cbv-panel="work-inbox-attachments-preview"
    >
      <h3 className="work-inbox-focus-card__title">TÀI LIỆU GẦN ĐÂY</h3>
      {list}
      {allowMutate ? (
        <button type="button" className="work-inbox-attachment__add-btn" onClick={() => setDialogOpen(true)}>
          + Thêm tài liệu
        </button>
      ) : null}
      <WorkInboxAddAttachmentDialog
        open={dialogOpen}
        loading={mutatingId === '__create__'}
        onClose={() => setDialogOpen(false)}
        onSubmit={createAttachment}
        onPasteClipboard={pasteFromClipboard}
      />
    </section>
  );
}
