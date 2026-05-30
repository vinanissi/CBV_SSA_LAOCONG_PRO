import { useState } from 'react';
import { api } from '@/api/client';
import type { CreateTaskBody } from '@/api/contracts';
import { TASK_PRIORITIES } from '@/api/contracts';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';
import { LoadingState } from '@/components/states/LoadingState';

const ASSIGNEE_OPTIONS = [
  { id: 'USR-LOCAL-STAFF', label: 'Nhân viên Local' },
  { id: 'USR-LOCAL-MGR', label: 'Quản lý Local' },
  { id: 'USR-LOCAL-FIN', label: 'Tài chính Local' },
  { id: 'USR-LOCAL-HS', label: 'Hồ sơ Local' },
];

interface TaskCreateFormProps {
  onCreated?: (taskId: string) => void;
}

export function TaskCreateForm({ onCreated }: TaskCreateFormProps) {
  const { capability, closeCreate, onTaskChanged } = useTaskWrite();
  const [form, setForm] = useState<CreateTaskBody>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignee: '',
    relatedHoSoId: '',
    relatedFinanceId: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (capability?.writeMode === 'LOCKED') {
    return (
      <div className="rounded-lg border border-border/60 bg-surface-overlay p-6 text-center">
        <p className="text-sm text-slate-300">Chức năng ghi chưa được bật cho môi trường này.</p>
      </div>
    );
  }

  if (!capability?.canCreate) {
    return (
      <div className="rounded-lg border border-border/60 bg-surface-overlay p-6 text-center">
        <p className="text-sm text-slate-300">Bạn không có quyền tạo việc.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload: CreateTaskBody = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      assignee: form.assignee || undefined,
      relatedHoSoId: form.relatedHoSoId || undefined,
      relatedFinanceId: form.relatedFinanceId || undefined,
      note: form.note,
      module: 'TASK',
    };

    const res = await api.createTask(payload);
    setLoading(false);

    if (!res.ok || !res.data) {
      setError(res.errors[0] ?? 'Không tạo được việc — thử lại');
      return;
    }

    setSuccess('Đã tạo việc thành công');
    onTaskChanged('snapshot');
    onCreated?.(res.data.task.taskId);
    setTimeout(() => {
      closeCreate();
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Tạo việc</h2>
        <p className="text-sm text-slate-400">Điền thông tin việc cần xử lý</p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm text-slate-300">Tên việc *</span>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-slate-300">Mô tả</span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Người phụ trách</span>
          <select
            value={form.assignee}
            onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
            className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
          >
            <option value="">— Chọn —</option>
            {ASSIGNEE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Ưu tiên</span>
          <select
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm text-slate-300">Hạn xử lý</span>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Liên kết hồ sơ</span>
          <input
            value={form.relatedHoSoId}
            onChange={(e) => setForm((f) => ({ ...f, relatedHoSoId: e.target.value }))}
            placeholder="Mã hồ sơ"
            className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Liên kết tài chính</span>
          <input
            value={form.relatedFinanceId}
            onChange={(e) => setForm((f) => ({ ...f, relatedFinanceId: e.target.value }))}
            placeholder="Mã khoản"
            className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm text-slate-300">Ghi chú</span>
        <input
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          className="w-full rounded-md border border-border bg-surface-content px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-sm text-status-error">{error}</p>}
      {success && <p className="text-sm text-status-ok">{success}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Đang tạo...' : 'Tạo việc'}
        </button>
        <button type="button" onClick={closeCreate} className="btn-ghost">
          Hủy
        </button>
      </div>

      {loading && <LoadingState message="Đang lưu việc..." />}
    </form>
  );
}

export function TaskCreateModal() {
  const { createOpen, closeCreate } = useTaskWrite();
  if (!createOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface-raised p-6 shadow-xl">
        <TaskCreateForm />
        <button type="button" onClick={closeCreate} className="sr-only">
          Đóng
        </button>
      </div>
    </div>
  );
}
