import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { ObservationData } from '@/api/contracts';
import { AlertCard } from '@/components/ui/AlertCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';

const MODULE_LABEL: Record<string, string> = {
  TASK: 'Việc',
  FINANCE: 'Tài chính',
  HO_SO: 'Hồ sơ',
};

export function ObservationPage() {
  const [data, setData] = useState<ObservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getObservation()
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được thông báo');
          return;
        }
        setData(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Thông báo & trạng thái</h1>
        <p className="text-sm text-slate-400">Không tự xử lý — cần kiểm tra thủ công</p>
      </div>

      <WorkQueue title="Trạng thái khu vực">
        <div className="grid gap-3 md:grid-cols-3">
          {data.statusCards.map((card) => (
            <div key={card.module} className="panel p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-100">{MODULE_LABEL[card.module] ?? card.module}</span>
                <StatusBadge
                  status={card.ok ? 'Ổn' : 'Cần kiểm tra'}
                  variant={card.ok ? 'readonly' : 'overdue'}
                />
              </div>
              <p className="mt-2 text-sm text-slate-400">{card.message}</p>
              <p className="mt-1 text-xs text-slate-500">{card.nextStep}</p>
            </div>
          ))}
        </div>
      </WorkQueue>

      <div className="grid gap-4 xl:grid-cols-2">
        <WorkQueue title="Đồng bộ">
          {data.syncStatus.map((s) => (
            <div key={s.label} className="flex justify-between rounded-md bg-surface-overlay p-3 text-sm">
              <span className="text-slate-300">{s.label}</span>
              <span className="text-slate-500">{s.message}</span>
            </div>
          ))}
        </WorkQueue>

        <WorkQueue title="Nguồn dữ liệu">
          {data.projectionStatus.map((p) => (
            <div key={p.label} className="flex justify-between rounded-md bg-surface-overlay p-3 text-sm">
              <span className="text-slate-300">{p.label}</span>
              <span className="text-slate-500">{p.message}</span>
            </div>
          ))}
        </WorkQueue>
      </div>

      <WorkQueue title="Cảnh báo">
        {data.alerts.map((a) => (
          <AlertCard key={a.alertId} alert={a} />
        ))}
      </WorkQueue>
    </div>
  );
}
