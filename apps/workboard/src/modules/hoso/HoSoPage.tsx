import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { HoSoItem } from '@/api/contracts';
import { HoSoCard } from '@/components/ui/HoSoCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { PriorityStrip } from '@/components/ui/PriorityStrip';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { PermissionGate } from '@/components/states/PermissionGate';
import { PERMISSIONS } from '@/shared/constants';
import { useDetailPanel } from '@/components/layout/DetailPanel';

export function HoSoPage() {
  const [items, setItems] = useState<HoSoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDetail } = useDetailPanel();

  useEffect(() => {
    api
      .getHoSoItems()
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được hồ sơ');
          return;
        }
        setItems(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const missing = items.filter((i) => i.missingDocuments.length > 0);
  const missingCccd = items.filter((i) => i.missingDocuments.includes('CCCD'));
  const missingGplx = items.filter((i) => i.missingDocuments.includes('GPLX'));

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <PermissionGate permission={PERMISSIONS.HO_SO_VIEW} permissions={['HO_SO_VIEW', 'TASK_VIEW']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Hồ sơ xã viên</h1>
          <p className="text-sm text-slate-400">Chỉ xem — duyệt cần thao tác thủ công</p>
        </div>

        <PriorityStrip
          items={[
            { label: 'Tổng hồ sơ', count: items.length },
            { label: 'Thiếu giấy tờ', count: missing.length, tone: 'warn' },
            { label: 'Thiếu CCCD', count: missingCccd.length, tone: 'error' },
            { label: 'Thiếu GPLX', count: missingGplx.length, tone: 'warn' },
          ]}
        />

        <WorkQueue title="Danh sách hồ sơ">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item) => (
              <HoSoCard
                key={item.hoSoId}
                item={item}
                onSelect={(h) =>
                  setDetail(h.personName, (
                    <div className="space-y-2 text-sm text-slate-400">
                      <p>Biển số: {h.vehiclePlate}</p>
                      <p>SĐT: {h.phone}</p>
                      <p>Hoàn thiện: {h.documentCompleteness}%</p>
                      <p className="text-slate-500">Chỉ xem trong phiên bản này</p>
                    </div>
                  ))
                }
              />
            ))
          )}
        </WorkQueue>
      </div>
    </PermissionGate>
  );
}
