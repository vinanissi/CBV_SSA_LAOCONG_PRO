import { useEffect, useState } from 'react';
import type { ChecklistHistoryEntry } from './checklistHistoryTypes';
import { checklistHistoryTypeLabel, formatChecklistHistoryTime } from './checklistHistoryFormat';

export interface ChecklistHistoryPanelProps {
  history: ChecklistHistoryEntry[];
  expanded: boolean;
  allowMutate?: boolean;
  busy?: boolean;
  autoCompose?: boolean;
  onComposeConsumed?: () => void;
  onAddManualNote?: (message: string) => void;
}

export function ChecklistHistoryPanel({
  history,
  expanded,
  allowMutate = false,
  busy = false,
  autoCompose = false,
  onComposeConsumed,
  onAddManualNote,
}: ChecklistHistoryPanelProps) {
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');

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
    onAddManualNote?.(msg);
    setDraft('');
    setComposing(false);
  };

  const chronological = [...history].reverse();

  return (
    <div className="work-inbox-checklist-history" role="region" aria-label="Lịch sử mục checklist">
      <p className="work-inbox-checklist-history__heading">Lịch sử:</p>
      {history.length === 0 ? (
        <p className="work-inbox-checklist-history__empty">Chưa có hoạt động ghi nhận.</p>
      ) : (
        <ul className="work-inbox-checklist-history__list">
          {chronological.map((row) => {
            const actor = row.actor?.trim();
            const time = formatChecklistHistoryTime(row.createdAt);
            const typeLabel = checklistHistoryTypeLabel(row.type);
            return (
              <li key={row.id} className="work-inbox-checklist-history__entry">
                <span className="work-inbox-checklist-history__time">{time}</span>
                {actor ? (
                  <span className="work-inbox-checklist-history__actor">{actor}</span>
                ) : null}
                <span className="work-inbox-checklist-history__type">{typeLabel}</span>
                <p className="work-inbox-checklist-history__message">{row.message}</p>
              </li>
            );
          })}
        </ul>
      )}

      {allowMutate ? (
        <div className="work-inbox-checklist-history__composer">
          {composing ? (
            <>
              <textarea
                className="work-inbox-checklist-history__input"
                rows={2}
                placeholder="Ghi chú lịch sử…"
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
              <div className="work-inbox-checklist-history__composer-actions">
                <button
                  type="button"
                  className="work-inbox-checklist-history__submit"
                  disabled={!draft.trim() || busy}
                  onClick={submit}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  className="work-inbox-checklist-history__cancel"
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
              className="work-inbox-checklist-history__add"
              disabled={busy}
              onClick={() => setComposing(true)}
            >
              + Thêm ghi chú lịch sử
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
