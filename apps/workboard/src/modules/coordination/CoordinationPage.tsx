import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { CoordinationData } from '@/api/contracts';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { PriorityStrip } from '@/components/ui/PriorityStrip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getAssigneeDisplay } from '@/runtime/userDisplay';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';

export function CoordinationPage() {
  const [data, setData] = useState<CoordinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCoordination()
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được phối hợp');
          return;
        }
        setData(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Phối hợp</h1>
        <p className="text-sm text-slate-400">Giao việc — chỉ xem trong phiên bản này</p>
      </div>

      <PriorityStrip
        items={data.managerCards.map((c) => ({
          label: c.label,
          count: c.count,
          tone: c.label === 'Quá hạn' ? 'error' : 'default',
        }))}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <WorkQueue title="Hàng đợi">
          {data.queue.map((q) => (
            <Link key={q.queueId} to={q.href} className="panel block p-3 hover:border-border-soft">
              <p className="font-medium text-slate-100">{q.title}</p>
              <div className="mt-1 flex gap-2 text-xs text-slate-400">
                <span title={q.assignee}>{getAssigneeDisplay(q.assignee)}</span>
                {q.isOverdue && <StatusBadge status="Quá hạn" variant="overdue" />}
              </div>
            </Link>
          ))}
        </WorkQueue>

        <WorkQueue title="Khối lượng theo người">
          {data.workload.map((w) => (
            <div key={w.userId} className="panel p-3">
              <p className="font-medium text-slate-100">{w.displayName}</p>
              <div className="mt-2 flex gap-4 text-xs text-slate-400">
                <span>Mở: {w.openCount}</span>
                <span className="text-status-error">Quá hạn: {w.overdueCount}</span>
                <span>Chưa giao: {w.unassignedCount}</span>
              </div>
            </div>
          ))}
        </WorkQueue>

        <WorkQueue title="Chưa phân công">
          {data.unassigned.length === 0 ? (
            <EmptyState title="Không có việc chưa giao" />
          ) : (
            data.unassigned.map((q) => (
              <div key={q.queueId} className="panel p-3">
                <p className="text-slate-100">{q.title}</p>
                <button type="button" disabled className="btn-disabled mt-2 text-xs">
                  Giao việc · Chỉ xem trong phiên bản này
                </button>
              </div>
            ))
          )}
        </WorkQueue>
      </div>
    </div>
  );
}
