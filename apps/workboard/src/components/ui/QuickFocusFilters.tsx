import { QUICK_FOCUS_FILTERS, type QuickFocusFilter } from '@/shared/utils/quickFocusFilters';
import type { OwnerPressure } from '@/shared/utils/teamPressure';

interface QuickFocusFiltersProps {
  focus: QuickFocusFilter;
  onChange: (focus: QuickFocusFilter) => void;
  /** Inline overload awareness when not filtering by overload */
  pressure?: OwnerPressure[];
}

export function QuickFocusFilters({ focus, onChange, pressure = [] }: QuickFocusFiltersProps) {
  const overloaded = pressure.filter((p) => p.overloaded).slice(0, 2);
  const showInlinePressure = focus !== 'overload' && overloaded.length > 0;

  function toggle(key: QuickFocusFilter) {
    onChange(focus === key ? 'all' : key);
  }

  return (
    <div className="quick-focus-filters" role="group" aria-label="Quick focus">
      <div className="quick-focus-chips">
          {QUICK_FOCUS_FILTERS.map((f) => {
            const isActive = focus === f.key;
            return (
              <button
                key={f.key}
                type="button"
                title={f.label}
                aria-pressed={isActive}
                aria-label={f.label}
                data-focus={f.key}
                onClick={() => toggle(f.key)}
                className={`quick-focus-chip${isActive ? ' quick-focus-chip-active' : ''}`}
              >
                {f.icon}
                {isActive ? ` ${f.label}` : ''}
              </button>
            );
          })}
      </div>
      {showInlinePressure && (
        <span className="quick-focus-pressure-hint" title="Đội đang quá tải">
          {overloaded.map((p) => (
            <span key={p.ownerId} title={p.ownerId !== p.displayName ? p.ownerId : undefined}>
              ⚠ {p.displayName} {p.pending}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
