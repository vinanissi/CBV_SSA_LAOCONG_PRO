import { useEffect, useState } from 'react';
import type { ChecklistFeedback } from './checklistFeedbackTypes';
import { formatChecklistFeedbackTime } from './smartChecklistFormat';

export interface ChecklistFeedbackPanelProps {
  feedback: ChecklistFeedback[];
  expanded: boolean;
  allowMutate?: boolean;
  busy?: boolean;
  /** Open composer when panel expands (inline action one-click). */
  autoCompose?: boolean;
  onAddFeedback?: (message: string) => void;
  onComposeConsumed?: () => void;
}

export function ChecklistFeedbackPanel({
  feedback,
  expanded,
  allowMutate = false,
  busy = false,
  autoCompose = false,
  onAddFeedback,
  onComposeConsumed,
}: ChecklistFeedbackPanelProps) {
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (expanded && autoCompose && allowMutate) {
      setComposing(true);
      onComposeConsumed?.();
    }
  }, [expanded, autoCompose, allowMutate, onComposeConsumed]);

  if (!expanded) return null;

  const submit = () => {
    const msg = draft.trim();
    if (!msg) return;
    onAddFeedback?.(msg);
    setDraft('');
    setComposing(false);
  };

  return (
    <div className="work-inbox-checklist-feedback" role="region" aria-label="Phản hồi xử lý">
      {feedback.length === 0 ? (
        <p className="work-inbox-checklist-feedback__empty">Chưa có phản hồi xử lý.</p>
      ) : (
        <ul className="work-inbox-checklist-feedback__list">
          {feedback.map((row) => (
            <li key={row.id} className="work-inbox-checklist-feedback__entry">
              <div className="work-inbox-checklist-feedback__time">
                {formatChecklistFeedbackTime(row.createdAt)}
              </div>
              <div className="work-inbox-checklist-feedback__body">
                <p className="work-inbox-checklist-feedback__message">{row.message}</p>
                {row.author ? (
                  <span className="work-inbox-checklist-feedback__author">{row.author}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {allowMutate ? (
        <div className="work-inbox-checklist-feedback__composer">
          {composing ? (
            <>
              <textarea
                className="work-inbox-checklist-feedback__input"
                rows={2}
                placeholder="Ghi chú xử lý…"
                value={draft}
                disabled={busy}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                  if (e.key === 'Escape') {
                    setComposing(false);
                    setDraft('');
                  }
                }}
                autoFocus
              />
              <div className="work-inbox-checklist-feedback__composer-actions">
                <button
                  type="button"
                  className="work-inbox-checklist-feedback__submit"
                  disabled={!draft.trim() || busy}
                  onClick={submit}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  className="work-inbox-checklist-feedback__cancel"
                  disabled={busy}
                  onClick={() => {
                    setComposing(false);
                    setDraft('');
                  }}
                >
                  Hủy
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="work-inbox-checklist-feedback__add"
              disabled={busy}
              onClick={() => setComposing(true)}
            >
              + Thêm phản hồi
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
