import { useState } from 'react';
import type { UserContext } from '@/api/contracts';
import { useWorkInboxChecklistRuntime } from './useWorkInboxChecklistRuntime';

interface WorkInboxChecklistSectionProps {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
  /** Tighter row spacing in Focus Mode (layout only). */
  dense?: boolean;
}

export function WorkInboxChecklistSection({
  taskId,
  operator,
  canMutate = true,
  dense = false,
}: WorkInboxChecklistSectionProps) {
  const {
    items,
    loading,
    error,
    mutatingId,
    canMutate: allowMutate,
    createItem,
    updateItem,
    toggleItem,
    deleteItem,
    reload,
  } = useWorkInboxChecklistRuntime({ taskId, operator, canMutate });

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditDraft(title);
  };

  const commitEdit = async (id: string) => {
    if (editDraft.trim() === '') {
      setEditingId(null);
      return;
    }
    await updateItem(id, editDraft);
    setEditingId(null);
  };

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    const res = await createItem(title);
    if (res.ok) setNewTitle('');
  };

  return (
    <section
      className={
        dense
          ? 'work-inbox-focus-card work-inbox-focus-card--checklist work-inbox-focus-card--checklist-dense'
          : 'work-inbox-focus-card work-inbox-focus-card--checklist'
      }
      aria-label="Checklist việc"
    >
      <h3 className="work-inbox-focus-card__title">CHECKLIST</h3>

      {loading && items.length === 0 ? (
        <p className="work-inbox-focus-card__body work-inbox-checklist__hint">Đang tải checklist…</p>
      ) : null}

      {error ? (
        <p className="work-inbox-checklist__error" role="alert">
          {error}{' '}
          <button type="button" className="work-inbox-checklist__retry" onClick={() => void reload()}>
            Thử lại
          </button>
        </p>
      ) : null}

      <ul className="work-inbox-focus-card__checklist">
        {items.map((item) => {
          const done = item.isDone || item.status === 'done';
          const busy = mutatingId === item.checklistId;
          return (
            <li key={item.checklistId} className="work-inbox-checklist__row">
              <label className="work-inbox-focus-card__check">
                <input
                  type="checkbox"
                  checked={done}
                  disabled={!allowMutate || busy}
                  onChange={() => void toggleItem(item.checklistId)}
                  aria-label={done ? 'Đã xong' : 'Chưa xong'}
                />
                <span className="work-inbox-checklist__status" aria-hidden>
                  {done ? '☑' : '☐'}
                </span>
                {editingId === item.checklistId ? (
                  <input
                    type="text"
                    className="work-inbox-checklist__edit-input"
                    value={editDraft}
                    disabled={!allowMutate || busy}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onBlur={() => void commitEdit(item.checklistId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void commitEdit(item.checklistId);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className={done ? 'work-inbox-checklist__title work-inbox-checklist__title--done' : 'work-inbox-checklist__title'}
                    onDoubleClick={() => allowMutate && startEdit(item.checklistId, item.title)}
                    title={allowMutate ? 'Nhấp đúp để sửa' : undefined}
                  >
                    {item.title}
                  </span>
                )}
              </label>
              {allowMutate ? (
                <button
                  type="button"
                  className="work-inbox-checklist__delete"
                  disabled={busy}
                  onClick={() => void deleteItem(item.checklistId)}
                  aria-label="Xóa mục"
                >
                  ×
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {items.length === 0 && !loading ? (
        <p className="work-inbox-checklist__hint">Chưa có mục checklist — thêm mục đầu tiên bên dưới.</p>
      ) : null}

      {allowMutate ? (
        <div className={dense ? 'work-inbox-checklist__add work-inbox-checklist__add--inline' : 'work-inbox-checklist__add'}>
          <input
            type="text"
            className="work-inbox-checklist__add-input"
            placeholder="Nội dung mục mới"
            value={newTitle}
            disabled={mutatingId === '__create__'}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleAdd();
            }}
          />
          <button
            type="button"
            className="work-inbox-checklist__add-btn"
            disabled={!newTitle.trim() || mutatingId === '__create__'}
            onClick={() => void handleAdd()}
          >
            + Thêm mục
          </button>
        </div>
      ) : null}
    </section>
  );
}
