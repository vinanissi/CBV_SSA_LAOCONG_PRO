/**
 * PHASE_DOSSIER_05 — hook to build and run dossier actions.
 */

import { useCallback, useState } from 'react';
import type { DossierItem } from './dossierAggregateTypes';
import { buildDossierActionsForItem, executeDossierAction } from './dossierActions';
import type { DossierAction, DossierActionResult } from './dossierActionsTypes';
import type { DossierFocusResult } from './dossierCrossFocusTypes';

export interface UseDossierActionsRuntimeOptions {
  onFocusChecklistItem: (item: DossierItem) => DossierFocusResult;
}

export function useDossierActionsRuntime(options: UseDossierActionsRuntimeOptions) {
  const [lastActionResult, setLastActionResult] = useState<DossierActionResult | null>(null);

  const buildActions = useCallback((item: DossierItem): DossierAction[] => {
    return buildDossierActionsForItem(item);
  }, []);

  const runAction = useCallback(
    async (action: DossierAction, item: DossierItem) => {
      const result = await executeDossierAction(action, item, {
        onFocusChecklistItem: options.onFocusChecklistItem,
      });
      setLastActionResult(result);
      return result;
    },
    [options.onFocusChecklistItem],
  );

  const clearActionMessage = useCallback(() => setLastActionResult(null), []);

  return {
    buildActions,
    runAction,
    lastActionResult,
    clearActionMessage,
  };
}
