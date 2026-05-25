import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import type { TaskDetail, TaskFilter, TaskItem } from '@/api/contracts';
import { TaskCard } from '@/components/ui/TaskCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { buildTaskDetailContent, buildTaskTimelineContent } from '@/components/ui/TaskDetailContent';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TASK_FILTERS, EMPTY_COPY } from '@/shared/constants';
import { useDetailPanel } from '@/components/layout/DetailPanel';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';

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
  const { registerTaskChanged, openCreate } = useTaskWrite();

  const loadTasks = useCallback(() => {
    setLoading(true);
    api
      .getTasks(filter)
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được danh sách việc');
          return;
        }
        setError(null);
        setTasks(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    registerTaskChanged(loadTasks);
  }, [registerTaskChanged, loadTasks]);

  function applyDetail(taskDetail: TaskDetail) {
    setDetailState(taskDetail);
    setDetail(
      taskDetail.title,
      buildTaskDetailContent(taskDetail, (updated) => {
        setDetailState(updated);
        setDetail(updated.title, buildTaskDetailContent(updated, applyDetail));
        loadTasks();
      }),
    );
  }

  useEffect(() => {
    if (!taskId) return;
    api.getTaskDetail(taskId).then((res) => {
      if (res.ok && res.data) applyDetail(res.data);
    });
  }, [taskId]);

  function openTask(task: TaskItem) {
    navigate(`/tasks/${task.taskId}`);
  }

  function showTimeline(task: TaskItem) {
    api.getTaskDetail(task.taskId).then((res) => {
      if (res.ok && res.data) {
        setDetail(res.data.title, buildTaskTimelineContent(res.data));
      }
    });
  }

  function selectFilter(f: TaskFilter) {
    setSearchParams({ filter: f });
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Việc vận hành</h1>
          <p className="mt-1 text-sm text-slate-400">Danh sách việc theo bộ lọc</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary shrink-0">
          + Tạo việc
        </button>
      </div>

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
          <EmptyState {...EMPTY_COPY.tasks} />
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.taskId}
              task={t}
              selected={detail?.taskId === t.taskId || taskId === t.taskId}
              onOpen={openTask}
              onTimeline={showTimeline}
              onHoSo={() => navigate('/hoso')}
            />
          ))
        )}
      </WorkQueue>
    </div>
  );
}
