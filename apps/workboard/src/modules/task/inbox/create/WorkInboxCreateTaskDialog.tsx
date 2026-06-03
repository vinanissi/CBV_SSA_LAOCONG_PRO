import { useState } from 'react';
import type { UserContext } from '@/api/contracts';
import { useWorkInboxCreateTaskRuntime } from './useWorkInboxCreateTaskRuntime';
import { relatedEntityPlaceholder } from './resolveTaskRelatedEntity';
import { TASK_RELATED_ENTITY_TYPE_CATALOG } from './taskRelatedEntityInputSchemas';
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
  const { form, setForm, loading, error, submit, resetForm, catalog, autofillPreview } =
    useWorkInboxCreateTaskRuntime({
      operator,
      onCreated: (result) => {
        if (result.task) onCreated?.(result.task);
      },
    });

  const [showAutofill, setShowAutofill] = useState(false);

  const relatedPlaceholder = relatedEntityPlaceholder(form.relatedEntityType);

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

  const showTaskType = catalog.taskTypes.length > 0;
  const showUnitSelect = catalog.units.length > 1;
  const showUnitReadonly = catalog.units.length === 1;

  return (
    <div className="work-inbox-dialog-backdrop" role="presentation" onClick={handleCancel}>
      <form
        className="work-inbox-dialog work-inbox-create-dialog space-y-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-inbox-create-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        data-cbv-task-creation-model="minimal-autofill-v1"
      >
        <h2 id="work-inbox-create-title" className="text-base font-semibold text-operational-text">
          Tạo việc mới
        </h2>
        <p className="text-xs text-operational-muted">
          Chỉ nhập thông tin nghiệp vụ — hệ thống tự điền mã việc, trạng thái và audit.
        </p>

        <fieldset className="work-inbox-create-section">
          <legend className="work-inbox-create-section__title">Nội dung việc</legend>
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
              placeholder="Mô tả giúp người xử lý hiểu bối cảnh"
            />
          </label>
        </fieldset>

        <fieldset className="work-inbox-create-section">
          <legend className="work-inbox-create-section__title">Phân loại &amp; phân công</legend>

          {showTaskType ? (
            <label className="block space-y-1 text-sm">
              <span>Loại việc *</span>
              <select
                required={catalog.taskTypeRequired}
                value={form.taskTypeId}
                onChange={(e) => setForm((f) => ({ ...f, taskTypeId: e.target.value }))}
                className="work-inbox-dialog__input w-full"
              >
                <option value="">— Chọn loại việc —</option>
                {catalog.taskTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showUnitSelect ? (
            <label className="block space-y-1 text-sm">
              <span>Đơn vị *</span>
              <select
                required
                value={form.donViId}
                onChange={(e) => setForm((f) => ({ ...f, donViId: e.target.value }))}
                className="work-inbox-dialog__input w-full"
              >
                <option value="">— Chọn đơn vị —</option>
                {catalog.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showUnitReadonly ? (
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-600">Đơn vị:</span>{' '}
              {catalog.units[0]?.label}
            </p>
          ) : null}

          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-600">Người phụ trách:</span>{' '}
            {operator.displayName}
          </p>

          <label className="block space-y-1 text-sm">
            <span>Hạn xử lý</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
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
        </fieldset>

        <fieldset className="work-inbox-create-section">
          <legend className="work-inbox-create-section__title">Đối tượng liên quan</legend>
          <label className="block space-y-1 text-sm">
            <span>Loại đối tượng</span>
            <select
              value={form.relatedEntityType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  relatedEntityType: e.target.value,
                  relatedEntityValue: e.target.value ? f.relatedEntityValue : '',
                }))
              }
              className="work-inbox-dialog__input w-full"
            >
              <option value="">— Không chọn —</option>
              {TASK_RELATED_ENTITY_TYPE_CATALOG.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>Giá trị</span>
            <input
              value={form.relatedEntityValue}
              onChange={(e) => setForm((f) => ({ ...f, relatedEntityValue: e.target.value }))}
              className="work-inbox-dialog__input w-full"
              placeholder={relatedPlaceholder}
              disabled={!form.relatedEntityType}
            />
          </label>
        </fieldset>

        <div className="work-inbox-create-section">
          <button
            type="button"
            className="work-inbox-create-section__toggle"
            onClick={() => setShowAutofill((v) => !v)}
            aria-expanded={showAutofill}
          >
            Hệ thống tự điền {showAutofill ? '▾' : '▸'}
          </button>
          {showAutofill ? (
            <dl className="work-inbox-create-autofill mt-2">
              {autofillPreview.map((row) => (
                <div key={row.key} className="work-inbox-create-autofill__row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

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
