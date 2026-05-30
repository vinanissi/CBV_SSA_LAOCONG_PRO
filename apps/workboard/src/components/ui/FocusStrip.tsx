import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';

export interface FocusItem {
  id: string;
  label: string;
  href: string;
  count: number;
  active: boolean;
}

export function FocusStrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const onTasksRoute = isWorkInboxRoute(location.pathname);
  const [items, setItems] = useState<FocusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (onTasksRoute) {
      setLoading(false);
      return;
    }

    let active = true;
    Promise.all([api.getTodaySummary(), api.getCoordination()])
      .then(([todayRes, coordRes]) => {
        if (!active || !todayRes.ok || !todayRes.data) return;

        const today = todayRes.data;
        const missingGplx = today.missingHoSo.filter(
          (h) => h.missingDocuments.includes('GPLX') || h.missingDocuments.includes('Đăng kiểm'),
        ).length;
        const pendingConfirm = today.pendingFinance.filter(
          (f) => f.warnings.some((w) => w.includes('xác nhận') || w.includes('Chờ')),
        ).length;
        const unassigned = coordRes.ok && coordRes.data ? coordRes.data.unassigned.length : 0;
        const showUnassigned = coordRes.ok && coordRes.data;

        setItems([
          {
            id: 'overdue',
            label: `${today.overdueTasks.length} việc quá hạn`,
            href: '/tasks?filter=overdue',
            count: today.overdueTasks.length,
            active: today.overdueTasks.length > 0,
          },
          {
            id: 'hoso-gplx',
            label: `${missingGplx} hồ sơ thiếu GPLX`,
            href: '/hoso',
            count: missingGplx,
            active: missingGplx > 0,
          },
          {
            id: 'finance-pending',
            label: `${pendingConfirm || today.pendingFinance.length} khoản chờ xác nhận`,
            href: '/finance',
            count: pendingConfirm || today.pendingFinance.length,
            active: today.pendingFinance.length > 0,
          },
          ...(showUnassigned
            ? [
                {
                  id: 'unassigned',
                  label: `${unassigned} việc chưa phân công`,
                  href: '/coordination',
                  count: unassigned,
                  active: unassigned > 0,
                },
              ]
            : []),
        ]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onTasksRoute]);

  if (onTasksRoute) {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-40 animate-pulse rounded-lg bg-surface-overlay/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="region" aria-label="Việc cần chú ý hôm nay">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => item.active && navigate(item.href)}
          disabled={!item.active}
          className={item.active ? 'focus-chip-active' : 'focus-chip-muted cursor-default'}
        >
          <span aria-hidden>{item.active ? '⚠' : '○'}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
