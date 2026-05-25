import { NavLink } from 'react-router-dom';

interface SidebarProps {
  items: readonly { to: string; label: string; icon: string }[];
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface-raised">
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 font-medium text-accent'
                  : 'text-slate-400 hover:bg-surface-overlay hover:text-slate-200'
              }`
            }
          >
            <span className="w-5 text-center opacity-70">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
