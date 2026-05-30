import type { ReactNode } from 'react';
import { useWorkInboxLayout } from '@/modules/task/inbox/WorkInboxLayoutContext';

interface WorkInboxShellProps {
  children: ReactNode;
}

/**
 * Phase A shell — wraps task runtime for /inbox and /tasks.
 * Focus mode: pass-through only (no "Hộp việc" header, no nested scroll shell).
 */
export function WorkInboxShell({ children }: WorkInboxShellProps) {
  const { useThreeRegionFocusLayout } = useWorkInboxLayout();

  if (useThreeRegionFocusLayout) {
    return (
      <div className="work-inbox-shell work-inbox-shell--focus-pass-through min-h-0 flex-1" data-cbv-shell="work-inbox-v3">
        {children}
      </div>
    );
  }

  return (
    <section
      className="work-inbox-shell flex min-h-0 flex-1 flex-col"
      data-cbv-shell="work-inbox-v3"
      aria-label="Hộp việc vận hành"
    >
      <header className="work-inbox-shell__header mb-2 shrink-0 border-b border-border/40 pb-2">
        <h1 className="text-sm font-semibold text-text-primary">Hộp việc</h1>
      </header>
      <div className="work-inbox-shell__body work-inbox-shell__body--focus-safe min-h-0 flex-1 pb-12">
        {children}
      </div>
    </section>
  );
}
