import { getMicroUpdateOptions, type MicroUpdateOption } from '@/shared/utils/microUpdateFlow';
import type { QuickActionId } from '@/shared/utils/quickActionRuntime';

interface MicroUpdateStripProps {
  actionId: QuickActionId | string;
  actionLabel?: string;
  onSelect: (option: MicroUpdateOption) => void;
  onDismiss?: () => void;
}

export function MicroUpdateStrip({ actionId, actionLabel, onSelect, onDismiss }: MicroUpdateStripProps) {
  const options = getMicroUpdateOptions(actionId);
  if (!options.length) return null;

  return (
    <div className="micro-update-strip" onClick={(e) => e.stopPropagation()}>
      <span className="micro-update-label">Kết quả{actionLabel ? `: ${actionLabel}` : ''}</span>
      <div className="micro-update-options">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="micro-update-chip"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt);
            }}
          >
            {opt.label}
          </button>
        ))}
        {onDismiss && (
          <button type="button" className="micro-update-chip micro-update-dismiss" onClick={onDismiss}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
