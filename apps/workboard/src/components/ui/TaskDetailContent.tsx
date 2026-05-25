import type { TaskDetail } from '@/api/contracts';
import { TimelineList } from '@/components/ui/TimelineList';
import { FileList } from '@/components/ui/FileList';
import { TaskUpdateForm } from '@/modules/task/TaskUpdateForm';
import { extractTaskSubtitle } from '@/shared/utils/taskDisplay';

interface TaskDetailContentProps {
  detail: TaskDetail;
  onUpdated?: (task: TaskDetail) => void;
}

export function TaskDetailContent({ detail, onUpdated }: TaskDetailContentProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Chi tiết việc</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">{detail.description}</p>
        <p className="mt-2 text-xs text-slate-500">{extractTaskSubtitle(detail.title)}</p>
      </div>

      <div className="border-t border-border/50 pt-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Lịch sử</h4>
        <TimelineList items={detail.timeline} />
      </div>

      <div className="border-t border-border/50 pt-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Tệp</h4>
        <FileList files={detail.files} />
      </div>

      <TaskUpdateForm task={detail} onUpdated={onUpdated} />
    </div>
  );
}

export function buildTaskDetailContent(detail: TaskDetail, onUpdated?: (task: TaskDetail) => void) {
  return <TaskDetailContent detail={detail} onUpdated={onUpdated} />;
}

export function buildTaskTimelineContent(detail: TaskDetail) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">{detail.title}</p>
      <TimelineList items={detail.timeline} />
    </div>
  );
}
