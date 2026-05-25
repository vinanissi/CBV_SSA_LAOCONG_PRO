import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { AppRoutes } from './routes';
import { AppShell } from '@/components/layout/AppShell';
import { DetailProvider } from '@/components/layout/DetailPanel';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';

export default function App() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getCurrentUser()
      .then((res) => {
        if (!active) return;
        if (!res.ok || !res.data) {
          setError(res.errors[0] ?? 'Không tải được thông tin người dùng');
          return;
        }
        setUser(res.data);
      })
      .catch(() => {
        if (active) setError('Không kết nối được dữ liệu');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <LoadingState message="Đang tải bàn làm việc..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface p-8">
        <ErrorState message={error ?? 'Không có quyền truy cập'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <DetailProvider>
      <AppShell user={user}>
        <AppRoutes />
      </AppShell>
    </DetailProvider>
  );
}
