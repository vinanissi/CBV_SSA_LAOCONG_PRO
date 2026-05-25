interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'Không có dữ liệu',
  message = 'Danh sách trống — thử đổi bộ lọc hoặc quay lại sau.',
}: EmptyStateProps) {
  return (
    <div className="panel flex flex-col items-center justify-center p-12 text-center">
      <p className="text-lg font-medium text-slate-300">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  );
}
