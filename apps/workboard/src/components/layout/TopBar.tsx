import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { api } from '@/api/client';
import { ROLE_LABELS } from '@/shared/constants';

interface TopBarProps {
  user: UserContext;
  onSearchNavigate: (query: string) => void;
}

export function TopBar({ user, onSearchNavigate }: TopBarProps) {
  const [query, setQuery] = useState('');
  const [alertCount] = useState(3);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) onSearchNavigate(query.trim());
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface-raised px-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">CBV</span>
        <span className="hidden text-sm text-slate-400 lg:inline">Bàn làm việc vận hành</span>
      </div>

      <form onSubmit={handleSearch} className="mx-4 flex flex-1 max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, SĐT, biển số, mã..."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
      </form>

      <div className="flex items-center gap-3 text-sm">
        <Link to="/" className="rounded-md bg-surface-overlay px-3 py-1.5 text-status-warn hover:bg-surface">
          Hôm nay · {alertCount} cảnh báo
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <span className="text-slate-400">{user.displayName}</span>
          <span className="rounded bg-surface-overlay px-2 py-0.5 text-xs text-accent">
            {ROLE_LABELS[user.role]}
          </span>
        </div>

        <div
          className="rounded-md border border-border px-2 py-1 text-xs text-slate-400"
          title="Trạng thái kết nối"
        >
          {api.isMockMode() ? 'Đang chuẩn bị · local' : 'Đã kết nối'}
        </div>
      </div>
    </header>
  );
}
