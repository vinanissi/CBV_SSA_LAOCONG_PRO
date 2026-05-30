import { useEffect, useState, useCallback } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { getStoredAuthSession, clearStoredAuthSession } from '@/auth/sessionStorage';
import { AppRoutes } from './routes';
import { AppShell } from '@/components/layout/AppShell';
import { DetailProvider } from '@/components/layout/DetailPanel';
import { WorkInboxLayoutProvider } from '@/modules/task/inbox/WorkInboxLayoutContext';
import { TaskWriteProvider } from '@/modules/task/TaskWriteContext';
import { TaskRuntimeTelemetryProvider } from '@/runtime/TaskRuntimeTelemetryContext';
import { TaskCreateModal } from '@/modules/task/TaskCreateForm';
import { LoginPage } from '@/modules/auth/LoginPage';
import { bindSessionIdentity } from '@/runtime/runtimeIdentity';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';

export default function App() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    const session = getStoredAuthSession();
    const workerMode = Boolean(api.apiBaseUrl);

    if (workerMode && !session) {
      setNeedsLogin(true);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      if (!res.ok || !res.data) {
        if (workerMode && session) {
          clearStoredAuthSession();
          setNeedsLogin(true);
          setUser(null);
          return;
        }
        setError(res.errors[0] ?? 'Không tải được thông tin người dùng');
        return;
      }
      setUser(res.data);
      bindSessionIdentity(res.data);
      setNeedsLogin(false);
    } catch {
      setError('Không kết nối được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (needsLogin) {
    return (
      <LoginPage
        onLoggedIn={(loggedInUser) => {
          setUser(loggedInUser);
          bindSessionIdentity(loggedInUser);
          setNeedsLogin(false);
        }}
      />
    );
  }

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
        <ErrorState message={error ?? 'Không có quyền truy cập'} onRetry={() => loadUser()} />
      </div>
    );
  }

  return (
    <DetailProvider>
      <TaskWriteProvider>
        <TaskRuntimeTelemetryProvider>
          <WorkInboxLayoutProvider>
            <AppShell user={user} onLogout={() => { clearStoredAuthSession(); setNeedsLogin(true); setUser(null); }}>
              <AppRoutes user={user} />
            </AppShell>
          </WorkInboxLayoutProvider>
          <TaskCreateModal />
        </TaskRuntimeTelemetryProvider>
      </TaskWriteProvider>
    </DetailProvider>
  );
}
