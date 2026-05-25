import { useNavigate } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { QUICK_BAR_ACTIONS, SESSION_LABEL } from '@/shared/constants';
import { executionLabel } from '@/shared/utils';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';

interface QuickActionBarProps {
  user: UserContext;
}

export function QuickActionBar(_props: QuickActionBarProps) {
  const navigate = useNavigate();
  const { openCreate } = useTaskWrite();

  return (
    <footer className="flex h-14 shrink-0 items-center gap-3 border-t border-border bg-surface-raised px-5">
      {QUICK_BAR_ACTIONS.map((action) => {
        const locked = action.mode === 'EXECUTION_LOCKED';

        return (
          <button
            key={action.id}
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              if (action.id === 'add-task') {
                openCreate();
                return;
              }
              if (action.href) navigate(action.href);
            }}
            className={
              locked
                ? 'min-w-[88px] rounded-lg border border-border/60 bg-surface-overlay px-4 py-2.5 text-sm text-slate-500'
                : 'min-w-[88px] rounded-lg border border-border/80 bg-surface-content px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-border-soft hover:bg-surface-overlay'
            }
            title={locked ? executionLabel(action.mode) : undefined}
          >
            {action.label}
            {locked && <span className="ml-1 text-[10px] text-slate-600">· Sắp mở</span>}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-slate-600">{SESSION_LABEL}</span>
    </footer>
  );
}
