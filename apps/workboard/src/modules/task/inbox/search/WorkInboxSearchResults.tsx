import type { WorkInboxSearchResult } from './workInboxSearchTypes';

interface WorkInboxSearchResultsProps {
  results: WorkInboxSearchResult[];
  selectedIndex: number;
  onSelect: (result: WorkInboxSearchResult, index: number) => void;
  emptyQuery: boolean;
}

export function WorkInboxSearchResults({
  results,
  selectedIndex,
  onSelect,
  emptyQuery,
}: WorkInboxSearchResultsProps) {
  if (!emptyQuery && results.length === 0) {
    return <p className="work-inbox-search-panel__empty">Không có kết quả trong hàng đợi hiện tại</p>;
  }

  if (emptyQuery) return null;

  return (
    <ul className="work-inbox-search-panel__results" role="listbox">
      {results.map((r, i) => (
        <li key={r.taskId} role="option" aria-selected={i === selectedIndex}>
          <button
            type="button"
            className={
              i === selectedIndex
                ? 'work-inbox-search-panel__result active'
                : 'work-inbox-search-panel__result'
            }
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(r, i)}
          >
            <span className="work-inbox-search-panel__result-id">📋 {r.taskId}</span>
            <span className="work-inbox-search-panel__result-title">{r.title}</span>
            {r.assignee && (
              <span className="work-inbox-search-panel__result-meta">{r.assignee}</span>
            )}
            <span className="work-inbox-search-panel__result-pos">
              #{r.position} · {r.matchType}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
