import type { GroupMode } from '@/shared/utils/workingContext';

const OPTIONS: { key: GroupMode; label: string }[] = [
  { key: 'cognition', label: 'Cognition' },
  { key: 'status', label: 'Trạng thái' },
];

interface GroupModeSelectProps {
  mode: GroupMode;
  onChange: (mode: GroupMode) => void;
}

export function GroupModeSelect({ mode, onChange }: GroupModeSelectProps) {
  const activeLabel = OPTIONS.find((o) => o.key === mode)?.label ?? mode;

  return (
    <div className="group-mode-select-wrap" data-group-mode={mode}>
      <label className="group-mode-select inline-flex items-center gap-1.5 text-sm font-medium text-slate-800">
        <span className="shrink-0">Hiển thị theo</span>
        <select
          value={mode}
          onChange={(e) => onChange(e.target.value as GroupMode)}
          className="group-mode-select-input"
          aria-label="Hiển thị theo"
        >
          {OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <span className="group-mode-select-badge" aria-hidden>
        {activeLabel}
      </span>
    </div>
  );
}
