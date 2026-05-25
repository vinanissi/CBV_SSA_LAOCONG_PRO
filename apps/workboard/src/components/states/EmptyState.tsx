import { EMPTY_COPY } from '@/shared/constants';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = EMPTY_COPY.default.title,
  message = EMPTY_COPY.default.message,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-surface-raised/40 px-8 py-10 text-center">
      <p className="text-base font-medium text-slate-300">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
