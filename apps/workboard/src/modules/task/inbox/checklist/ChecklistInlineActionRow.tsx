import type { ChecklistInlineAction } from './checklistInlineActionTypes';

export interface ChecklistInlineActionRowProps {
  actions: ChecklistInlineAction[];
  feedbackActive?: boolean;
  attachmentActive?: boolean;
  linksActive?: boolean;
  historyActive?: boolean;
  busy?: boolean;
  onFeedbackAction?: (willOpen: boolean) => void;
  onAttachmentAction?: (willOpen: boolean) => void;
  onLinksAction?: (willOpen: boolean) => void;
  onHistoryAction?: (willOpen: boolean) => void;
}

export function ChecklistInlineActionRow({
  actions,
  feedbackActive = false,
  attachmentActive = false,
  linksActive = false,
  historyActive = false,
  busy = false,
  onFeedbackAction,
  onAttachmentAction,
  onLinksAction,
  onHistoryAction,
}: ChecklistInlineActionRowProps) {
  const feedback = actions.find((a) => a.type.includes('feedback'));
  const attachment = actions.find((a) => a.type.includes('attachment'));
  const link = actions.find((a) => a.type.includes('link'));
  const history = actions.find((a) => a.type.includes('history'));

  return (
    <div className="work-inbox-checklist-inline-actions" role="toolbar" aria-label="Thao tác mục checklist">
      {feedback ? (
        <button
          type="button"
          className={
            feedbackActive
              ? 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--active'
              : 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--feedback'
          }
          disabled={!feedback.enabled || busy}
          title={feedback.reasonDisabled ?? 'Phản hồi xử lý'}
          aria-expanded={feedbackActive}
          onClick={() => onFeedbackAction?.(!feedbackActive)}
          aria-controls={`checklist-feedback-${feedback.checklistItemId}`}
        >
          💬 {feedback.label}
        </button>
      ) : null}
      {attachment ? (
        <button
          type="button"
          className={
            attachmentActive
              ? 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--attachment work-inbox-checklist-inline-actions__chip--active'
              : 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--attachment'
          }
          disabled={!attachment.enabled || busy}
          title={attachment.reasonDisabled ?? 'Tài liệu đính kèm'}
          aria-expanded={attachmentActive}
          onClick={() => onAttachmentAction?.(!attachmentActive)}
          aria-controls={`checklist-attachment-${attachment.checklistItemId}`}
        >
          📎 {attachment.label}
        </button>
      ) : null}
      {link ? (
        <button
          type="button"
          className={
            linksActive
              ? 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--link work-inbox-checklist-inline-actions__chip--active'
              : 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--link'
          }
          disabled={!link.enabled || busy}
          title={link.reasonDisabled ?? 'Liên kết vận hành'}
          aria-expanded={linksActive}
          onClick={() => onLinksAction?.(!linksActive)}
          aria-controls={`checklist-link-${link.checklistItemId}`}
        >
          🔗 {link.label}
        </button>
      ) : null}
      {history ? (
        <button
          type="button"
          className={
            historyActive
              ? 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--history work-inbox-checklist-inline-actions__chip--active'
              : 'work-inbox-checklist-inline-actions__chip work-inbox-checklist-inline-actions__chip--history'
          }
          disabled={!history.enabled || busy}
          title={history.reasonDisabled ?? 'Lịch sử hoạt động'}
          aria-expanded={historyActive}
          onClick={() => onHistoryAction?.(!historyActive)}
          aria-controls={`checklist-history-${history.checklistItemId}`}
        >
          🕒 {history.label}
        </button>
      ) : null}
    </div>
  );
}
