import type { OwnerPressure } from '@/shared/utils/teamPressure';

interface TeamPressureStripProps {
  pressure: OwnerPressure[];
  max?: number;
}

export function TeamPressureStrip({ pressure, max = 4 }: TeamPressureStripProps) {
  const overloaded = pressure.filter((p) => p.overloaded).slice(0, max);
  if (overloaded.length === 0) return null;

  return (
    <div className="team-pressure-strip">
      {overloaded.map((p) => (
        <span key={p.ownerId} className="team-pressure-chip" title={`${p.displayName}${p.ownerId !== p.displayName ? ` · ${p.ownerId}` : ''} · ${p.pending} việc · ${p.overdue} quá hạn`}>
          ⚠ {p.displayName}: {p.pending} việc{p.overdue > 0 ? ` · ${p.overdue} quá hạn` : ''}
        </span>
      ))}
    </div>
  );
}
