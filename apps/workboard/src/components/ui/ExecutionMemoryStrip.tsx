import { getExecutionMemorySummary } from '@/shared/utils/executionMemory';

interface ExecutionMemoryStripProps {
  onSelectTask?: (taskId: string) => void;
}

export function ExecutionMemoryStrip({ onSelectTask }: ExecutionMemoryStripProps) {
  const { count, message, items } = getExecutionMemorySummary();
  if (count === 0 || !message) return null;

  return (
    <div className="execution-memory-strip" role="status">
      <span className="execution-memory-msg">{message}</span>
      {count <= 3 &&
        items.map((item) => (
          <button
            key={item.taskId}
            type="button"
            className="execution-memory-link"
            onClick={() => onSelectTask?.(item.taskId)}
          >
            {item.title.slice(0, 24)}
          </button>
        ))}
    </div>
  );
}
