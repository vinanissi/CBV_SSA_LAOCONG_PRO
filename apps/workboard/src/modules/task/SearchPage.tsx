import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { SearchResult } from '@/api/contracts';
import { LoadingState } from '@/components/states/LoadingState';
import { EmptyState } from '@/components/states/EmptyState';
import { WorkQueue } from '@/components/ui/WorkQueue';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RuntimeFeedbackMessage } from '@/components/ui/RuntimeFeedbackMessage';
import { EMPTY_COPY } from '@/shared/constants';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';
import { errorFeedback } from '@/shared/utils/runtimeFeedback';

const MODULE_LABEL: Record<string, string> = {
  TASK: 'Việc',
  FINANCE: 'Tài chính',
  HO_SO: 'Hồ sơ',
};

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<ReturnType<typeof errorFeedback> | null>(null);

  const runSearch = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      setFetchError(null);
      return;
    }
    setLoading(true);
    setFetchError(null);
    api
      .search(query)
      .then((res) => {
        if (!res.ok) {
          setResults([]);
          setFetchError(
            errorFeedback(res.errors[0] ?? FEEDBACK_COPY.error.search, {
              traceId: res.traceId,
              retry: () => runSearch(),
              source: 'search',
            }),
          );
          return;
        }
        setResults(res.data?.results ?? []);
      })
      .catch(() => {
        setResults([]);
        setFetchError(
          errorFeedback(FEEDBACK_COPY.error.network, {
            retry: () => runSearch(),
            source: 'search',
          }),
        );
      })
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const hasApiError = Boolean(fetchError);
  const showEmpty = !loading && !hasApiError && query.trim() && results.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="task-workspace-title text-2xl font-semibold tracking-tight text-slate-900">Tìm kiếm</h1>
        {query ? (
          <p className="mt-1 text-sm text-slate-600">Kết quả cho &quot;{query}&quot;</p>
        ) : (
          <p className="mt-1 text-sm text-slate-600">Nhập từ khóa ở thanh trên để tìm.</p>
        )}
      </div>

      {fetchError && <RuntimeFeedbackMessage feedback={fetchError} />}

      {loading && <LoadingState message={FEEDBACK_COPY.pending.search} />}
      {showEmpty && <EmptyState {...EMPTY_COPY.search} />}

      {!loading && !hasApiError && results.length > 0 && (
        <WorkQueue title={`${results.length} kết quả`}>
          {results.map((r) => (
            <Link
              key={`${r.module}-${r.id}`}
              to={r.href}
              className="panel block p-4 hover:border-border-soft"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{r.title}</span>
                <StatusBadge status={MODULE_LABEL[r.module] ?? r.module} variant="readonly" />
              </div>
              <p className="mt-1 text-sm text-slate-600">{r.subtitle}</p>
            </Link>
          ))}
        </WorkQueue>
      )}
    </div>
  );
}
