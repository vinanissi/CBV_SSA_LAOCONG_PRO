import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { FinanceItem } from '@/api/contracts';
import { FinanceCard } from '@/components/ui/FinanceCard';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { PriorityStrip } from '@/components/ui/PriorityStrip';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { PermissionGate } from '@/components/states/PermissionGate';
import { PERMISSIONS } from '@/shared/constants';
import { useDetailPanel } from '@/components/layout/DetailPanel';

export function FinancePage() {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDetail } = useDetailPanel();

  useEffect(() => {
    api
      .getFinanceItems()
      .then((res) => {
        if (!res.ok) {
          setError(res.errors[0] ?? 'Không tải được tài chính');
          return;
        }
        setItems(res.data);
      })
      .catch(() => setError('Không kết nối được dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const income = items.filter((i) => i.type === 'INCOME' && i.status === 'NEW');
  const expense = items.filter((i) => i.type === 'EXPENSE' && i.status === 'NEW');
  const missingDoc = items.filter((i) => i.missingDocuments);
  const pending = items.filter((i) => i.status === 'NEW');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <PermissionGate permission={PERMISSIONS.FINANCE_VIEW} permissions={['FINANCE_VIEW', 'TASK_VIEW']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Tài chính</h1>
          <p className="text-sm text-slate-400">Chỉ xem — xác nhận cần thao tác thủ công</p>
        </div>

        <PriorityStrip
          items={[
            { label: 'Cần thu', count: income.length },
            { label: 'Cần chi', count: expense.length, tone: 'warn' },
            { label: 'Thiếu chứng từ', count: missingDoc.length, tone: 'error' },
            { label: 'Chờ xác nhận', count: pending.length },
          ]}
        />

        <WorkQueue title="Danh sách khoản">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item) => (
              <FinanceCard
                key={item.financeId}
                item={item}
                onSelect={(f) =>
                  setDetail(f.title, (
                    <div className="space-y-2 text-sm text-slate-400">
                      <p>Mã: {f.financeId}</p>
                      <p>Trạng thái: {f.status}</p>
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
