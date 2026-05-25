interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'overdue' | 'readonly';
}

const VARIANT_CLASS: Record<string, string> = {
  default: 'bg-surface-overlay text-slate-300',
  overdue: 'bg-status-error/20 text-status-error',
  readonly: 'bg-status-info/20 text-status-info',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${VARIANT_CLASS[variant]}`}>
      {status}
    </span>
  );
}
