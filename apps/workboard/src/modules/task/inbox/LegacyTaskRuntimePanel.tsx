import type { ReactNode } from 'react';

interface LegacyTaskRuntimePanelProps {
  open: boolean;
  onToggle: () => void;
  /** When false, operator cannot open legacy UI (code may remain mounted elsewhere). */
  showToggle: boolean;
  children: ReactNode;
}

/**
 * Collapsible wrapper for pre–Work Inbox V3 task runtime (filters, cognition list).
 */
export function LegacyTaskRuntimePanel({
  open,
  onToggle,
  showToggle,
  children,
}: LegacyTaskRuntimePanelProps) {
  if (!showToggle && !open) {
    return null;
  }

  return (
    <section
      className="legacy-task-runtime-panel mt-4 border-t border-border/50 pt-3"
      data-cbv-panel="legacy-task-runtime"
      aria-label="Runtime việc vận hành cũ"
    >
      {showToggle && (
        <div className="legacy-task-runtime-panel__toolbar mb-2 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="btn-secondary text-xs font-medium"
            onClick={onToggle}
            aria-expanded={open}
          >
            {open ? 'Ẩn Runtime cũ' : 'Hiện Runtime cũ'}
          </button>
          <p className="text-[11px] text-operational-muted">Runtime cũ — dùng khi cần đối chiếu</p>
        </div>
      )}

      {open && <div className="legacy-task-runtime-panel__body space-y-2">{children}</div>}
    </section>
  );
}
