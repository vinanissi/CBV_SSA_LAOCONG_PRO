import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { PluginsResponse } from '@/api/contracts';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { executionLabel } from '@/shared/utils';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  ACTIVE_READONLY: 'Chỉ xem',
  PARTIAL: 'Một phần',
  DISABLED: 'Tắt',
  NOT_CONFIGURED: 'Chưa cấu hình',
};

export function PluginsPage() {
  const [data, setData] = useState<PluginsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPlugins()
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được mô-đun');
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
        <h1 className="text-xl font-semibold text-white">Mô-đun vận hành</h1>
        <p className="text-sm text-slate-400">{data.demoLabel}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {data.plugins.map((plugin) => (
          <div key={plugin.pluginId} className="panel p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-100">{plugin.label}</h3>
              <StatusBadge
                status={STATUS_LABEL[plugin.status] ?? plugin.status}
                variant={plugin.status === 'ACTIVE_READONLY' ? 'readonly' : 'default'}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">{plugin.module} · {plugin.version}</p>

            <ul className="mt-4 space-y-2">
              {plugin.capabilities.map((cap) => (
                <li key={cap.capabilityId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{cap.label}</span>
                  {cap.enabled ? (
                    cap.route ? (
                      <Link to={cap.route} className="text-xs text-accent">
                        Mở
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">Sẵn sàng</span>
                    )
                  ) : (
                    <span className="text-xs text-slate-500">
                      {executionLabel(cap.status) || 'Sắp mở'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <WorkQueue title="Thao tác nhanh">
        {data.quickActions.map((action) => (
          <div key={action.actionId} className="flex items-center justify-between rounded-md bg-surface-overlay p-3">
            <span className="text-sm text-slate-300">{action.label}</span>
            {action.disabled ? (
              <span className="text-xs text-slate-500">
                {action.disabledReason ?? 'Chỉ xem trong phiên bản này'}
              </span>
            ) : action.href ? (
              <Link to={action.href} className="btn-ghost text-xs">
                Mở
              </Link>
            ) : null}
          </div>
        ))}
      </WorkQueue>
    </div>
  );
}
