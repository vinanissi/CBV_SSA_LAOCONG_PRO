/**
 * PHASE_DOSSIER_04 — dossier panel hook to request checklist focus.
 */

import { useCallback, useState } from 'react';
import type { DossierGroup, DossierItem } from './dossierAggregateTypes';
import {
  buildDossierFocusRequestFromGroup,
  buildDossierFocusRequestFromItem,
  requestDossierCrossFocus,
} from './dossierCrossFocusNavigation';
import type { DossierFocusResult } from './dossierCrossFocusTypes';

export interface UseDossierCrossFocusNavigationOptions {
  taskId: string;
  checklistItemIds: string[];
}

export function useDossierCrossFocusNavigation(options: UseDossierCrossFocusNavigationOptions) {
  const [lastResult, setLastResult] = useState<DossierFocusResult | null>(null);

  const focusFromItem = useCallback(
    (item: DossierItem) => {
      const request = buildDossierFocusRequestFromItem(item, options.taskId);
      const result = requestDossierCrossFocus(request, options.checklistItemIds);
      setLastResult(result);
      return result;
    },
    [options.taskId, options.checklistItemIds],
  );

  const focusFromGroup = useCallback(
    (group: DossierGroup) => {
      const request = buildDossierFocusRequestFromGroup(group, options.taskId);
      if (!request) {
        const result: DossierFocusResult = {
          ok: true,
          status: 'GO_WITH_WARNINGS',
          taskId: options.taskId,
          checklistItemId: null,
          dossierItemId: null,
          focused: false,
          scrolled: false,
          highlighted: false,
          expanded: false,
          message: 'Tài liệu cấp task, không gắn với bước checklist.',
          warnings: ['task_level_group'],
          errors: [],
        };
        setLastResult(result);
        return result;
      }
      const result = requestDossierCrossFocus(request, options.checklistItemIds);
      setLastResult(result);
      return result;
    },
    [options.taskId, options.checklistItemIds],
  );

  const clearFocusMessage = useCallback(() => setLastResult(null), []);

  return {
    lastResult,
    focusFromItem,
    focusFromGroup,
    clearFocusMessage,
  };
}
