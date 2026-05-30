import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildWorkInboxSearchIndex } from './workInboxSearchIndex';
import { getWorkInboxSearchBridge } from './workInboxSearchBridgeRegistry';
import { loadRecentSearches, pushRecentSearch } from './workInboxRecentSearchStore';
import { searchWorkInboxLocalQueue } from './workInboxSearchRuntime';
import type { WorkInboxSearchResult } from './workInboxSearchTypes';
import { WORK_INBOX_SEARCH_DEBOUNCE_MS } from './workInboxSearchTypes';

export function useWorkInboxSearchRuntime() {
  const bridge = getWorkInboxSearchBridge();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => loadRecentSearches());
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => {
    if (!bridge) return [];
    return buildWorkInboxSearchIndex(bridge.focusItems, bridge.tasks);
  }, [bridge]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchWorkInboxLocalQueue(index, debouncedQuery);
  }, [index, debouncedQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), WORK_INBOX_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, results.length]);

  const openPanel = useCallback(() => {
    setOpen(true);
    setRecent(loadRecentSearches());
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
  }, []);

  const openSelected = useCallback(
    (result?: WorkInboxSearchResult) => {
      const hit = result ?? results[selectedIndex];
      if (!hit || !bridge) return;
      const q = query.trim() || hit.taskId;
      setRecent(pushRecentSearch(q));
      bridge.enterFocus();
      bridge.openSearchResult(hit, q);
      setOpen(false);
      setQuery('');
      setDebouncedQuery('');
    },
    [bridge, query, results, selectedIndex],
  );

  const applyRecent = useCallback((term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    inputRef.current?.focus();
  }, []);

  const moveSelection = useCallback(
    (delta: number) => {
      if (results.length === 0) return;
      setSelectedIndex((i) => (i + delta + results.length) % results.length);
    },
    [results.length],
  );

  return {
    bridgeActive: Boolean(bridge),
    open,
    query,
    setQuery,
    results,
    selectedIndex,
    recent,
    inputRef,
    openPanel,
    closePanel,
    openSelected,
    applyRecent,
    moveSelection,
    queueSize: bridge?.focusItems.length ?? 0,
  };
}
