interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="panel max-w-md p-8 text-center">
      <p className="text-lg font-medium text-status-error">Cần kiểm tra</p>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-4">
          Thử lại
        </button>
      )}
    </div>
  );
}
