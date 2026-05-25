import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { SearchResult } from '@/api/contracts';
import { LoadingState } from '@/components/states/LoadingState';
import { EmptyState } from '@/components/states/EmptyState';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoLabel, setDemoLabel] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    api
      .search(query)
      .then((res) => {
        if (res.ok) {
          setResults(res.data.results);
          setDemoLabel(res.data.demoLabel);
        }
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Tìm kiếm</h1>
      {query ? (
        <p className="text-sm text-slate-400">
          Kết quả cho &quot;{query}&quot; · {demoLabel}
        </p>
      ) : (
        <p className="text-sm text-slate-400">Nhập từ khóa ở thanh trên để tìm.</p>
      )}

      {loading && <LoadingState />}
      {!loading && query && results.length === 0 && (
        <EmptyState title="Không tìm thấy" message="Thử tên, SĐT, biển số hoặc mã khác." />
      )}

      {!loading && results.length > 0 && (
        <WorkQueue title={`${results.length} kết quả`}>
          {results.map((r) => (
            <Link
              key={`${r.module}-${r.id}`}
              to={r.href}
              className="panel block p-4 hover:border-border-soft"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-100">{r.title}</span>
                <StatusBadge status={r.module} variant="readonly" />
              </div>
              <p className="mt-1 text-sm text-slate-400">{r.subtitle}</p>
              <p className="mt-1 text-xs text-slate-500">Khớp: {r.matchedField}</p>
            </Link>
          ))}
        </WorkQueue>
      )}
    </div>
  );
}
