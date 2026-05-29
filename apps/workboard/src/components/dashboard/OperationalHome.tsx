import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import type { TaskDetail, TodaySummary, UserContext } from '@/api/contracts';
import { AlertCard } from '@/components/ui/AlertCard';
import { TaskCard } from '@/components/ui/TaskCard';
import { FinanceCard } from '@/components/ui/FinanceCard';
import { HoSoCard } from '@/components/ui/HoSoCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { buildTaskDetailContent, buildTaskTimelineContent } from '@/components/ui/TaskDetailContent';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { ModuleLaunchpad } from '@/components/dashboard/ModuleLaunchpad';
import { ResumeFlowCard } from '@/components/ui/ResumeFlowCard';
import { useDetailPanel } from '@/components/layout/DetailPanel';
import { EMPTY_COPY } from '@/shared/constants';
import { useModuleRegistry } from '@/runtime/useModuleRegistry';
import { getRecentModules, getOperationalContext } from '@/runtime/operationalLinkMemory';
import {
  hasUserDirectoryLoaded,
  saveUsersDirectory,
  enrichTasksUserFieldsFromDirectory,
} from '@/runtime/userDisplay';

interface OperationalHomeProps {
  user: UserContext;
}

export function OperationalHome({ user }: OperationalHomeProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDetail } = useDetailPanel();
  const { modules, degraded, statusFor } = useModuleRegistry(user);
  const recentModules = getRecentModules();
  const opCtx = getOperationalContext();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.getTodaySummary();
        if (!res.ok) {
          if (!cancelled) setError(res.errors[0] ?? 'Không tải được dữ liệu hôm nay');
          return;
        }
        // Ensure USER_DIRECTORY is hydrated so owner USER_IDs resolve to display names.
        // Directory is optional — on failure cards still fall back to raw id (no blank).
        if (!hasUserDirectoryLoaded()) {
          try {
            const userRes = await api.getUsers();
            if (userRes.ok && userRes.data?.length) saveUsersDirectory(userRes.data);
          } catch {
            /* directory optional; resolver falls back safely */
          }
        }
        if (cancelled) return;
        setData({
          ...res.data,
          priorityTasks: enrichTasksUserFieldsFromDirectory(res.data.priorityTasks ?? []),
          myTasks: enrichTasksUserFieldsFromDirectory(res.data.myTasks ?? []),
          overdueTasks: enrichTasksUserFieldsFromDirectory(res.data.overdueTasks ?? []),
        });
      } catch {
        if (!cancelled) setError('Không kết nối được dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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

  if (loading) return <LoadingState message="Đang tải bàn điều phối…" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <EmptyState />;

  const attentionCount =
    data.alerts.length + data.overdueTasks.length + data.missingHoSo.length + data.pendingFinance.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white">Bàn điều phối</h1>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Operational control console · {attentionCount} mục cần attention
          {degraded && ' · runtime degraded'}
        </p>
      </div>

      {degraded && (
        <p className="rounded border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-xs text-amber-200/90">
          Một số runtime đang degraded — flow context được giữ local, không reset workspace.
        </p>
      )}

      <ResumeFlowCard
        onResumeTask={(id) => navigate(`/tasks/${id}`)}
      />

      {opCtx?.returnPath && opCtx.moduleId && (
        <div className="rounded border border-accent/20 bg-accent/5 px-2.5 py-2 text-xs text-slate-300">
          Context: {opCtx.moduleId}
          {opCtx.taskId ? ` · task ${opCtx.taskId}` : ''}
          {opCtx.hoSoId ? ` · HS ${opCtx.hoSoId}` : ''}
        </div>
      )}

      <ModuleLaunchpad modules={modules} statusFor={statusFor} compact title="Mở module" />

      {recentModules.length > 0 && (
        <div className="text-[11px] text-slate-500">
          Gần đây: {recentModules.map((m) => m.moduleName).join(' · ')}
        </div>
      )}

      <WorkQueue title="Cảnh báo quan trọng">
        {data.alerts.length === 0 ? (
          <EmptyState {...EMPTY_COPY.alerts} />
        ) : (
          data.alerts.map((a) => <AlertCard key={a.alertId} alert={a} />)
        )}
      </WorkQueue>

      <div className="grid gap-4 xl:grid-cols-2">
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
              />
            ))
          )}
        </WorkQueue>

        <WorkQueue title="Quá hạn">
          {data.overdueTasks.length === 0 ? (
            <EmptyState {...EMPTY_COPY.overdue} />
          ) : (
            data.overdueTasks.map((t) => (
              <TaskCard key={t.taskId} task={t} onOpen={() => openTask(t.taskId, t.title)} />
            ))
          )}
        </WorkQueue>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <WorkQueue title="Hồ sơ thiếu tài liệu">
          {data.missingHoSo.length === 0 ? (
            <EmptyState title="Không có hồ sơ thiếu GPLX/CCCD" />
          ) : (
            data.missingHoSo.map((h) => <HoSoCard key={h.hoSoId} item={h} />)
          )}
        </WorkQueue>

        <WorkQueue title="Tài chính chờ xử lý">
          {data.pendingFinance.length === 0 ? (
            <EmptyState title="Không có khoản chờ xác nhận" />
          ) : (
            data.pendingFinance.map((f) => <FinanceCard key={f.financeId} item={f} />)
          )}
        </WorkQueue>
      </div>
    </div>
  );
}
