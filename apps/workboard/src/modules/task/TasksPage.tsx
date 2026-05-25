import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import type { TaskDetail, TaskFilter, TaskItem } from '@/api/contracts';
import { TaskCard } from '@/components/ui/TaskCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { TimelineList } from '@/components/ui/TimelineList';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TASK_FILTERS } from '@/shared/constants';
import { useDetailPanel } from '@/components/layout/DetailPanel';

export function TasksPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get('filter') as TaskFilter) || 'mine';
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [detail, setDetailState] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDetail } = useDetailPanel();

  useEffect(() => {
    setLoading(true);
    api
      .getTasks(filter)
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được danh sách việc');
          return;
        }
        setTasks(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (!taskId) return;
    api.getTaskDetail(taskId).then((res) => {
      if (res.ok && res.data) {
        setDetailState(res.data);
        setDetail(res.data.title, (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">{res.data.description}</p>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">Lịch sử</h4>
              <TimelineList items={res.data.timeline} />
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">Tệp</h4>
              {res.data.files.map((f) => (
                <p key={f.fileId} className="text-sm text-slate-300">{f.fileName}</p>
              ))}
            </div>
            <p className="text-xs text-slate-500">Chỉ xem trong phiên bản này</p>
          </div>
        ));
      }
    });
  }, [taskId, setDetail]);

  function selectFilter(f: TaskFilter) {
    setSearchParams({ filter: f });
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Việc vận hành</h1>

      <div className="flex flex-wrap gap-2">
        {TASK_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => selectFilter(f.key)}
            className={filter === f.key ? 'btn-primary' : 'btn-ghost'}
          >
            {f.label}
          </button>
        ))}
      </div>

      <WorkQueue title="Danh sách việc">
        {tasks.length === 0 ? (
          <EmptyState title="Không có việc" message="Thử đổi bộ lọc khác." />
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.taskId}
              task={t}
              selected={detail?.taskId === t.taskId || taskId === t.taskId}
              onSelect={(task) => {
                navigate(`/tasks/${task.taskId}`);
              }}
            />
          ))
        )}
      </WorkQueue>
    </div>
  );
}
