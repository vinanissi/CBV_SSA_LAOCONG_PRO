import { useEffect, useRef, useState } from 'react';
import type { WorkInboxAttachmentItem } from '@/modules/task/inbox/attachments/workInboxAttachmentsTypes';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import type { ChecklistAttachment } from './checklistAttachmentTypes';
import { formatAttachmentSizeLabel } from './smartChecklistFormat';

export interface ChecklistAttachmentPanelProps {
  attachments: ChecklistAttachment[];
  expanded: boolean;
  allowMutate?: boolean;
  busy?: boolean;
  uploadBusy?: boolean;
  taskAttachments?: WorkInboxAttachmentItem[];
  onRegister?: (input: { name: string; url?: string | null; mimeType?: string | null; size?: number | null; source?: string }) => void;
  onRegisterFromTask?: (ref: { title: string; url?: string; attachmentId?: string }) => void;
  onUploadFile?: (file: File) => void | Promise<void>;
  onRemove?: (attachmentId: string) => void;
  autoCompose?: boolean;
  onComposeConsumed?: () => void;
}

export function ChecklistAttachmentPanel({
  attachments,
  expanded,
  allowMutate = false,
  busy = false,
  uploadBusy = false,
  taskAttachments = [],
  onRegister,
  onRegisterFromTask,
  onUploadFile,
  onRemove,
  autoCompose = false,
  onComposeConsumed,
}: ChecklistAttachmentPanelProps) {
  const [composing, setComposing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const bridgeOn = isChecklistSheetBridgeEnabled();

  useEffect(() => {
    if (expanded && autoCompose && allowMutate) {
      setComposing(true);
      onComposeConsumed?.();
    }
  }, [expanded, autoCompose, allowMutate, onComposeConsumed]);

  if (!expanded) return null;

  const submitReference = () => {
    const name = nameDraft.trim();
    if (!name) return;
    onRegister?.({
      name,
      url: urlDraft.trim() || null,
      source: urlDraft.trim() ? 'url' : 'local',
    });
    setNameDraft('');
    setUrlDraft('');
    setComposing(false);
  };

  const onFilePicked = (file: File | undefined) => {
    if (!file) return;
    onRegister?.({
      name: file.name,
      mimeType: file.type || null,
      size: file.size,
      source: 'local',
    });
    setComposing(false);
  };

  const handleUploadPick = async (file: File | undefined) => {
    if (!file || !onUploadFile) return;
    setUploadMessage(`Đang tải: ${file.name}…`);
    try {
      await onUploadFile(file);
      setUploadMessage(`Đã tải lên: ${file.name}`);
    } catch {
      setUploadMessage(`Lỗi tải lên: ${file.name}`);
    }
  };

  const panelBusy = busy || uploadBusy;

  return (
    <div className="work-inbox-checklist-attachment" role="region" aria-label="Tài liệu đính kèm">
      <p className="work-inbox-checklist-attachment__heading">Tài liệu:</p>
      {attachments.length === 0 ? (
        <p className="work-inbox-checklist-attachment__empty">Chưa có tài liệu đính kèm.</p>
      ) : (
        <ul className="work-inbox-checklist-attachment__list">
          {attachments.map((att) => {
            const sizeLabel = formatAttachmentSizeLabel(att.size);
            const hasUrl = Boolean(att.url?.trim());
            return (
              <li key={att.id} className="work-inbox-checklist-attachment__row">
                {hasUrl ? (
                  <a
                    href={att.url!}
                    className="work-inbox-checklist-attachment__name work-inbox-checklist-attachment__name--link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {att.name}
                  </a>
                ) : (
                  <span className="work-inbox-checklist-attachment__name">{att.name}</span>
                )}
                {sizeLabel ? (
                  <span className="work-inbox-checklist-attachment__meta">{sizeLabel}</span>
                ) : null}
                {allowMutate ? (
                  <button
                    type="button"
                    className="work-inbox-checklist-attachment__remove"
                    disabled={panelBusy}
                    onClick={() => onRemove?.(att.id)}
                    aria-label={`Gỡ ${att.name}`}
                  >
                    ×
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {uploadMessage ? (
        <p className="work-inbox-checklist-attachment__upload-status" role="status">
          {uploadMessage}
        </p>
      ) : null}

      {allowMutate ? (
        <div className="work-inbox-checklist-attachment__composer">
          <input
            ref={uploadInputRef}
            type="file"
            className="sr-only"
            disabled={panelBusy || !bridgeOn}
            onChange={(e) => {
              void handleUploadPick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="work-inbox-checklist-attachment__upload"
            disabled={panelBusy || !bridgeOn || !onUploadFile}
            title={bridgeOn ? 'Tải tệp lên Google Drive' : 'Bật Sheet bridge để tải lên Drive'}
            onClick={() => uploadInputRef.current?.click()}
          >
            {uploadBusy ? 'Đang tải lên…' : '+ Tải tệp lên'}
          </button>

          {composing ? (
            <div className="work-inbox-checklist-attachment__form">
              <input
                type="text"
                className="work-inbox-checklist-attachment__input"
                placeholder="Tên tài liệu (vd. CCCD.pdf)"
                value={nameDraft}
                disabled={panelBusy}
                onChange={(e) => setNameDraft(e.target.value)}
              />
              <input
                type="url"
                className="work-inbox-checklist-attachment__input"
                placeholder="URL (tùy chọn)"
                value={urlDraft}
                disabled={panelBusy}
                onChange={(e) => setUrlDraft(e.target.value)}
              />
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                disabled={panelBusy}
                onChange={(e) => {
                  onFilePicked(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <div className="work-inbox-checklist-attachment__composer-actions">
                <button
                  type="button"
                  className="work-inbox-checklist-attachment__submit"
                  disabled={!nameDraft.trim() || panelBusy}
                  onClick={submitReference}
                >
                  Lưu tham chiếu
                </button>
                <button
                  type="button"
                  className="work-inbox-checklist-attachment__pick"
                  disabled={panelBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn tệp (metadata)
                </button>
                <button
                  type="button"
                  className="work-inbox-checklist-attachment__cancel"
                  disabled={panelBusy}
                  onClick={() => {
                    setComposing(false);
                    setNameDraft('');
                    setUrlDraft('');
                  }}
                >
                  Hủy
                </button>
              </div>
              {taskAttachments.length > 0 ? (
                <div className="work-inbox-checklist-attachment__task-refs">
                  <span className="work-inbox-checklist-attachment__task-refs-label">Từ task:</span>
                  {taskAttachments.slice(0, 5).map((ta) => (
                    <button
                      key={ta.attachmentId}
                      type="button"
                      className="work-inbox-checklist-attachment__task-ref-btn"
                      disabled={panelBusy}
                      onClick={() => {
                        onRegisterFromTask?.({
                          title: ta.title,
                          url: ta.url,
                          attachmentId: ta.attachmentId,
                        });
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
              className="work-inbox-checklist-attachment__add"
              disabled={panelBusy}
              onClick={() => setComposing(true)}
            >
              + Thêm tài liệu
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
