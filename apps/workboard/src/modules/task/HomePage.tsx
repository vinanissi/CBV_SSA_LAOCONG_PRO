import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { TodaySummary } from '@/api/contracts';
import { AlertCard } from '@/components/ui/AlertCard';
import { TaskCard } from '@/components/ui/TaskCard';
import { FinanceCard } from '@/components/ui/FinanceCard';
import { HoSoCard } from '@/components/ui/HoSoCard';
import { PriorityStrip } from '@/components/ui/PriorityStrip';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useDetailPanel } from '@/components/layout/DetailPanel';

export function HomePage() {
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

  if (loading) return <LoadingState message="Đang tải việc hôm nay..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Hôm nay</h1>
        <p className="text-sm text-slate-400">{data.demoLabel}</p>
      </div>

      <PriorityStrip
        items={[
          { label: 'Ưu tiên', count: data.priorityTasks.length, tone: 'warn' },
          { label: 'Việc của tôi', count: data.myTasks.length },
          { label: 'Quá hạn', count: data.overdueTasks.length, tone: 'error' },
          { label: 'Hồ sơ thiếu', count: data.missingHoSo.length, tone: 'warn' },
          { label: 'Tài chính chờ', count: data.pendingFinance.length },
        ]}
      />

      <WorkQueue title="Cảnh báo quan trọng">
        {data.alerts.length === 0 ? (
          <EmptyState title="Không có cảnh báo" message="Mọi thứ đang ổn." />
        ) : (
          data.alerts.map((a) => <AlertCard key={a.alertId} alert={a} />)
        )}
      </WorkQueue>

      <div className="grid gap-4 xl:grid-cols-2">
        <WorkQueue title="Việc của tôi">
          {data.myTasks.map((t) => (
            <TaskCard
              key={t.taskId}
              task={t}
              onSelect={(task) =>
                setDetail(task.title, <p className="text-sm text-slate-400">Mã: {task.taskId}</p>)
              }
            />
          ))}
        </WorkQueue>

        <WorkQueue title="Quá hạn">
          {data.overdueTasks.length === 0 ? (
            <EmptyState title="Không có việc quá hạn" />
          ) : (
            data.overdueTasks.map((t) => <TaskCard key={t.taskId} task={t} />)
          )}
        </WorkQueue>

        <WorkQueue title="Hồ sơ thiếu giấy tờ">
          {data.missingHoSo.map((h) => (
            <HoSoCard key={h.hoSoId} item={h} />
          ))}
        </WorkQueue>

        <WorkQueue title="Tài chính chờ xử lý">
          {data.pendingFinance.map((f) => (
            <FinanceCard key={f.financeId} item={f} />
          ))}
        </WorkQueue>
      </div>
    </div>
  );
}
