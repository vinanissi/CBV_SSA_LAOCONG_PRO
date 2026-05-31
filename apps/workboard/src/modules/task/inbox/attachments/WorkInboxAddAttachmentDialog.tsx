import { useEffect, useState } from 'react';
import type { WorkInboxAttachmentForm } from './workInboxAttachmentsTypes';
import { DEFAULT_ATTACHMENT_FORM } from './workInboxAttachmentsTypes';

interface WorkInboxAddAttachmentDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (form: WorkInboxAttachmentForm) => Promise<{ ok: boolean; error?: string }>;
  onPasteClipboard?: () => Promise<Partial<WorkInboxAttachmentForm> | null>;
}

export function WorkInboxAddAttachmentDialog({
  open,
  loading = false,
  onClose,
  onSubmit,
  onPasteClipboard,
}: WorkInboxAddAttachmentDialogProps) {
  const [form, setForm] = useState<WorkInboxAttachmentForm>(DEFAULT_ATTACHMENT_FORM);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(DEFAULT_ATTACHMENT_FORM);
      setLocalError(null);
    }
  }, [open]);

  if (!open) return null;

  const handlePaste = async () => {
    if (!onPasteClipboard) return;
    const pasted = await onPasteClipboard();
    if (!pasted) {
      setLocalError('Không đọc được clipboard');
      return;
    }
    setForm((prev) => ({ ...prev, ...pasted }));
    setLocalError(null);
  };

  const handleSave = async () => {
    setLocalError(null);
    const res = await onSubmit(form);
    if (!res.ok) {
      setLocalError(res.error ?? 'Không lưu được');
      return;
    }
    onClose();
  };

  return (
    <div className="work-inbox-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="work-inbox-dialog work-inbox-attachment-dialog"
        role="dialog"
        aria-labelledby="wi-attach-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="wi-attach-dialog-title" className="work-inbox-dialog__title">
          Đính kèm tài liệu
        </h3>
        <p className="work-inbox-attachment-dialog__hint">V1: Link hoặc nội dung dán — chưa hỗ trợ upload file.</p>

        <label className="work-inbox-attachment-dialog__label">
          Loại
          <select
            className="work-inbox-attachment-dialog__select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'LINK' | 'TEXT' }))}
          >
            <option value="LINK">Link</option>
            <option value="TEXT">Nội dung dán</option>
          </select>
        </label>

        <label className="work-inbox-attachment-dialog__label">
          Tiêu đề
          <input
            type="text"
            className="work-inbox-attachment-dialog__input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Tên hiển thị"
          />
        </label>

        {form.type === 'LINK' ? (
          <label className="work-inbox-attachment-dialog__label">
            URL
            <input
              type="url"
              className="work-inbox-attachment-dialog__input"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </label>
        ) : (
          <label className="work-inbox-attachment-dialog__label">
            Nội dung
            <textarea
              className="work-inbox-attachment-dialog__textarea"
              rows={4}
              value={form.textContent}
              onChange={(e) => setForm((f) => ({ ...f, textContent: e.target.value }))}
              placeholder="Dán nội dung văn bản"
            />
          </label>
        )}

        <label className="work-inbox-attachment-dialog__label">
          Ghi chú (tuỳ chọn)
          <input
            type="text"
            className="work-inbox-attachment-dialog__input"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </label>

        {localError ? <p className="work-inbox-attachment-dialog__error">{localError}</p> : null}

        <div className="work-inbox-dialog__actions">
          {onPasteClipboard ? (
            <button type="button" className="btn-secondary" onClick={() => void handlePaste()}>
              Dán từ clipboard
            </button>
          ) : null}
          <button type="button" className="btn-secondary" onClick={onClose}>
            Huỷ
          </button>
          <button type="button" className="btn-primary" disabled={loading} onClick={() => void handleSave()}>
            {loading ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
