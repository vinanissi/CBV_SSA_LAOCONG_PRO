/**
 * Developer-only operator UI affordances (PHASE_OPERATOR_FOOTER_DEBUG_HINT_REMOVAL).
 * Footer keyboard shortcut hints render only when VITE_CBV_DEV_MODE=true.
 */
export function isOperatorDevMode(): boolean {
  return import.meta.env.VITE_CBV_DEV_MODE === 'true';
}
