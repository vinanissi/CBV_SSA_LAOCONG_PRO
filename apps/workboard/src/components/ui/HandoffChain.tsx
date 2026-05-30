import { resolveHandoffLabel } from '@/runtime/userDisplay';
import type { HandoffStep } from '@/shared/utils/handoffRuntime';

interface HandoffChainProps {
  steps: HandoffStep[];
  compact?: boolean;
}

export function HandoffChain({ steps, compact }: HandoffChainProps) {
  if (steps.length === 0) return null;

  if (compact) {
    return (
      <p className="text-[11px] font-medium text-slate-800">
        {steps.map((s, i) => (
          <span key={i}>
            {i > 0 && <span className="text-slate-700"> → </span>}
            <span
              className={s.kind === 'WAITING' ? 'text-amber-700' : s.kind === 'HANDOFF' ? 'text-blue-700' : 'text-slate-800'}
              title={s.actor && s.actor !== s.label ? s.actor : undefined}
            >
              {resolveHandoffLabel(s.label)}
            </span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {steps.map((s, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
          <span className="rounded border border-border/50 px-1 py-0.5 text-[9px] uppercase text-slate-500">
            {s.kind}
          </span>
          <span title={s.actor && s.actor !== s.label ? s.actor : undefined}>{resolveHandoffLabel(s.label)}</span>
        </li>
      ))}
    </ul>
  );
}
