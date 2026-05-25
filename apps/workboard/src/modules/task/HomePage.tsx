import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import type { TaskDetail, TodaySummary } from '@/api/contracts';
import { AlertCard } from '@/components/ui/AlertCard';
import { TaskCard } from '@/components/ui/TaskCard';
import { FinanceCard } from '@/components/ui/FinanceCard';
import { HoSoCard } from '@/components/ui/HoSoCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { buildTaskDetailContent, buildTaskTimelineContent } from '@/components/ui/TaskDetailContent';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useDetailPanel } from '@/components/layout/DetailPanel';
import { EMPTY_COPY } from '@/shared/constants';

export function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDetail } = useDetailPanel();

  useEffect(() => {
    api
      .getTodaySummary()
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được dữ liệu hôm nay');
          return;
        }
        setData(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  function openTask(taskId: string, title: string) {
    api.getTaskDetail(taskId).then((res) => {
      if (res.ok && res.data) {
        setDetail(title, buildTaskDetailContent(res.data));
      }
    });
    navigate(`/tasks/${taskId}`);
  }

  function showTimeline(detail: TaskDetail) {
    setDetail(detail.title, buildTaskTimelineContent(detail));
  }

  if (loading) return <LoadingState message="Đang tải việc hôm nay..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Hôm nay</h1>
        <p className="mt-1 text-sm text-slate-400">Việc ưu tiên và cảnh báo cần xử lý</p>
      </div>

      <WorkQueue title="Cảnh báo quan trọng">
        {data.alerts.length === 0 ? (
          <EmptyState {...EMPTY_COPY.alerts} />
        ) : (
          data.alerts.map((a) => <AlertCard key={a.alertId} alert={a} />)
        )}
      </WorkQueue>

      <div className="grid gap-5 xl:grid-cols-2">
        <WorkQueue title="Việc của tôi">
          {data.myTasks.length === 0 ? (
            <EmptyState title="Chưa có việc được giao cho bạn" />
          ) : (
            data.myTasks.map((t) => (
              <TaskCard
                key={t.taskId}
                task={t}
                onOpen={() => openTask(t.taskId, t.title)}
                onTimeline={() => {
                  api.getTaskDetail(t.taskId).then((res) => {
                    if (res.ok && res.data) showTimeline(res.data);
                  });
                }}
                onHoSo={() => navigate('/hoso')}
              />
            ))
          )}
        </WorkQueue>

        <WorkQueue title="Quá hạn">
          {data.overdueTasks.length === 0 ? (
            <EmptyState {...EMPTY_COPY.overdue} />
          ) : (
            data.overdueTasks.map((t) => (
              <TaskCard
                key={t.taskId}
                task={t}
                onOpen={() => openTask(t.taskId, t.title)}
                onHoSo={() => navigate('/hoso')}
              />
            ))
          )}
        </WorkQueue>

        <WorkQueue title="Hồ sơ thiếu giấy tờ">
          {data.missingHoSo.length === 0 ? (
            <EmptyState title="Không có hồ sơ thiếu giấy tờ" />
          ) : (
            data.missingHoSo.map((h) => <HoSoCard key={h.hoSoId} item={h} />)
          )}
        </WorkQueue>

        <WorkQueue title="Tài chính chờ xử lý">
          {data.pendingFinance.length === 0 ? (
            <EmptyState title="Không có khoản chờ xử lý" />
          ) : (
            data.pendingFinance.map((f) => <FinanceCard key={f.financeId} item={f} />)
          )}
        </WorkQueue>
      </div>
    </div>
  );
}
