import type { ChecklistAttachment } from './checklistAttachmentTypes';
import type { ChecklistFeedback } from './checklistFeedbackTypes';
import type { ChecklistHistoryEntry } from './checklistHistoryTypes';
import type { ChecklistLink } from './checklistLinkTypes';
import { formatChecklistHistoryTime } from './checklistHistoryFormat';
import { canOpenChecklistLink } from './checklistLinkLocalStore';
import { formatChecklistFeedbackTime } from './smartChecklistFormat';
import { openChecklistLinkUrl } from './checklistLinkUtils';

export interface ChecklistItemLatestPreviewProps {
  feedback: ChecklistFeedback[];
  attachments: ChecklistAttachment[];
  links: ChecklistLink[];
  history?: ChecklistHistoryEntry[];
  onOpenFeedback?: () => void;
  onOpenAttachments?: () => void;
  onOpenLinks?: () => void;
  onOpenHistory?: () => void;
}

export function ChecklistItemLatestPreview({
  feedback,
  attachments,
  links,
  history = [],
  onOpenFeedback,
  onOpenAttachments,
  onOpenLinks,
  onOpenHistory,
}: ChecklistItemLatestPreviewProps) {
  const latestFeedback = feedback.length > 0 ? feedback[feedback.length - 1] : null;
  const latestAttachment = attachments.length > 0 ? attachments[attachments.length - 1] : null;
  const latestLink = links.length > 0 ? links[links.length - 1] : null;
  const latestHistory = history.length > 0 ? history[history.length - 1] : null;

  if (!latestFeedback && !latestAttachment && !latestLink && !latestHistory) return null;

  return (
    <div className="work-inbox-checklist-inline-preview" aria-label="Mới nhất">
      <span className="work-inbox-checklist-inline-preview__label">Mới nhất:</span>
      <ul className="work-inbox-checklist-inline-preview__list">
        {latestFeedback ? (
          <li className="work-inbox-checklist-inline-preview__item">
            <button
              type="button"
              className="work-inbox-checklist-inline-preview__btn"
              onClick={onOpenFeedback}
            >
              <span className="work-inbox-checklist-inline-preview__time">
                {formatChecklistFeedbackTime(latestFeedback.createdAt)}
              </span>{' '}
              {latestFeedback.message}
            </button>
          </li>
        ) : null}
        {latestAttachment ? (
          <li className="work-inbox-checklist-inline-preview__item">
            <button
              type="button"
              className="work-inbox-checklist-inline-preview__btn"
              onClick={onOpenAttachments}
            >
              {latestAttachment.name}
            </button>
          </li>
        ) : null}
        {latestLink ? (
          <li className="work-inbox-checklist-inline-preview__item">
            {canOpenChecklistLink(latestLink) ? (
              <button
                type="button"
                className="work-inbox-checklist-inline-preview__btn"
                onClick={() => openChecklistLinkUrl(latestLink.url)}
              >
                {latestLink.label}
              </button>
            ) : (
              <button
                type="button"
                className="work-inbox-checklist-inline-preview__btn work-inbox-checklist-inline-preview__btn--muted"
                onClick={onOpenLinks}
              >
                {latestLink.label} (chưa mở được)
              </button>
            )}
          </li>
        ) : null}
        {latestHistory ? (
          <li className="work-inbox-checklist-inline-preview__item">
            <button
              type="button"
              className="work-inbox-checklist-inline-preview__btn work-inbox-checklist-inline-preview__btn--history"
              onClick={onOpenHistory}
            >
              <span className="work-inbox-checklist-inline-preview__time">
                {formatChecklistHistoryTime(latestHistory.createdAt)}
              </span>{' '}
              {latestHistory.message}
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
