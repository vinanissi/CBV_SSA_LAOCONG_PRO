export interface ChecklistListToolbarProps {
  allowMutate?: boolean;
  archivedVisible?: boolean;
  busy?: boolean;
  addTitle?: string;
  onAddTitleChange?: (value: string) => void;
  onAddStep?: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onToggleArchivedVisible?: () => void;
  onOpenTemplates?: () => void;
  templatesOpen?: boolean;
}

export function ChecklistListToolbar({
  allowMutate = false,
  archivedVisible = false,
  busy = false,
  addTitle = '',
  onAddTitleChange,
  onAddStep,
  onExpandAll,
  onCollapseAll,
  onToggleArchivedVisible,
  onOpenTemplates,
  templatesOpen = false,
}: ChecklistListToolbarProps) {
  return (
    <div className="work-inbox-checklist-toolbar" role="toolbar" aria-label="Điều khiển checklist">
      <div className="work-inbox-checklist-toolbar__primary">
        {allowMutate ? (
          <>
            <input
              type="text"
              className="work-inbox-checklist-toolbar__add-input"
              placeholder="Tên bước mới"
              value={addTitle}
              disabled={busy}
              onChange={(e) => onAddTitleChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddStep?.();
              }}
            />
            <button
              type="button"
              className="work-inbox-checklist-toolbar__btn work-inbox-checklist-toolbar__btn--primary"
              disabled={!addTitle.trim() || busy}
              onClick={() => onAddStep?.()}
            >
              + Thêm bước
            </button>
            <button
              type="button"
              className={
                templatesOpen
                  ? 'work-inbox-checklist-toolbar__btn work-inbox-checklist-toolbar__btn--template work-inbox-checklist-toolbar__btn--active'
                  : 'work-inbox-checklist-toolbar__btn work-inbox-checklist-toolbar__btn--template'
              }
              disabled={busy}
              aria-expanded={templatesOpen}
              onClick={() => onOpenTemplates?.()}
            >
              Áp dụng mẫu
            </button>
          </>
        ) : null}
      </div>
      <div className="work-inbox-checklist-toolbar__secondary">
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn"
          disabled={busy}
          onClick={() => onExpandAll?.()}
        >
          Mở tất cả
        </button>
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn"
          disabled={busy}
          onClick={() => onCollapseAll?.()}
        >
          Thu gọn tất cả
        </button>
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn"
          disabled={busy}
          onClick={() => onToggleArchivedVisible?.()}
        >
          {archivedVisible ? 'Ẩn bước lưu trữ' : 'Hiện bước lưu trữ'}
        </button>
      </div>
    </div>
  );
}
