import { useEffect, useState } from 'react';
import type { WorkInboxAttachmentItem } from '@/modules/task/inbox/attachments/workInboxAttachmentsTypes';
import { canOpenChecklistLink } from './checklistLinkLocalStore';
import type { ChecklistLink } from './checklistLinkTypes';
import {
  isValidChecklistLinkUrl,
  openChecklistLinkUrl,
  shortChecklistLinkTypeLabel,
} from './checklistLinkUtils';

export interface ChecklistLinkPanelProps {
  links: ChecklistLink[];
  expanded: boolean;
  allowMutate?: boolean;
  busy?: boolean;
  taskAttachments?: WorkInboxAttachmentItem[];
  autoCompose?: boolean;
  onComposeConsumed?: () => void;
  onRegister?: (input: { label: string; url: string; description?: string | null }) => void;
  onRegisterFromTask?: (ref: { title: string; url?: string }) => void;
  onRemove?: (linkId: string) => void;
}

export function ChecklistLinkPanel({
  links,
  expanded,
  allowMutate = false,
  busy = false,
  taskAttachments = [],
  autoCompose = false,
  onComposeConsumed,
  onRegister,
  onRegisterFromTask,
  onRemove,
}: ChecklistLinkPanelProps) {
  const [composing, setComposing] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    if (expanded && autoCompose && allowMutate) {
      setComposing(true);
      onComposeConsumed?.();
    }
  }, [expanded, autoCompose, allowMutate, onComposeConsumed]);

  if (!expanded) return null;

  const submit = () => {
    const label = labelDraft.trim();
    if (!label) return;
    onRegister?.({
      label,
      url: urlDraft.trim(),
      description: descDraft.trim() || null,
    });
    setLabelDraft('');
    setUrlDraft('');
    setDescDraft('');
    setComposing(false);
  };

  const taskLinks = taskAttachments.filter((ta) => ta.url?.trim());

  return (
    <div className="work-inbox-checklist-link" role="region" aria-label="Liên kết vận hành">
      <p className="work-inbox-checklist-link__heading">Liên kết:</p>
      {links.length === 0 ? (
        <p className="work-inbox-checklist-link__empty">Chưa có liên kết.</p>
      ) : (
        <ul className="work-inbox-checklist-link__list">
          {links.map((link) => {
            const openable = canOpenChecklistLink(link);
            const typeLabel = shortChecklistLinkTypeLabel(link.type);
            return (
              <li key={link.id} className="work-inbox-checklist-link__row">
                <div className="work-inbox-checklist-link__main">
                  {openable ? (
                    <button
                      type="button"
                      className="work-inbox-checklist-link__open"
                      disabled={busy}
                      onClick={() => openChecklistLinkUrl(link.url)}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <span className="work-inbox-checklist-link__disabled" title="URL không hợp lệ">
                      {link.label}
                      <span className="work-inbox-checklist-link__unavailable"> (chưa mở được)</span>
                    </span>
                  )}
                  <span className="work-inbox-checklist-link__meta">
                    {typeLabel}
                    {link.url ? ` · ${link.url.length > 48 ? `${link.url.slice(0, 45)}…` : link.url}` : ''}
                  </span>
                  {link.description ? (
                    <span className="work-inbox-checklist-link__desc">{link.description}</span>
                  ) : null}
                </div>
                {allowMutate ? (
                  <button
                    type="button"
                    className="work-inbox-checklist-link__remove"
                    disabled={busy}
                    onClick={() => onRemove?.(link.id)}
                    aria-label={`Gỡ ${link.label}`}
                  >
                    ×
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {allowMutate ? (
        <div className="work-inbox-checklist-link__composer">
          {composing ? (
            <div className="work-inbox-checklist-link__form">
              <input
                type="text"
                className="work-inbox-checklist-link__input"
                placeholder="Nhãn (vd. Zalo chat)"
                value={labelDraft}
                disabled={busy}
                onChange={(e) => setLabelDraft(e.target.value)}
              />
              <input
                type="url"
                className="work-inbox-checklist-link__input"
                placeholder="URL https://…"
                value={urlDraft}
                disabled={busy}
                onChange={(e) => setUrlDraft(e.target.value)}
              />
              <input
                type="text"
                className="work-inbox-checklist-link__input"
                placeholder="Mô tả (tùy chọn)"
                value={descDraft}
                disabled={busy}
                onChange={(e) => setDescDraft(e.target.value)}
              />
              {urlDraft.trim() && !isValidChecklistLinkUrl(urlDraft) ? (
                <p className="work-inbox-checklist-link__hint-warn">
                  URL chưa hợp lệ — vẫn lưu tham chiếu nhưng không mở được.
                </p>
              ) : null}
              <div className="work-inbox-checklist-link__composer-actions">
                <button
                  type="button"
                  className="work-inbox-checklist-link__submit"
                  disabled={!labelDraft.trim() || busy}
                  onClick={submit}
                >
                  Lưu liên kết
                </button>
                <button
                  type="button"
                  className="work-inbox-checklist-link__cancel"
                  disabled={busy}
                  onClick={() => {
                    setComposing(false);
                    setLabelDraft('');
                    setUrlDraft('');
                    setDescDraft('');
                  }}
                >
                  Hủy
                </button>
              </div>
              {taskLinks.length > 0 ? (
                <div className="work-inbox-checklist-link__task-refs">
                  <span className="work-inbox-checklist-link__task-refs-label">Từ task:</span>
                  {taskLinks.slice(0, 5).map((ta) => (
                    <button
                      key={ta.attachmentId}
                      type="button"
                      className="work-inbox-checklist-link__task-ref-btn"
                      disabled={busy}
                      onClick={() => {
                        onRegisterFromTask?.({ title: ta.title, url: ta.url });
                        setComposing(false);
                      }}
                    >
                      {ta.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              className="work-inbox-checklist-link__add"
              disabled={busy}
              onClick={() => setComposing(true)}
            >
              + Thêm liên kết
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
