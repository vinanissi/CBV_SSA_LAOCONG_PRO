import { useEffect, useState } from 'react';
import type { WorkInboxAttachmentItem } from '@/modules/task/inbox/attachments/workInboxAttachmentsTypes';
import { ChecklistAttachmentPanel } from './ChecklistAttachmentPanel';
import { ChecklistFeedbackPanel } from './ChecklistFeedbackPanel';
import { ChecklistHistoryPanel } from './ChecklistHistoryPanel';
import { ChecklistInlineActionRow } from './ChecklistInlineActionRow';
import { ChecklistItemCrudMenu } from './ChecklistItemCrudMenu';
import { ChecklistItemLatestPreview } from './ChecklistItemLatestPreview';
import { ChecklistLinkPanel } from './ChecklistLinkPanel';
import { deriveChecklistInlineActions } from './deriveChecklistInlineActions';
import {
  useChecklistDualPaneFocusOptional,
  type ChecklistDetailSection,
} from './ChecklistDualPaneFocusContext';
import type { SmartChecklistItem } from './smartChecklistTypes';
import { formatSmartChecklistUpdatedAt, smartChecklistStatusGlyph } from './smartChecklistFormat';

export interface SmartChecklistItemRowProps {
  focusState?: 'none' | 'focused' | 'dimmed';
  interactionState?: 'idle' | 'pending' | 'saved' | 'failed' | 'disabled';
  interactionMessage?: string | null;
  item: SmartChecklistItem;
  done: boolean;
  busy?: boolean;
  allowMutate?: boolean;
  layoutExpanded?: boolean;
  isArchived?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  editingTitle?: boolean;
  editingNote?: boolean;
  titleDraft?: string;
  noteDraft?: string;
  taskAttachments?: WorkInboxAttachmentItem[];
  onToggle?: () => void;
  onTitleDraftChange?: (value: string) => void;
  onNoteDraftChange?: (value: string) => void;
  onSaveTitle?: () => void;
  onSaveNote?: () => void;
  onCancelEdit?: () => void;
  onStartEditTitle?: () => void;
  onStartEditNote?: () => void;
  onToggleLayout?: (expanded: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onAddFeedback?: (message: string) => void;
  onRegisterAttachment?: (input: {
    name: string;
    url?: string | null;
    mimeType?: string | null;
    size?: number | null;
    source?: string;
  }) => void;
  onRegisterAttachmentFromTask?: (ref: {
    title: string;
    url?: string;
    attachmentId?: string;
  }) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  onUploadAttachmentFile?: (file: File) => void | Promise<void>;
  uploadAttachmentBusy?: boolean;
  onRegisterLink?: (input: { label: string; url: string; description?: string | null }) => void;
  onRegisterLinkFromTask?: (ref: { title: string; url?: string }) => void;
  onRemoveLink?: (linkId: string) => void;
  onAddManualHistoryNote?: (message: string) => void;
  crossFocusHighlighted?: boolean;
  checklistDomId?: string;
  onCopyStepLink?: () => void;
  copyStepLinkTitle?: string;
  /** Dual-pane: compact navigator row without inline detail cards. */
  navigatorOnly?: boolean;
  /** When true, hide inline chips/previews until row is focused or expanded (operator density). */
  densityMode?: boolean;
  /** When set for this row, open matching center inline panel once. */
  focusInlineIntent?: 'feedback' | 'attachments' | 'links' | 'history' | null;
  onFocusInlineIntentConsumed?: () => void;
  onActivateStep?: () => void;
}

export function SmartChecklistItemRow({
  focusState = 'none',
  interactionState = 'idle',
  interactionMessage = null,
  item,
  done,
  busy = false,
  allowMutate = false,
  layoutExpanded = false,
  isArchived = false,
  canMoveUp = false,
  canMoveDown = false,
  editingTitle = false,
  editingNote = false,
  titleDraft = '',
  noteDraft = '',
  taskAttachments = [],
  onToggle,
  onTitleDraftChange,
  onNoteDraftChange,
  onSaveTitle,
  onSaveNote,
  onCancelEdit,
  onStartEditTitle,
  onStartEditNote,
  onToggleLayout,
  onMoveUp,
  onMoveDown,
  onArchive,
  onRestore,
  onAddFeedback,
  onRegisterAttachment,
  onRegisterAttachmentFromTask,
  onRemoveAttachment,
  onUploadAttachmentFile,
  uploadAttachmentBusy = false,
  onRegisterLink,
  onRegisterLinkFromTask,
  onRemoveLink,
  onAddManualHistoryNote,
  crossFocusHighlighted = false,
  checklistDomId,
  onCopyStepLink,
  copyStepLinkTitle,
  navigatorOnly = false,
  densityMode = false,
  focusInlineIntent = null,
  onFocusInlineIntentConsumed,
  onActivateStep,
}: SmartChecklistItemRowProps) {
  const glyph = smartChecklistStatusGlyph(item.status, done);
  const note = item.note?.trim();
  const feedback = item.feedback ?? [];
  const attachments = item.attachments ?? [];
  const linkList = item.links ?? [];
  const historyList = item.history ?? [];
  const updatedLabel = formatSmartChecklistUpdatedAt(item.updatedAt);
  const inlineActions = item.inlineActions ?? deriveChecklistInlineActions(item, allowMutate);
  const commentCount = feedback.length;
  const attachmentCount = attachments.length;
  const linkCount = linkList.length;
  const historyCount = historyList.length;
  const hasCompactCounters =
    commentCount > 0 || attachmentCount > 0 || linkCount > 0 || historyCount > 0;
  const commentSignalState = commentCount > 0 ? 'has-comments' : 'none';

  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
  const [linksExpanded, setLinksExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [feedbackAutoCompose, setFeedbackAutoCompose] = useState(false);
  const [attachmentAutoCompose, setAttachmentAutoCompose] = useState(false);
  const [linksAutoCompose, setLinksAutoCompose] = useState(false);
  const [historyAutoCompose, setHistoryAutoCompose] = useState(false);
  const dualPaneCtx = useChecklistDualPaneFocusOptional();

  /** Sync focused step to RIGHT summary only — no duplicate quick-action panels (RPC dedup). */
  const syncRightPaneFocus = () => {
    if (dualPaneCtx?.dualPaneEnabled) {
      dualPaneCtx.setFocusedChecklistItemId(item.id);
      dualPaneCtx.setFocusedItem(item);
      dualPaneCtx.setDetailSection(null);
    }
  };

  /** CENTER inline panels — authority: quick actions open here first (PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK). */
  const openCenterInlineSection = (
    section: ChecklistDetailSection,
    options?: { autoCompose?: boolean },
  ) => {
    onActivateStep?.();
    setFeedbackExpanded(false);
    setAttachmentsExpanded(false);
    setLinksExpanded(false);
    setHistoryExpanded(false);
    setFeedbackAutoCompose(false);
    setAttachmentAutoCompose(false);
    setLinksAutoCompose(false);
    setHistoryAutoCompose(false);

    switch (section) {
      case 'feedback':
        setFeedbackExpanded(true);
        if (options?.autoCompose) setFeedbackAutoCompose(true);
        break;
      case 'attachments':
        setAttachmentsExpanded(true);
        if (options?.autoCompose) setAttachmentAutoCompose(true);
        break;
      case 'links':
        setLinksExpanded(true);
        if (options?.autoCompose) setLinksAutoCompose(true);
        break;
      case 'history':
        setHistoryExpanded(true);
        if (options?.autoCompose) setHistoryAutoCompose(true);
        break;
      default:
        break;
    }

    if (!navigatorOnly) ensureLayoutExpanded();
    syncRightPaneFocus();
  };

  const anyPanelExpanded =
    feedbackExpanded || attachmentsExpanded || linksExpanded || historyExpanded;

  const ensureLayoutExpanded = () => {
    if (!layoutExpanded) onToggleLayout?.(true);
  };

  const closeAllPanels = () => {
    setFeedbackExpanded(false);
    setAttachmentsExpanded(false);
    setLinksExpanded(false);
    setHistoryExpanded(false);
    setFeedbackAutoCompose(false);
    setAttachmentAutoCompose(false);
    setLinksAutoCompose(false);
    setHistoryAutoCompose(false);
  };

  const handleAddFeedback = (message: string) => {
    onAddFeedback?.(message);
    ensureLayoutExpanded();
    setFeedbackExpanded(true);
  };

  const handleFeedbackAction = (willOpen: boolean) => {
    if (willOpen) openCenterInlineSection('feedback', { autoCompose: allowMutate });
    else {
      setFeedbackExpanded(false);
      setFeedbackAutoCompose(false);
    }
  };

  const handleAttachmentAction = (willOpen: boolean) => {
    if (willOpen) openCenterInlineSection('attachments', { autoCompose: allowMutate });
    else {
      setAttachmentsExpanded(false);
      setAttachmentAutoCompose(false);
    }
  };

  const handleLinksAction = (willOpen: boolean) => {
    if (willOpen) openCenterInlineSection('links', { autoCompose: allowMutate });
    else {
      setLinksExpanded(false);
      setLinksAutoCompose(false);
    }
  };

  const handleHistoryAction = (willOpen: boolean) => {
    if (willOpen) openCenterInlineSection('history', { autoCompose: allowMutate });
    else {
      setHistoryExpanded(false);
      setHistoryAutoCompose(false);
    }
  };

  const openFeedbackView = () => openCenterInlineSection('feedback');

  const openAttachmentView = () => openCenterInlineSection('attachments');

  const openLinksView = () => openCenterInlineSection('links');

  const openHistoryView = () => openCenterInlineSection('history');

  useEffect(() => {
    if (!focusInlineIntent) return;
    openCenterInlineSection(focusInlineIntent, { autoCompose: focusInlineIntent === 'feedback' });
    onFocusInlineIntentConsumed?.();
  }, [focusInlineIntent]); // eslint-disable-line react-hooks/exhaustive-deps -- one-shot intent per focus bar action

  const handleAddManualHistoryNote = (message: string) => {
    onAddManualHistoryNote?.(message);
    openCenterInlineSection('history');
  };

  const rowClass = [
    'work-inbox-checklist__row',
    'work-inbox-smart-checklist__row',
    isArchived ? 'work-inbox-smart-checklist__row--archived' : null,
    !isArchived && layoutExpanded ? 'work-inbox-smart-checklist__row--expanded' : null,
    !isArchived && !layoutExpanded ? 'work-inbox-smart-checklist__row--compact' : null,
    crossFocusHighlighted ? 'work-inbox-smart-checklist__row--cross-focus' : null,
    interactionState === 'pending' ? 'work-inbox-smart-checklist__row--pending' : null,
    interactionState === 'saved' ? 'work-inbox-smart-checklist__row--saved' : null,
    interactionState === 'failed' ? 'work-inbox-smart-checklist__row--failed' : null,
    interactionState === 'disabled' ? 'work-inbox-smart-checklist__row--disabled' : null,
    focusState === 'focused' ? 'work-inbox-smart-checklist__row--focused' : null,
    focusState === 'dimmed' ? 'work-inbox-smart-checklist__row--dimmed' : null,
    focusState === 'none' ? 'work-inbox-smart-checklist__row--focus-none' : null,
    navigatorOnly ? 'work-inbox-smart-checklist__row--navigator-only' : null,
    anyPanelExpanded ? 'work-inbox-smart-checklist__row--center-inline-open' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const showCenterInlinePanels = navigatorOnly && anyPanelExpanded;
  const showLegacyExpandedBody = !navigatorOnly && layoutExpanded;

  const showInlineControls =
    !densityMode ||
    focusState === 'focused' ||
    layoutExpanded ||
    anyPanelExpanded ||
    crossFocusHighlighted;

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('input, button, a, textarea, select, label'));
  };

  const handleHeaderFocusClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!onActivateStep) return;
    if ('target' in e && isInteractiveTarget(e.target)) return;
    onActivateStep();
  };

  const inlineActionPanels = (
    <>
      <div id={`checklist-feedback-${item.id}`}>
        <ChecklistFeedbackPanel
          feedback={feedback}
          expanded={feedbackExpanded}
          allowMutate={allowMutate && !isArchived}
          busy={busy}
          autoCompose={feedbackAutoCompose}
          onComposeConsumed={() => setFeedbackAutoCompose(false)}
          onAddFeedback={handleAddFeedback}
        />
      </div>
      <div id={`checklist-attachment-${item.id}`}>
        <ChecklistAttachmentPanel
          attachments={attachments}
          expanded={attachmentsExpanded}
          allowMutate={allowMutate && !isArchived}
          busy={busy}
          uploadBusy={uploadAttachmentBusy}
          taskAttachments={taskAttachments}
          autoCompose={attachmentAutoCompose}
          onComposeConsumed={() => setAttachmentAutoCompose(false)}
          onRegister={onRegisterAttachment}
          onRegisterFromTask={onRegisterAttachmentFromTask}
          onUploadFile={onUploadAttachmentFile}
          onRemove={onRemoveAttachment}
        />
      </div>
      <div id={`checklist-link-${item.id}`}>
        <ChecklistLinkPanel
          links={linkList}
          expanded={linksExpanded}
          allowMutate={allowMutate && !isArchived}
          busy={busy}
          taskAttachments={taskAttachments}
          autoCompose={linksAutoCompose}
          onComposeConsumed={() => setLinksAutoCompose(false)}
          onRegister={onRegisterLink}
          onRegisterFromTask={onRegisterLinkFromTask}
          onRemove={onRemoveLink}
        />
      </div>
      <div id={`checklist-history-${item.id}`}>
        <ChecklistHistoryPanel
          history={historyList}
          expanded={historyExpanded}
          allowMutate={allowMutate && !isArchived}
          busy={busy}
          autoCompose={historyAutoCompose}
          onComposeConsumed={() => setHistoryAutoCompose(false)}
          onAddManualNote={handleAddManualHistoryNote}
        />
      </div>
    </>
  );

  return (
    <li
      id={checklistDomId}
      className={rowClass}
      data-checklist-item-id={item.id}
      data-checklist-step-id={item.id}
      data-step-anchor="true"
      data-deep-link-target={crossFocusHighlighted ? 'true' : undefined}
      data-checklist-interaction-state={interactionState}
      data-checklist-focus-state={focusState}
      data-checklist-focused-step-id={focusState === 'focused' ? item.id : undefined}
      data-checklist-comment-signal={commentSignalState}
      data-checklist-comment-count={commentCount}
      data-cbv-checklist-item={item.id}
      data-checklist-center-inline-open={anyPanelExpanded ? 'true' : undefined}
    >
      <div className="work-inbox-smart-checklist__main">
        <div
          className={
            onActivateStep
              ? 'work-inbox-smart-checklist__header work-inbox-smart-checklist__header--focusable'
              : 'work-inbox-smart-checklist__header'
          }
          role={onActivateStep ? 'button' : undefined}
          tabIndex={onActivateStep ? 0 : undefined}
          onClick={onActivateStep ? handleHeaderFocusClick : undefined}
          onKeyDown={
            onActivateStep
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleHeaderFocusClick(e);
                  }
                }
              : undefined
          }
        >
          <label
            className="work-inbox-focus-card__check work-inbox-smart-checklist__check work-inbox-smart-checklist__check--completion-only"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={done}
              disabled={!allowMutate || busy || isArchived}
              onChange={() => onToggle?.()}
              onClick={(e) => e.stopPropagation()}
              aria-label={done ? 'Đã xong' : 'Chưa xong'}
            />
            <span className="work-inbox-checklist__status" aria-hidden>
              {glyph}
            </span>
          </label>
          {editingTitle ? (
            <input
              type="text"
              className="work-inbox-checklist__edit-input work-inbox-smart-checklist__title-input"
              value={titleDraft}
              disabled={!allowMutate || busy}
              onChange={(e) => onTitleDraftChange?.(e.target.value)}
              onBlur={() => onSaveTitle?.()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveTitle?.();
                if (e.key === 'Escape') onCancelEdit?.();
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span
              className={
                done
                  ? 'work-inbox-checklist__title work-inbox-checklist__title--done work-inbox-smart-checklist__title'
                  : 'work-inbox-checklist__title work-inbox-smart-checklist__title'
              }
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (allowMutate) onStartEditTitle?.();
              }}
              title={allowMutate ? 'Nhấp để chọn bước · nhấp đúp để sửa tên' : 'Nhấp để chọn bước'}
            >
              {item.title}
            </span>
          )}

          <div
            className="work-inbox-smart-checklist__header-actions"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {densityMode && !showInlineControls && hasCompactCounters ? (
              <span
                className="work-inbox-smart-checklist__compact-counters"
                title="Chọn bước để mở Phản hồi / Tài liệu / Liên kết / Lịch sử"
                aria-label="Tóm tắt phản hồi và tài liệu bước"
              >
                {commentCount > 0 ? (
                  <span className="work-inbox-smart-checklist__compact-counter">💬 {commentCount}</span>
                ) : null}
                {attachmentCount > 0 ? (
                  <span className="work-inbox-smart-checklist__compact-counter">📎 {attachmentCount}</span>
                ) : null}
                {linkCount > 0 ? (
                  <span className="work-inbox-smart-checklist__compact-counter">🔗 {linkCount}</span>
                ) : null}
                {historyCount > 0 ? (
                  <span className="work-inbox-smart-checklist__compact-counter">🕒 {historyCount}</span>
                ) : null}
              </span>
            ) : null}
            {onCopyStepLink ? (
              <button
                type="button"
                className="work-inbox-smart-checklist__step-link-btn"
                disabled={busy}
                title={copyStepLinkTitle ?? 'Copy link bước'}
                aria-label={copyStepLinkTitle ?? 'Copy link bước'}
                onClick={() => onCopyStepLink()}
              >
                {copyStepLinkTitle ?? 'Copy link bước'}
              </button>
            ) : null}
            {allowMutate ? (
              <>
              <button
                type="button"
                className="work-inbox-smart-checklist__edit-btn"
                disabled={busy}
                onClick={() => {
                  ensureLayoutExpanded();
                  onStartEditTitle?.();
                }}
              >
                Sửa
              </button>
              <ChecklistItemCrudMenu
                allowMutate={allowMutate}
                isArchived={isArchived}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                busy={busy}
                onEdit={() => {
                  ensureLayoutExpanded();
                  onStartEditTitle?.();
                }}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onArchive={onArchive}
                onRestore={onRestore}
              />
              </>
            ) : null}
          </div>
        </div>

        {isArchived ? (
          <p className="work-inbox-smart-checklist__archived-badge">Đã lưu trữ</p>
        ) : null}
        {interactionMessage ? (
          <p className="work-inbox-smart-checklist__interaction-hint" role="status">
            {interactionMessage}
          </p>
        ) : null}
        {showInlineControls ? (
          <p
            className={
              commentCount > 0
                ? 'work-inbox-smart-checklist__comment-signal work-inbox-smart-checklist__comment-signal--has-comments'
                : 'work-inbox-smart-checklist__comment-signal work-inbox-smart-checklist__comment-signal--none'
            }
          >
            {commentCount > 0 ? `💬 Phản hồi (${commentCount})` : '💬 Phản hồi (0)'}
          </p>
        ) : null}

        {showInlineControls && !layoutExpanded && note ? (
          <p className="work-inbox-smart-checklist__note work-inbox-smart-checklist__note--compact" title={note}>
            {note}
          </p>
        ) : null}

        {showInlineControls ? (
          <ChecklistInlineActionRow
            actions={inlineActions}
            feedbackActive={feedbackExpanded}
            attachmentActive={attachmentsExpanded}
            linksActive={linksExpanded}
            historyActive={historyExpanded}
            busy={busy}
            onFeedbackAction={handleFeedbackAction}
            onAttachmentAction={handleAttachmentAction}
            onLinksAction={handleLinksAction}
            onHistoryAction={handleHistoryAction}
          />
        ) : null}

        {showInlineControls && !navigatorOnly && !layoutExpanded && !anyPanelExpanded ? (
          <ChecklistItemLatestPreview
            feedback={feedback}
            attachments={attachments}
            links={linkList}
            history={historyList}
            onOpenFeedback={openFeedbackView}
            onOpenAttachments={openAttachmentView}
            onOpenLinks={openLinksView}
            onOpenHistory={openHistoryView}
          />
        ) : null}

        {showCenterInlinePanels ? (
          <div
            className="work-inbox-smart-checklist__center-inline-panels"
            data-checklist-center-inline="true"
            data-checklist-item-id={item.id}
          >
            {inlineActionPanels}
          </div>
        ) : null}

        {showLegacyExpandedBody ? (
          <div className="work-inbox-smart-checklist__expanded-body">
            {allowMutate ? (
              <div className="work-inbox-smart-checklist__crud-actions">
                <button
                  type="button"
                  className="work-inbox-smart-checklist__crud-link"
                  disabled={busy || editingTitle}
                  onClick={() => onStartEditTitle?.()}
                >
                  Đổi tên bước
                </button>
                <button
                  type="button"
                  className="work-inbox-smart-checklist__crud-link"
                  disabled={busy || editingNote}
                  onClick={() => onStartEditNote?.()}
                >
                  Ghi chú bước
                </button>
              </div>
            ) : null}

            {editingNote ? (
              <div className="work-inbox-smart-checklist__note-editor">
                <textarea
                  className="work-inbox-checklist__edit-input work-inbox-smart-checklist__note-input"
                  rows={2}
                  value={noteDraft}
                  disabled={!allowMutate || busy}
                  placeholder="Ghi chú cho bước này…"
                  onChange={(e) => onNoteDraftChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) onSaveNote?.();
                    if (e.key === 'Escape') onCancelEdit?.();
                  }}
                  autoFocus
                />
                <div className="work-inbox-smart-checklist__note-editor-actions">
                  <button
                    type="button"
                    className="work-inbox-smart-checklist__save-btn"
                    disabled={busy}
                    onClick={() => onSaveNote?.()}
                  >
                    Lưu ghi chú
                  </button>
                  <button
                    type="button"
                    className="work-inbox-smart-checklist__cancel-btn"
                    disabled={busy}
                    onClick={() => onCancelEdit?.()}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : note ? (
              <p className="work-inbox-smart-checklist__note" title={note}>
                {note}
              </p>
            ) : null}

            {!anyPanelExpanded ? (
              <ChecklistItemLatestPreview
                feedback={feedback}
                attachments={attachments}
                links={linkList}
                history={historyList}
                onOpenFeedback={openFeedbackView}
                onOpenAttachments={openAttachmentView}
                onOpenLinks={openLinksView}
                onOpenHistory={openHistoryView}
              />
            ) : null}

            <p className="work-inbox-smart-checklist__meta-secondary" aria-label="Tóm tắt phụ">
              <span>Cập nhật: {updatedLabel}</span>
            </p>

            {inlineActionPanels}

            <button
              type="button"
              className="work-inbox-smart-checklist__collapse-btn"
              disabled={busy}
              onClick={() => {
                closeAllPanels();
                onToggleLayout?.(false);
              }}
            >
              Thu nhỏ
            </button>
          </div>
        ) : null}

      </div>
    </li>
  );
}
