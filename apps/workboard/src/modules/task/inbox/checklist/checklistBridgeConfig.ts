/**
 * PHASE_CHECKLIST_11 — feature flag for Sheet/Drive bridge (default off per ADR).
 */

const BRIDGE_LS_KEY = 'cbv-checklist-sheet-bridge:v1';

function viteBridgeFlag(): string | undefined {
  try {
    return import.meta.env?.VITE_CHECKLIST_SHEET_BRIDGE_ENABLED;
  } catch {
    return undefined;
  }
}

export function isChecklistSheetBridgeEnabled(): boolean {
  const flag = viteBridgeFlag();
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(BRIDGE_LS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setChecklistSheetBridgeEnabled(enabled: boolean): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (enabled) localStorage.setItem(BRIDGE_LS_KEY, 'true');
    else localStorage.removeItem(BRIDGE_LS_KEY);
  } catch {
    /* ignore */
  }
}
