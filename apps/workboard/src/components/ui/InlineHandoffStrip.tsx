import { getHandoffTargets, type HandoffTarget } from '@/shared/utils/handoffQuickActions';

interface InlineHandoffStripProps {
  onSelect: (target: HandoffTarget) => void;
  onDismiss?: () => void;
}

export function InlineHandoffStrip({ onSelect, onDismiss }: InlineHandoffStripProps) {
  const targets = getHandoffTargets();

  return (
    <div className="inline-handoff-strip" onClick={(e) => e.stopPropagation()}>
      <span className="inline-handoff-label">Chuyển →</span>
      <div className="inline-handoff-options">
        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            className="inline-handoff-chip"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(t);
            }}
          >
            {t.label}
          </button>
        ))}
        {onDismiss && (
          <button type="button" className="inline-handoff-chip inline-handoff-dismiss" onClick={onDismiss}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
