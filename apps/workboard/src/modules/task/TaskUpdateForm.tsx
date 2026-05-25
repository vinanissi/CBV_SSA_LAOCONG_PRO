import { useState } from 'react';
import { api } from '@/api/client';
import type { TaskDetail, UpdateTaskBody } from '@/api/contracts';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/api/contracts';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';
import { STATUS_LABELS } from '@/shared/constants';

interface TaskUpdateFormProps {
  task: TaskDetail;
  onUpdated?: (task: TaskDetail) => void;
}

export function TaskUpdateForm({ task, onUpdated }: TaskUpdateFormProps) {
  const { capability, onTaskChanged } = useTaskWrite();
  const [form, setForm] = useState<UpdateTaskBody>({
    status: task.status,
    assignee: task.ownerId,
    priority: task.priority,
    dueDate: task.dueDate,
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (capability?.writeMode === 'LOCKED') {
    return (
      <div className="rounded-md border border-border/60 bg-surface-overlay p-4">
        <p className="text-sm text-slate-400">Chức năng ghi chưa được bật cho môi trường này.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await api.updateTask(task.taskId, form);
    setLoading(false);

    if (!res.ok || !res.data) {
      setError(res.errors[0] ?? 'Không lưu được — thử lại');
      return;
    }

    setSuccess('Đã lưu cập nhật');
    onTaskChanged();
    onUpdated?.(res.data.task);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-border/50 pt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cập nhật việc</h4>

      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Trạng thái</span>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          className="w-full rounded-md border border-border bg-surface-content px-2 py-1.5 text-sm"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Ưu tiên</span>
          <select
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            className="w-full rounded-md border border-border bg-surface-content px-2 py-1.5 text-sm"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Hạn xử lý</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full rounded-md border border-border bg-surface-content px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Ghi chú xử lý</span>
        <textarea
          rows={2}
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          className="w-full rounded-md border border-border bg-surface-content px-2 py-1.5 text-sm"
        />
      </label>

      {error && <p className="text-xs text-status-error">{error}</p>}
      {success && <p className="text-xs text-status-ok">{success}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Đang lưu...' : 'Lưu cập nhật'}
      </button>
    </form>
  );
}
