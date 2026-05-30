import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';
import { RuntimeFeedbackMessage } from '@/components/ui/RuntimeFeedbackMessage';
import { useWorkInboxSearchRuntime } from './useWorkInboxSearchRuntime';
import { WorkInboxSearchOverlay, useWorkInboxSearchKeyboard } from './WorkInboxSearchOverlay';

interface WorkInboxSearchTopBarFieldProps {
  onLegacySearchNavigate: (query: string) => void;
}

export function WorkInboxSearchTopBarField({ onLegacySearchNavigate }: WorkInboxSearchTopBarFieldProps) {
  const location = useLocation();
  const onInbox = isWorkInboxRoute(location.pathname);
  const runtime = useWorkInboxSearchRuntime();
  const {
    bridgeActive,
    open,
    query,
    setQuery,
    inputRef,
    openPanel,
    closePanel,
    openSelected,
    results,
  } = runtime;

  const [emptyHint, setEmptyHint] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useWorkInboxSearchKeyboard(runtime, {
    enabled: onInbox && bridgeActive,
    onCtrlK: openPanel,
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setEmptyHint(true);
      return;
    }
    setEmptyHint(false);
    if (onInbox && bridgeActive) {
      openPanel();
      if (results.length > 0) openSelected(results[0]);
      return;
    }
    onLegacySearchNavigate(trimmed);
  }

  if (onInbox && bridgeActive) {
    return (
      <div ref={wrapRef} className="work-inbox-search-topbar relative flex flex-1 flex-col">
        <form onSubmit={handleSubmit} className="flex flex-1 gap-1">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setEmptyHint(false);
              if (!open) openPanel();
            }}
            onFocus={() => openPanel()}
            placeholder={FEEDBACK_COPY.hint.searchPlaceholder}
            aria-label={FEEDBACK_COPY.hint.searchPlaceholder}
            aria-expanded={open}
            className="operational-topbar-input flex-1"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="operational-topbar-search-clear"
              onClick={() => {
                setQuery('');
                closePanel();
              }}
            >
              ✕
            </button>
          )}
        </form>
        <WorkInboxSearchOverlay query={query} open={open} onClose={closePanel} runtime={runtime} />
        <RuntimeFeedbackMessage
          feedback={
            emptyHint
              ? {
                  state: 'empty',
                  severity: 'info',
                  message: FEEDBACK_COPY.hint.searchEmpty,
                  source: 'search',
                }
              : null
          }
          compact
          className="mt-0.5"
        />
      </div>
    );
  }

  return <LegacySearchField onNavigate={onLegacySearchNavigate} />;
}

function LegacySearchField({ onNavigate }: { onNavigate: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [emptyHint, setEmptyHint] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = query.trim();
          if (!trimmed) {
            setEmptyHint(true);
            return;
          }
          setEmptyHint(false);
          onNavigate(trimmed);
        }}
        className="flex flex-1 gap-1"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setEmptyHint(false);
          }}
          placeholder={FEEDBACK_COPY.hint.searchPlaceholder}
          aria-label={FEEDBACK_COPY.hint.searchPlaceholder}
          className="operational-topbar-input flex-1"
        />
      </form>
      <RuntimeFeedbackMessage
        feedback={
          emptyHint
            ? { state: 'empty', severity: 'info', message: FEEDBACK_COPY.hint.searchEmpty, source: 'search' }
            : null
        }
        compact
        className="mt-0.5"
      />
    </div>
  );
}
