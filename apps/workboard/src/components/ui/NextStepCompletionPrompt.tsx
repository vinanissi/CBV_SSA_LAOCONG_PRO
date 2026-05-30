import type { TaskItem } from '@/api/contracts';
import {
  getCompletionOptions,
  getUnfinishedForTask,
  clearUnfinishedAction,
} from '@/shared/utils/taskContinuation';
import { getTaskNextAction } from '@/shared/utils/taskNextAction';

interface NextStepCompletionPromptProps {
  task: TaskItem;
  onComplete: (note: string) => void;
  onDismiss: () => void;
}

export function NextStepCompletionPrompt({ task, onComplete, onDismiss }: NextStepCompletionPromptProps) {
  const unfinished = getUnfinishedForTask(task.taskId);
  const next = getTaskNextAction(task);
  const actionType = unfinished?.actionType ?? next.type;
  const options = getCompletionOptions(actionType);

  if (!options.length) return null;

  return (
    <div className="next-step-completion-prompt">
      <p className="panel-zone-label">Kết quả?</p>
      <p className="mt-0.5 text-xs font-medium text-slate-800">{unfinished?.actionLabel ?? next.label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="completion-option-chip"
            onClick={() => {
              clearUnfinishedAction(task.taskId);
              onComplete(opt.note);
            }}
          >
            {opt.label}
          </button>
        ))}
        <button type="button" className="completion-option-chip completion-dismiss" onClick={onDismiss}>
          Sau
        </button>
      </div>
    </div>
  );
}
