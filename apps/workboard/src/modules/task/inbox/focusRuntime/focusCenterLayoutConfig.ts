/**
 * PHASE_UI_CLEANUP_NEXT_TASK_SECTION — center panel layout (focus-first).
 */

export const FOCUS_CENTER_LAYOUT = {
  centerNextTaskBlockVisible: false as boolean,
  queueNavigationPreserved: true,
  previousNextControlsPreserved: true,
  jumpControlsPreserved: true,
  currentTaskFocusPreserved: true,
  taskDataMutationAllowed: false,
  queueMutationAllowed: false,
};

const CENTER_NEXT_TASK_LS_KEY = 'cbv-focus-center-next-task-block:v1';

function viteCenterNextTaskFlag(): string | undefined {
  try {
    return import.meta.env?.VITE_FOCUS_CENTER_NEXT_TASK_BLOCK;
  } catch {
    return undefined;
  }
}

/** Rollback: set localStorage key or VITE_FOCUS_CENTER_NEXT_TASK_BLOCK=true */
export function isCenterNextTaskBlockVisible(): boolean {
  const flag = viteCenterNextTaskFlag();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(CENTER_NEXT_TASK_LS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function validateFocusCenterLayout(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  layout: typeof FOCUS_CENTER_LAYOUT & { centerNextTaskBlockVisible: boolean };
  warnings: string[];
} {
  const visible = isCenterNextTaskBlockVisible();
  const warnings: string[] = [];
  if (visible) {
    warnings.push('Center VIỆC TIẾP THEO block enabled via flag (rollback mode)');
  }
  return {
    ok: true,
    status: warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    layout: {
      ...FOCUS_CENTER_LAYOUT,
      centerNextTaskBlockVisible: visible,
    },
    warnings,
  };
}
