import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { QuickActionBar } from './QuickActionBar';
import { DetailPanel } from './DetailPanel';
import { NAV_ITEMS } from '@/shared/constants';

interface AppShellProps {
  user: UserContext;
  children?: ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen min-w-[1366px] flex-col bg-surface">
      <TopBar user={user} onSearchNavigate={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />

      <div className="flex min-h-0 flex-1">
        <Sidebar items={NAV_ITEMS} />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto p-4">{children ?? <Outlet />}</div>
            <DetailPanel />
          </div>
        </main>
      </div>

      <QuickActionBar user={user} />
    </div>
  );
}

export function ShellNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 text-sm transition-colors ${
          isActive ? 'bg-accent/20 text-accent' : 'text-slate-400 hover:bg-surface-overlay hover:text-slate-200'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
