/**
 * Phase C — optional kill-switch (Vite env). Default enabled when unset.
 */
export function isWorkInboxGroupsV3Enabled(): boolean {
  const flag = import.meta.env.VITE_CBV_WORK_INBOX_GROUPS_V3;
  return flag !== 'false' && flag !== '0';
}

/** Phase E — Focus Mode V3; requires groups V3 unless explicitly disabled. */
export function isWorkInboxFocusV3Enabled(): boolean {
  if (!isWorkInboxGroupsV3Enabled()) return false;
  const flag = import.meta.env.VITE_CBV_WORK_INBOX_FOCUS_V3;
  return flag !== 'false' && flag !== '0';
}

/** Final Focus Runtime layout (single-task workspace + right tabs). Default on when unset. */
export function isWorkInboxFocusRuntimeEnabled(): boolean {
  if (!isWorkInboxFocusV3Enabled()) return false;
  const flag = import.meta.env.VITE_CBV_WORK_INBOX_FOCUS_RUNTIME;
  return flag !== 'false' && flag !== '0';
}

/** Open Focus Runtime by default on /inbox (not list-first). Default on when unset. */
export function isWorkInboxFocusRuntimeDefault(): boolean {
  if (!isWorkInboxFocusRuntimeEnabled()) return false;
  const flag = import.meta.env.VITE_CBV_WORK_INBOX_FOCUS_RUNTIME_DEFAULT;
  return flag !== 'false' && flag !== '0';
}
