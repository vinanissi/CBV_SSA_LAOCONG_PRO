import { useState } from 'react';

interface HandoffDialogProps {
  open: boolean;
  assigneeOptions: string[];
  onClose: () => void;
  onConfirm: (recipient: string, comment: string) => void;
}

export function HandoffDialog({ open, assigneeOptions, onClose, onConfirm }: HandoffDialogProps) {
  const [recipient, setRecipient] = useState('');
  const [comment, setComment] = useState('');

  if (!open) return null;

  return (
    <div className="work-inbox-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="work-inbox-dialog"
        role="dialog"
        aria-labelledby="handoff-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="handoff-dialog-title" className="text-sm font-semibold text-operational-text">
          Chuyển giao
        </h3>
        <label className="mt-3 block text-xs text-operational-muted">
          Người nhận
          <select
            className="work-inbox-dialog__input mt-1 w-full"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          >
            <option value="">— Chọn —</option>
            {assigneeOptions.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-2 block text-xs text-operational-muted">
          Ghi chú
          <textarea
            className="work-inbox-dialog__input mt-1 w-full"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Lý do chuyển giao…"
          />
        </label>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1 text-xs"
            disabled={!recipient.trim()}
            onClick={() => onConfirm(recipient.trim(), comment.trim())}
          >
            Xác nhận
          </button>
          <button type="button" className="btn-secondary flex-1 text-xs" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
