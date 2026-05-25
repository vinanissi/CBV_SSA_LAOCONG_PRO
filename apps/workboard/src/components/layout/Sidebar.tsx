import { NavLink } from 'react-router-dom';
import { PRIMARY_NAV, SECONDARY_NAV } from '@/shared/constants';

export function Sidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface-raised">
      <nav className="flex-1 p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Làm việc hôm nay
        </p>
        <div className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[15px] transition-colors ${
                  isActive
                    ? 'bg-accent/15 font-semibold text-accent'
                    : 'text-slate-300 hover:bg-surface-overlay hover:text-white'
                }`
              }
            >
              <span className="w-5 text-center text-sm opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="my-4 border-t border-border/50" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Khác
        </p>
        <div className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-surface-overlay text-slate-300'
                    : 'text-slate-500 hover:bg-surface-overlay/60 hover:text-slate-400'
                }`
              }
            >
              <span className="w-5 text-center opacity-60">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
