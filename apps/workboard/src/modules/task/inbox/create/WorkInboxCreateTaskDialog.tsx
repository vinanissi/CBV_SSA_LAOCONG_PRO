import type { UserContext } from '@/api/contracts';
import { useWorkInboxCreateTaskRuntime } from './useWorkInboxCreateTaskRuntime';
import { canRoleCreateWorkInboxTask } from './workInboxCreateTaskTypes';

interface WorkInboxCreateTaskDialogProps {
  open: boolean;
  operator: UserContext;
  onClose: () => void;
  onCreated?: (task: import('@/api/contracts').TaskDetail) => void;
}

export function WorkInboxCreateTaskDialog({
  open,
  operator,
  onClose,
  onCreated,
}: WorkInboxCreateTaskDialogProps) {
  const { form, setForm, loading, error, submit, resetForm } = useWorkInboxCreateTaskRuntime({
    operator,
    onCreated: (result) => {
      if (result.task) onCreated?.(result.task);
    },
  });

  if (!open) return null;

  if (!canRoleCreateWorkInboxTask(operator.role)) {
    return (
      <div className="work-inbox-dialog-backdrop" role="presentation" onClick={onClose}>
        <div
          className="work-inbox-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-inbox-create-title"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-operational-muted">Bạn không có quyền tạo việc.</p>
          <button type="button" className="btn-secondary mt-3" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await submit();
    if (result.ok) onClose();
  }

  function handleCancel() {
    resetForm();
    onClose();
  }

  return (
    <div className="work-inbox-dialog-backdrop" role="presentation" onClick={handleCancel}>
      <form
        className="work-inbox-dialog space-y-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-inbox-create-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 id="work-inbox-create-title" className="text-base font-semibold text-operational-text">
          Tạo việc mới
        </h2>
        <p className="text-xs text-operational-muted">Tạo việc vận hành — chỉ gán cho bạn</p>

        <label className="block space-y-1 text-sm">
          <span>Tên việc *</span>
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="work-inbox-dialog__input w-full"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span>Mô tả</span>
          <textarea
            rows={3}
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="work-inbox-dialog__input w-full"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span>Ưu tiên</span>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value as typeof form.priority }))
            }
            className="work-inbox-dialog__input w-full"
          >
            <option value="LOW">Thấp</option>
            <option value="NORMAL">Bình thường</option>
            <option value="HIGH">Cao</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span>Ngày hạn</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="work-inbox-dialog__input w-full"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span>SĐT liên quan</span>
          <input
            value={form.relatedPhone}
            onChange={(e) => setForm((f) => ({ ...f, relatedPhone: e.target.value }))}
            className="work-inbox-dialog__input w-full"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span>Biển số</span>
          <input
            value={form.relatedPlate}
            onChange={(e) => setForm((f) => ({ ...f, relatedPlate: e.target.value }))}
            className="work-inbox-dialog__input w-full"
          />
        </label>

        {error && (
          <p className="text-xs text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={handleCancel} disabled={loading}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang tạo…' : 'Tạo việc'}
          </button>
        </div>
      </form>
    </div>
  );
}
