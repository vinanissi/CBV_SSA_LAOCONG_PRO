import { useEffect, useRef, useState } from 'react';

export interface ChecklistItemCrudMenuProps {
  allowMutate?: boolean;
  isArchived?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  busy?: boolean;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}

export function ChecklistItemCrudMenu({
  allowMutate = false,
  isArchived = false,
  canMoveUp = false,
  canMoveDown = false,
  busy = false,
  onEdit,
  onMoveUp,
  onMoveDown,
  onArchive,
  onRestore,
}: ChecklistItemCrudMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!allowMutate) return null;

  const pick = (fn?: () => void) => {
    fn?.();
    setOpen(false);
  };

  return (
    <div className="work-inbox-checklist-crud-menu" ref={rootRef}>
      <button
        type="button"
        className="work-inbox-checklist-crud-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy}
        title="Thêm thao tác"
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      {open ? (
        <div className="work-inbox-checklist-crud-menu__panel" role="menu">
          <button type="button" role="menuitem" onClick={() => pick(onEdit)}>
            Sửa
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!canMoveUp}
            onClick={() => pick(onMoveUp)}
          >
            Di chuyển lên
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!canMoveDown}
            onClick={() => pick(onMoveDown)}
          >
            Di chuyển xuống
          </button>
          {isArchived ? (
            <button type="button" role="menuitem" onClick={() => pick(onRestore)}>
              Khôi phục
            </button>
          ) : (
            <button type="button" role="menuitem" onClick={() => pick(onArchive)}>
              Lưu trữ
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
