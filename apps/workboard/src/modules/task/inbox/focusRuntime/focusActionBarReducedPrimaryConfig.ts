/**
 * PHASE_UI_ACTION_BAR_REDUCE_PRIMARY_ACTIONS — minimal sticky primary set.
 */

export const REDUCED_PRIMARY_ACTION_BAR = {
  reducedPrimaryActionsEnabled: true as boolean,
  primaryActions: {
    pause: true,
    transfer: true,
    complete: true,
    more: true,
  },
  demotedActions: {
    openDetail: true,
  },
  openDetailAccessibleViaMoreOrRightPanel: true,
  actionHandlersReused: true,
  taskDataMutationAllowedByLayout: false,
  queueMutationAllowedByLayout: false,
  contentBottomPaddingPreserved: true,
};

const FULL_PRIMARY_BAR_LS_KEY = 'cbv-focus-full-primary-action-bar:v1';

function viteFullPrimaryBarFlag(): string | undefined {
  try {
    return import.meta.env?.VITE_FOCUS_FULL_PRIMARY_ACTION_BAR;
  } catch {
    return undefined;
  }
}

/** Rollback: localStorage or VITE_FOCUS_FULL_PRIMARY_ACTION_BAR=true */
export function isFullPrimaryActionBarEnabled(): boolean {
  const flag = viteFullPrimaryBarFlag();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(FULL_PRIMARY_BAR_LS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isReducedPrimaryActionBarEnabled(): boolean {
  return !isFullPrimaryActionBarEnabled();
}
