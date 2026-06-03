import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { INBOX_ROUTE } from '@/shared/routes/inboxRoutes';
import { useWorkInboxLayout } from '@/modules/task/inbox/WorkInboxLayoutContext';

function Badge({ value }: { value: number }) {
  if (value <= 0) return null;
  return <span className="operator-sidebar-badge tabular-nums">{value}</span>;
}

export function OperatorMainSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { metrics, focusQueueSize, enterFocus, showInboxList, viewMode } = useWorkInboxLayout();

  const myTasksCount = focusQueueSize > 0 ? focusQueueSize : metrics.total;

  return (
    <aside
      className={
        collapsed ? 'sidebar-shell operator-main-sidebar collapsed' : 'sidebar-shell operator-main-sidebar'
      }
      data-cbv-panel="operator-main-sidebar"
    >
      <nav className="operator-main-sidebar__nav flex-1 overflow-y-auto p-3">
        <div className="operator-main-sidebar__section">
          <p className="sidebar-group-label">VẬN HÀNH</p>
          <div className="space-y-0.5">
            <NavLink
              to={INBOX_ROUTE}
              end
              className={({ isActive }) =>
                isActive && viewMode === 'inbox'
                  ? 'sidebar-nav-link active'
                  : 'sidebar-nav-link'
              }
              onClick={() => showInboxList()}
            >
              Hôm nay
            </NavLink>
            <button
              type="button"
              className={viewMode === 'focus' ? 'sidebar-nav-button active' : 'sidebar-nav-button'}
              onClick={() => {
                enterFocus();
                if (window.location.pathname !== INBOX_ROUTE) navigate(INBOX_ROUTE);
              }}
            >
              <span className="flex flex-1 items-center justify-between gap-2">
                <span>Việc của tôi</span>
                <Badge value={myTasksCount} />
              </span>
            </button>
          </div>
        </div>

        <div className="operator-main-sidebar__section">
          <p className="sidebar-group-label">NGHIỆP VỤ</p>
          <div className="space-y-0.5">
            <NavLink to="/hoso" className={({ isActive }) => (isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link')}>
              Hồ sơ
            </NavLink>
            <NavLink
              to="/finance"
              className={({ isActive }) => (isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link')}
            >
              Tài chính
            </NavLink>
            <NavLink
              to="/coordination"
              className={({ isActive }) => (isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link')}
            >
              Phối hợp
            </NavLink>
          </div>
        </div>

        <details className="operator-main-sidebar__section operator-main-sidebar__section--system">
          <summary className="sidebar-group-label operator-main-sidebar__system-summary">Hệ thống</summary>
          <div className="space-y-0.5 pt-1">
            <NavLink
              to="/observation"
              className={({ isActive }) =>
                isActive
                  ? 'sidebar-nav-link sidebar-nav-link--secondary active'
                  : 'sidebar-nav-link sidebar-nav-link--secondary'
              }
            >
              Quan sát
            </NavLink>
            <NavLink
              to="/plugins"
              className={({ isActive }) =>
                isActive
                  ? 'sidebar-nav-link sidebar-nav-link--secondary active'
                  : 'sidebar-nav-link sidebar-nav-link--secondary'
              }
            >
              Cấu hình
            </NavLink>
          </div>
        </details>

        <div className="operator-main-sidebar__section operator-main-sidebar__overdue">
          <NavLink
            to={`${INBOX_ROUTE}?filter=overdue`}
            className={({ isActive }) =>
              isActive ? 'sidebar-quick-link active' : 'sidebar-quick-link sidebar-quick-link--alert'
            }
          >
            <span className="flex flex-1 items-center justify-between gap-2">
              <span>Quá hạn</span>
              <Badge value={metrics.overdue} />
            </span>
          </NavLink>
        </div>
      </nav>

      <button
        type="button"
        className="operator-main-sidebar__collapse border-t border-border/50 px-3 py-2 text-xs text-operational-muted hover:bg-surface-overlay"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
      >
        {collapsed ? 'Mở rộng' : 'Thu gọn'}
      </button>
    </aside>
  );
}
