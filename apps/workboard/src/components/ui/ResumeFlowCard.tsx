import { buildResumeFlowSnapshot } from '@/shared/utils/flowResume';
import { recordResumeFlow } from '@/shared/utils/taskOperatorObservation';

interface ResumeFlowCardProps {
  onResumeTask: (taskId: string) => void;
  onContinue?: () => void;
}

export function ResumeFlowCard({ onResumeTask, onContinue }: ResumeFlowCardProps) {
  const snapshot = buildResumeFlowSnapshot();

  if (!snapshot.canResume || snapshot.items.length === 0) return null;

  const primary = snapshot.items[0];

  function handleContinue() {
    recordResumeFlow(primary.taskId);
    if (primary.taskId) onResumeTask(primary.taskId);
    else onContinue?.();
  }

  return (
    <div className="resume-flow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent/90">Tiếp tục làm việc</p>
          <ul className="mt-2 space-y-1">
            {snapshot.items.slice(0, 4).map((item) => (
              <li key={item.id} className="flex items-start gap-1.5 text-xs text-slate-300">
                <span className="text-slate-500">{item.kind === 'unfinished' ? '⚠' : '·'}</span>
                <span>
                  {item.label}
                  {item.sublabel && <span className="text-slate-500"> — {item.sublabel.slice(0, 36)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="btn-primary shrink-0 !px-3 !py-1.5 text-xs" onClick={handleContinue}>
          Tiếp tục
        </button>
      </div>
      {snapshot.unfinishedCount > 0 && (
        <p className="mt-2 text-[10px] text-amber-200/80">
          {snapshot.unfinishedCount} việc cần cập nhật sau hành động
        </p>
      )}
    </div>
  );
}
