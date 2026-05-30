import { PAUSE_REASON_OPTIONS } from '../workInboxActionTypes';

interface PauseReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reasonLabel: string) => void;
}

export function PauseReasonDialog({ open, onClose, onConfirm }: PauseReasonDialogProps) {
  if (!open) return null;

  return (
    <div className="work-inbox-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="work-inbox-dialog"
        role="dialog"
        aria-labelledby="pause-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="pause-dialog-title" className="text-sm font-semibold text-operational-text">
          Tạm dừng — chọn lý do
        </h3>
        <ul className="mt-3 space-y-1">
          {PAUSE_REASON_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className="work-inbox-dialog__option w-full text-left text-sm"
                onClick={() => onConfirm(opt.statusNote)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-secondary mt-3 w-full text-xs" onClick={onClose}>
          Hủy
        </button>
      </div>
    </div>
  );
}
