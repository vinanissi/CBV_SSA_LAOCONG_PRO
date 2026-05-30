export function TaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Đang tải danh sách việc">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="panel animate-pulse space-y-3 p-4"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-4 w-20 rounded bg-slate-700/80" />
          <div className="h-6 w-3/4 rounded bg-slate-700/60" />
          <div className="h-4 w-1/2 rounded bg-slate-800/80" />
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-16 rounded bg-slate-800/80" />
            <div className="h-8 w-20 rounded bg-slate-800/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
