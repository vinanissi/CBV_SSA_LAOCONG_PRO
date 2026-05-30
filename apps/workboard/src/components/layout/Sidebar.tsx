import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { useModuleRegistry } from '@/runtime/useModuleRegistry';
import { getNavModules } from '@/runtime/moduleRegistry';
import { groupModulesByGroup, MODULE_GROUP_LABELS } from '@/runtime/modulePermissions';
import { planModuleLaunch, logModuleOpen } from '@/runtime/moduleLauncher';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import { isWorkInboxFocusRuntimeEnabled } from '@/modules/task/inbox/workInboxGroupsFeature';
import { OperatorMainSidebar } from './OperatorMainSidebar';

interface SidebarProps {
  user: UserContext;
}

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  if (isWorkInboxRoute(location.pathname) && isWorkInboxFocusRuntimeEnabled()) {
    return <OperatorMainSidebar />;
  }
  const { modules } = useModuleRegistry(user);
  const navModules = getNavModules(modules);
  const grouped = groupModulesByGroup(navModules);

  async function openModule(mod: (typeof navModules)[0]) {
    const plan = planModuleLaunch(mod, { returnPath: window.location.pathname });
    void logModuleOpen(mod.moduleId, mod.openMode);
    if (plan.mode === 'navigate' && plan.path) navigate(plan.path);
    else if (plan.mode === 'iframe' && plan.path) navigate(plan.path);
    else if (plan.mode === 'new_tab' && plan.url) window.open(plan.url, '_blank', 'noopener,noreferrer');
  }

  const groupOrder = ['OPERATIONS', 'REFERENCE', 'SETTINGS'];

  return (
    <aside className="sidebar-shell">
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="sidebar-section-label">Module launchpad</p>

        {groupOrder.map((groupKey) => {
          const items = grouped.get(groupKey);
          if (!items?.length) return null;
          return (
            <div key={groupKey} className="mb-3">
              {groupKey !== 'OPERATIONS' && (
                <p className="sidebar-group-label">{MODULE_GROUP_LABELS[groupKey] ?? groupKey}</p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const label = item.navLabel ?? item.moduleName;
                  const isInternal = item.openMode === 'INTERNAL_ROUTE' && item.primaryUrl.startsWith('/');

                  if (isInternal) {
                    return (
                      <NavLink
                        key={item.moduleId}
                        to={item.primaryUrl}
                        end={item.primaryUrl === '/home'}
                        className={({ isActive }) =>
                          isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'
                        }
                      >
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        {label}
                      </NavLink>
                    );
                  }

                  return (
                    <button
                      key={item.moduleId}
                      type="button"
                      onClick={() => openModule(item)}
                      className="sidebar-nav-button"
                    >
                      <span className="sidebar-nav-icon">{item.icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="my-3 border-t border-border/50" />
        <NavLink
          to="/tasks?filter=overdue"
          className={({ isActive }) => (isActive ? 'sidebar-quick-link active' : 'sidebar-quick-link')}
        >
          <span className="sidebar-nav-icon">!</span>
          Quá hạn
        </NavLink>
      </nav>
    </aside>
  );
}
