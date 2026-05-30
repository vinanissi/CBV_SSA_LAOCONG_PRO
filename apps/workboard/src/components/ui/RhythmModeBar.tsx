import { RHYTHM_MODES } from '@/shared/utils/taskRhythm';
import type { RhythmMode } from '@/shared/utils/workingContext';

interface RhythmModeBarProps {
  mode: RhythmMode;
  onChange: (mode: RhythmMode) => void;
}

export function RhythmModeBar({ mode, onChange }: RhythmModeBarProps) {
  return (
    <div className="rhythm-mode-bar">
      <span className="mr-1 text-[10px] uppercase text-slate-600">Nhịp:</span>
      {RHYTHM_MODES.map((r) => (
        <button
          key={r.key}
          type="button"
          title={r.description}
          onClick={() => onChange(r.key)}
          className={mode === r.key ? 'btn-primary !px-2 !py-1 text-xs' : 'btn-ghost !px-2 !py-1 text-xs'}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
