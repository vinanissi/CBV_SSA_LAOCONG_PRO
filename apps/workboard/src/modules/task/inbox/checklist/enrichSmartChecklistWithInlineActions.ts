/**
 * PHASE_CHECKLIST_03B_INLINE_ACTIONS — attach derived inline actions to read model.
 */

import { deriveChecklistInlineActions } from './deriveChecklistInlineActions';
import type { SmartChecklistItem } from './smartChecklistTypes';

export function enrichSmartChecklistWithInlineActions(
  item: SmartChecklistItem,
  allowMutate = true,
): SmartChecklistItem {
  return {
    ...item,
    inlineActions: deriveChecklistInlineActions(item, allowMutate),
  };
}
