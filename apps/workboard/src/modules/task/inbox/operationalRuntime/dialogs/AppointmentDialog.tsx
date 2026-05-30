import { useState } from 'react';

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { title: string; description: string; startAt: string; endAt: string }) => void;
}

export function AppointmentDialog({ open, onClose, onConfirm }: AppointmentDialogProps) {
  const [title, setTitle] = useState('Lịch hẹn với khách hàng');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  if (!open) return null;

  return (
    <div className="work-inbox-dialog-backdrop" role="presentation" onClick={onClose}>
      <div className="work-inbox-dialog" role="dialog" aria-labelledby="apt-dialog-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="apt-dialog-title" className="text-sm font-semibold text-operational-text">
          Tạo lịch hẹn
        </h3>
        <label className="mt-2 block text-xs">
          Tiêu đề
          <input className="work-inbox-dialog__input mt-1 w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="mt-2 block text-xs">
          Mô tả
          <textarea
            className="work-inbox-dialog__input mt-1 w-full"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="mt-2 block text-xs">
          Bắt đầu
          <input
            type="datetime-local"
            className="work-inbox-dialog__input mt-1 w-full"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </label>
        <label className="mt-2 block text-xs">
          Kết thúc
          <input
            type="datetime-local"
            className="work-inbox-dialog__input mt-1 w-full"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </label>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1 text-xs"
            onClick={() => onConfirm({ title, description, startAt, endAt })}
          >
            Tạo lịch hẹn
          </button>
          <button type="button" className="btn-secondary flex-1 text-xs" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
