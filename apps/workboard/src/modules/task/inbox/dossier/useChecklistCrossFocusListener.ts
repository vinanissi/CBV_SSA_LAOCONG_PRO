/**
 * PHASE_DOSSIER_04 — center checklist listens for dossier focus requests.
 */

import { useEffect, useRef, useState } from 'react';
import { subscribeDossierCrossFocus } from './dossierCrossFocusBus';
import { scrollToChecklistItemDom } from './dossierCrossFocusNavigation';
import type { DossierFocusRequest } from './dossierCrossFocusTypes';

const HIGHLIGHT_MS = 2600;

export interface UseChecklistCrossFocusListenerOptions {
  taskId: string;
  checklistItemIds: string[];
  archivedItemIds: string[];
  setItemExpanded: (checklistItemId: string, expanded: boolean) => void;
  ensureArchivedVisible: () => void;
}

export function useChecklistCrossFocusListener(options: UseChecklistCrossFocusListenerOptions) {
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handle = (request: DossierFocusRequest) => {
      if (request.taskId.trim() !== options.taskId.trim()) return;

      const checklistItemId = request.checklistItemId?.trim();
      if (!checklistItemId) return;

      const known = new Set(options.checklistItemIds.map((id) => id.trim()));
      if (!known.has(checklistItemId)) return;

      if (options.archivedItemIds.includes(checklistItemId)) {
        options.ensureArchivedVisible();
      }

      if (request.behavior.expand) {
        options.setItemExpanded(checklistItemId, true);
      }

      if (request.behavior.highlight) {
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        setHighlightedItemId(checklistItemId);
        clearTimerRef.current = setTimeout(() => {
          setHighlightedItemId(null);
          clearTimerRef.current = null;
        }, HIGHLIGHT_MS);
      }

      if (request.behavior.scroll) {
        window.requestAnimationFrame(() => {
          window.setTimeout(() => scrollToChecklistItemDom(checklistItemId), 80);
        });
      }
    };

    return subscribeDossierCrossFocus(handle);
  }, [
    options.taskId,
    options.checklistItemIds,
    options.archivedItemIds,
    options.setItemExpanded,
    options.ensureArchivedVisible,
  ]);

  useEffect(
    () => () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    },
    [],
  );

  return { highlightedItemId };
}
