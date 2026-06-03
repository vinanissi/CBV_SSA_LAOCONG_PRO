/**
 * PHASE_UI_ACTION_BAR_STICKY_BOTTOM — focus action bar placement.
 */

export const FOCUS_ACTION_BAR_LAYOUT = {
  stickyBottomEnabled: true as boolean,
  centerInlineActionBarVisible: false as boolean,
  actionsPreserved: {
    openDetail: true,
    pause: true,
    transfer: true,
    complete: true,
    more: true,
  },
  actionHandlersReused: true,
  taskDataMutationAllowedByLayout: false,
  queueMutationAllowedByLayout: false,
  contentBottomPaddingApplied: true,
};

const INLINE_ACTION_BAR_LS_KEY = 'cbv-focus-inline-action-bar:v1';

function viteInlineActionBarFlag(): string | undefined {
  try {
    return import.meta.env?.VITE_FOCUS_INLINE_ACTION_BAR;
  } catch {
    return undefined;
  }
}

/** Rollback: localStorage key or VITE_FOCUS_INLINE_ACTION_BAR=true */
export function isCenterInlineActionBarVisible(): boolean {
  const flag = viteInlineActionBarFlag();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(INLINE_ACTION_BAR_LS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isStickyBottomActionBarEnabled(): boolean {
  return !isCenterInlineActionBarVisible();
}

export function validateFocusActionBarLayout(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  layout: typeof FOCUS_ACTION_BAR_LAYOUT & {
    stickyBottomEnabled: boolean;
    centerInlineActionBarVisible: boolean;
  };
  warnings: string[];
} {
  const inline = isCenterInlineActionBarVisible();
  const warnings: string[] = [];
  if (inline) {
    warnings.push('Center inline action bar enabled via rollback flag');
  }
  return {
    ok: true,
    status: warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    layout: {
      ...FOCUS_ACTION_BAR_LAYOUT,
      stickyBottomEnabled: !inline,
      centerInlineActionBarVisible: inline,
    },
    warnings,
  };
}
