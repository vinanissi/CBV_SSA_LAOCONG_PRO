import { useCallback } from 'react';
import { WorkInboxSearchResults } from './WorkInboxSearchResults';
import { useWorkInboxSearchRuntime } from './useWorkInboxSearchRuntime';

interface WorkInboxSearchOverlayProps {
  query: string;
  open: boolean;
  onClose: () => void;
  runtime: ReturnType<typeof useWorkInboxSearchRuntime>;
}

export function WorkInboxSearchOverlay({
  query,
  open,
  onClose,
  runtime,
}: WorkInboxSearchOverlayProps) {
  if (!open) return null;

  const { results, selectedIndex, recent, openSelected, applyRecent } = runtime;

  return (
    <>
      <div className="work-inbox-search-panel__backdrop" aria-hidden onClick={onClose} />
      <div
        className="work-inbox-search-panel"
        role="dialog"
        aria-label="Tìm kiếm vận hành"
        data-cbv-panel="work-inbox-search-panel"
      >
        <p className="work-inbox-search-panel__title">🔍 Tìm kiếm</p>
        {query.trim() && <p className="work-inbox-search-panel__query">{query.trim()}</p>}

        <WorkInboxSearchResults
          results={results}
          selectedIndex={selectedIndex}
          onSelect={(r) => openSelected(r)}
          emptyQuery={!query.trim()}
        />

        {recent.length > 0 && !query.trim() && (
          <div className="work-inbox-search-panel__recent">
            <p className="work-inbox-search-panel__recent-label">Recent</p>
            <ul>
              {recent.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    className="work-inbox-search-panel__recent-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyRecent(term)}
                  >
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="work-inbox-search-panel__hints">
          ↑ ↓ chọn · Enter mở · Esc đóng
        </p>
      </div>
    </>
  );
}

export function useWorkInboxSearchKeyboard(
  runtime: ReturnType<typeof useWorkInboxSearchRuntime>,
  opts: { enabled: boolean; onCtrlK: () => void },
) {
  const { open, closePanel, openSelected, moveSelection, openPanel } = runtime;

  return useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        opts.onCtrlK();
        openPanel();
        return;
      }
      if (!opts.enabled || !open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveSelection(1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveSelection(-1);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        openSelected();
      }
    },
    [opts.enabled, opts.onCtrlK, open, closePanel, openSelected, moveSelection, openPanel],
  );
}
