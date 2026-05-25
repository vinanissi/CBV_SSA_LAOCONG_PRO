import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { TopBar } from './TopBar';
import { TopRuntimeStrip } from './TopRuntimeStrip';
import { Sidebar } from './Sidebar';
import { QuickActionBar } from './QuickActionBar';
import { DetailPanel } from './DetailPanel';
import { FocusStrip } from '@/components/ui/FocusStrip';

interface AppShellProps {
  user: UserContext;
  children?: ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen min-w-[1366px] flex-col bg-surface">
      <TopBar user={user} onSearchNavigate={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
      <TopRuntimeStrip />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface">
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto px-5 py-4">
              <FocusStrip />
              <div className="main-canvas">{children}</div>
            </div>
            <DetailPanel />
          </div>
        </main>
      </div>

      <QuickActionBar user={user} />
    </div>
  );
}
