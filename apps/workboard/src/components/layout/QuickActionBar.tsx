import { useNavigate } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { QUICK_BAR_ACTIONS } from '@/shared/constants';
import { executionLabel } from '@/shared/utils';

interface QuickActionBarProps {
  user: UserContext;
}

export function QuickActionBar({ user }: QuickActionBarProps) {
  const navigate = useNavigate();

  return (
    <footer className="flex h-12 shrink-0 items-center gap-2 border-t border-border bg-surface-raised px-4">
      {QUICK_BAR_ACTIONS.map((action) => {
        const locked = action.mode === 'EXECUTION_LOCKED';
        const label = locked ? executionLabel(action.mode) : action.label;

        return (
          <button
            key={action.id}
            type="button"
            disabled={locked}
            onClick={() => {
              if (!locked && action.href) navigate(action.href);
            }}
            className={locked ? 'btn-disabled text-xs' : 'btn-ghost text-xs'}
            title={locked ? label : undefined}
          >
            {action.label}
            {locked && <span className="ml-1 text-[10px] text-slate-500">· Sắp mở</span>}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-slate-500">{user.demoLabel ?? 'Phiên bản local'}</span>
    </footer>
  );
}
