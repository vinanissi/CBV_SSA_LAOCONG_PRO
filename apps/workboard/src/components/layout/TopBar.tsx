import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { ROLE_LABELS } from '@/shared/constants';
import { findModuleByPath } from '@/runtime/moduleRegistry';
import { useModuleRegistry } from '@/runtime/useModuleRegistry';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WorkInboxSearchTopBarField } from '@/modules/task/inbox/search/WorkInboxSearchTopBarField';
import { showFocusRuntimeFeedback } from '@/modules/task/inbox/focusRuntime/focusRuntimeFeedback';

interface TopBarProps {
  user: UserContext;
  onSearchNavigate: (query: string) => void;
  onLogout?: () => void;
}

export function TopBar({ user, onSearchNavigate, onLogout }: TopBarProps) {
  const [logoutPending, setLogoutPending] = useState(false);
  const location = useLocation();
  const { modules, degraded } = useModuleRegistry(user);
  const currentModule = findModuleByPath(modules, location.pathname);

  async function handleLogout() {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await api.logout();
      onLogout?.();
    } finally {
      setLogoutPending(false);
    }
  }

  return (
    <header className="operational-topbar">
      <div className="flex items-center gap-2">
        <span className="operational-topbar-brand">CBV</span>
        <span className="operational-topbar-subtitle">Control Console</span>
      </div>

      <div className="mx-4 flex max-w-xl flex-1 flex-col">
        <WorkInboxSearchTopBarField onLegacySearchNavigate={onSearchNavigate} />
      </div>

      <div className="flex items-center gap-3">
        {isWorkInboxRoute(location.pathname) ? (
          <span className="operational-topbar-chip operational-topbar-chip--status">
            ✓ Việc vận hành
          </span>
        ) : (
          currentModule && (
            <span className="operational-topbar-chip">
              {currentModule.icon} {currentModule.moduleName}
            </span>
          )
        )}

        {degraded && (
          <span className="hidden text-sm font-semibold text-amber-700 md:inline" title="Runtime degraded">
            ● Degraded
          </span>
        )}

        <Link to="/" className="operational-topbar-link">
          Bàn điều phối
        </Link>

        {isWorkInboxRoute(location.pathname) && (
          <Link to="/coordination" className="operational-topbar-link operational-topbar-link--compact">
            ‹ Tới
          </Link>
        )}

        <ThemeToggle />

        <div className="hidden items-center gap-2 md:flex">
          <span className="operational-topbar-user" title={user.userId}>
            {user.displayName || 'Operation 1'}
          </span>
          <span className="operational-topbar-role">{ROLE_LABELS[user.role] ?? 'Nhân viên'}</span>
          {user.role === 'ADMIN' ? (
            <button
              type="button"
              className="operational-topbar-admin"
              onClick={() => showFocusRuntimeFeedback('Chức năng đang chuẩn bị')}
              title="Quản trị"
            >
              ADMIN <span aria-hidden>▾</span>
            </button>
          ) : null}
          {onLogout && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutPending}
              className="btn-ghost !px-3 !py-1.5 text-sm"
            >
              {logoutPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
