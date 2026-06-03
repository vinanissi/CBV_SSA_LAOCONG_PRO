import type { ChecklistTemplate } from './checklistTemplateTypes';

export interface ChecklistTemplatePanelProps {
  open: boolean;
  templates: ChecklistTemplate[];
  selectedTemplate: ChecklistTemplate | null;
  busy?: boolean;
  applying?: boolean;
  onSelectTemplate: (templateId: string) => void;
  onApply: () => void;
  onClose: () => void;
}

export function ChecklistTemplatePanel({
  open,
  templates,
  selectedTemplate,
  busy = false,
  applying = false,
  onSelectTemplate,
  onApply,
  onClose,
}: ChecklistTemplatePanelProps) {
  if (!open) return null;

  const previewItems = selectedTemplate?.items ?? [];

  return (
    <div className="work-inbox-checklist-template" role="region" aria-label="Áp dụng checklist mẫu">
      <div className="work-inbox-checklist-template__header">
        <h4 className="work-inbox-checklist-template__title">Áp dụng checklist mẫu</h4>
        <button
          type="button"
          className="work-inbox-checklist-template__close"
          disabled={applying}
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="work-inbox-checklist-template__empty">Chưa có mẫu checklist khả dụng.</p>
      ) : (
        <div className="work-inbox-checklist-template__picker">
          {templates.map((tpl) => {
            const active = selectedTemplate?.id === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                className={
                  active
                    ? 'work-inbox-checklist-template__chip work-inbox-checklist-template__chip--active'
                    : 'work-inbox-checklist-template__chip'
                }
                disabled={busy || applying}
                onClick={() => onSelectTemplate(tpl.id)}
              >
                {tpl.category ? (
                  <span className="work-inbox-checklist-template__chip-cat">{tpl.category}</span>
                ) : null}
                <span className="work-inbox-checklist-template__chip-name">{tpl.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedTemplate ? (
        <div className="work-inbox-checklist-template__preview">
          <p className="work-inbox-checklist-template__preview-heading">
            Mẫu: <strong>{selectedTemplate.name}</strong>
          </p>
          {selectedTemplate.description ? (
            <p className="work-inbox-checklist-template__preview-desc">{selectedTemplate.description}</p>
          ) : null}
          {previewItems.length === 0 ? (
            <p className="work-inbox-checklist-template__empty">Mẫu này chưa có bước.</p>
          ) : (
            <ol className="work-inbox-checklist-template__preview-list">
              {previewItems.map((step, index) => (
                <li key={step.id || `${index}-${step.title}`}>
                  {step.title}
                  {step.required ? (
                    <span className="work-inbox-checklist-template__required"> *</span>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
          <button
            type="button"
            className="work-inbox-checklist-template__apply"
            disabled={busy || applying || previewItems.length === 0}
            onClick={() => onApply()}
          >
            {applying ? 'Đang áp dụng…' : 'Áp dụng vào checklist'}
          </button>
          <p className="work-inbox-checklist-template__hint">
            Các bước mới được thêm vào cuối checklist hiện tại — không xóa bước đã có.
          </p>
        </div>
      ) : (
        <p className="work-inbox-checklist-template__hint">Chọn một mẫu để xem trước các bước.</p>
      )}
    </div>
  );
}
