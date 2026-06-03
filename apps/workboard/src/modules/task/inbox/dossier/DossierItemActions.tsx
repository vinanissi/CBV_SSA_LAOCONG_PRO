import type { DossierAction } from './dossierActionsTypes';

interface DossierItemActionsProps {
  actions: DossierAction[];
  onAction: (action: DossierAction) => void;
  busyActionId?: string | null;
}

export function DossierItemActions({ actions, onAction, busyActionId }: DossierItemActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="work-inbox-dossier__actions" role="group" aria-label="Thao tác hồ sơ">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={
            action.enabled
              ? 'work-inbox-dossier__action-btn'
              : 'work-inbox-dossier__action-btn work-inbox-dossier__action-btn--disabled'
          }
          disabled={!action.enabled || busyActionId === action.id}
          title={action.reasonDisabled ?? action.label}
          onClick={() => onAction(action)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
